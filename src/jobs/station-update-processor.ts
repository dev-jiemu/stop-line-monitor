import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { StationService } from '../modules/station/station.service';
import { Job, Queue } from 'bull';
import { BusRouteInfo } from '../modules/apis/bus-route-info';
import { StationDto, StationRouteDto } from '../modules/station/dto/station-dto';
import { BusRouteListResponse } from '../interfaces/bus-route-list-response';
import { Logger } from '@nestjs/common';

@Processor('station-update')
export class StationUpdateProcessor {
    private readonly logger = new Logger(StationUpdateProcessor.name);
    private readonly BATCH_SIZE = 20; // 한 번에 업데이트할 정류장 수 (메모리 관리를 위해)
    private readonly API_DELAY_MS = 500;

    constructor(
            @InjectQueue('station-update') private stationQueue: Queue, // 큐 여러개 등록할려구
            private readonly stationService: StationService,
            private readonly busRouteInfo: BusRouteInfo,
    ) {
    }

    /**
     processUpdateStationRoutes : 정류장 별 노선 정보 업데이트하는 배치 (deprecated)
     */
    @Process('update-station-routes')
    async processUpdateStationRoutes(job: Job<{ limit: number }>) {
        const { limit } = job.data;
        this.logger.log(`Processing update station routes job with limit: ${limit}`)

        try {
            const stationList = await this.stationService.getStationListForBatch(limit);
            this.logger.log(`Retrieved ${stationList.length} stations for update`)

            // 진행상황 표시 (0%)
            await job.progress(0);

            // 배치 처리를 위한 준비
            const totalBatches = Math.ceil(stationList.length / this.BATCH_SIZE);
            let processedCount = 0;
            let failedStations = [];

            // 배치 단위로 처리
            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const startIdx = batchIndex * this.BATCH_SIZE;
                const endIdx = Math.min(startIdx + this.BATCH_SIZE, stationList.length);
                const currentBatch = stationList.slice(startIdx, endIdx);

                let updateStationList: StationDto[] = [];

                // 현재 배치의 각 정류장 처리
                for (let i = 0; i < currentBatch.length; i++) {
                    const station = currentBatch[i];
                    try {
                        // 경유노선 번호 가져옴
                        const routeResponse = await this.busRouteInfo.getBusRouteList(station.stationId);

                        if (routeResponse.response.msgHeader.resultCode !== 0) {
                            this.logger.error(`Failed to get routes for station ${station.stationId}: ${routeResponse.response.msgHeader.resultMessage}`);
                            failedStations.push({
                                stationId: station.stationId,
                                reason: routeResponse.response.msgHeader.resultMessage,
                            });
                        } else if (routeResponse.response.msgBody?.busRouteList?.length > 0) {
                            station.routes = station.routes || []; // 필드가 없으면 초기화

                            let routeList = routeResponse.response.msgBody.busRouteList;
                            this.logger.debug(`Retrieved ${routeList.length} routes for station: ${station.stationId}`);

                            let routes: StationRouteDto[] = routeList.map(element => ({
                                routeId: element.routeId,
                                routeDestId: element.routeDestId,
                                routeName: String(element.routeName), // 문자열로 변환
                            }));

                            // 정류장 정보 업데이트
                            station.routes = routes;
                        } else {
                            // API에서 노선 정보가 없는 경우
                            this.logger.debug(`No routes found for station: ${station.stationId}`);
                            station.routes = [];
                        }

                        updateStationList.push(station);

                    } catch (error) {
                        this.logger.error(`Error processing station ${station.stationId}: ${error.message}`);
                        failedStations.push({
                            stationId: station.stationId,
                            reason: error.message,
                        });
                    }

                    // API 요청 간 딜레이 (속도 제한 회피)
                    if (i < currentBatch.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, this.API_DELAY_MS));
                    }

                    // 전체 진행률 업데이트
                    processedCount++;
                    await job.progress(Math.floor(processedCount / stationList.length * 100));
                }

                // 현재 배치 업데이트
                if (updateStationList.length > 0) {
                    this.logger.log(`Updating batch ${batchIndex + 1}/${totalBatches} with ${updateStationList.length} stations`)
                    await this.stationService.updateStationLists(updateStationList)
                }
            }

            // 작업 완료
            await job.progress(100)

            // 실패한 정류장 정보 로깅
            if (failedStations.length > 0) {
                this.logger.warn(`Failed to update ${failedStations.length} stations`)
            }

            return {
                processed: processedCount,
                updated: processedCount - failedStations.length,
                failed: failedStations.length,
                failedStations: failedStations.length > 0 ? failedStations : undefined
            }
        } catch (error) {
            this.logger.error(`Error processing update station routes job: ${error.message}`)
            throw error // Bull이 자동으로 재시도할 수 있도록 에러를 throw
        }
    }

    @Process('schedule-station-updates')
    async processScheduleStationUpdates(job: Job<{ limit: number }>) {
        const { limit } = job.data
        this.logger.log(`Processing schedule station updates job with limit: ${limit}`)

        try {
            const stationList = await this.stationService.getStationListForBatch(limit)
            this.logger.log(`Retrieved ${stationList.length} stations for scheduling`)

            // 스테이션 목록을 배치로 분할
            const totalBatches = Math.ceil(stationList.length / this.BATCH_SIZE)
            const jobPromises = []

            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const startIdx = batchIndex * this.BATCH_SIZE
                const endIdx = Math.min(startIdx + this.BATCH_SIZE, stationList.length)
                const batchStations = stationList.slice(startIdx, endIdx)

                // 각 배치를 별도의 Bull 작업으로 큐에 추가
                const jobPromise = this.stationQueue.add('process-station-batch', {
                    batchIndex: batchIndex + 1,
                    totalBatches,
                    stations: batchStations,
                    parentJobId: job.id,
                }, {
                    removeOnComplete: false, // 일단 확인을 위해 전부 다남김
                    removeOnFail: false,
                    attempts: 2,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                })

                jobPromises.push(jobPromise)
            }

            // queue add
            await Promise.all(jobPromises)

            this.logger.log(`Scheduled ${totalBatches} batch jobs for parallel processing`)
            return {
                scheduled: true,
                totalBatches,
                totalStations: stationList.length,
            }

        } catch (error) {
            this.logger.error(`Error processing update station routes job: ${error.message}`)
            throw error
        }
    }

    /**
     * processStationBatch : route update 하는 배치 본로직
     * @param job
     */
    @Process({ name: 'process-station-batch', concurrency: 5 })
    async processStationBatch(job: Job<{
        batchIndex: number
        totalBatches: number
        stations: StationDto[]
        parentJobId: string
    }>) {
        const { batchIndex, totalBatches, stations, parentJobId } = job.data;
        const startTime = Date.now();
        
        this.logger.log(`Processing batch ${batchIndex}/${totalBatches} with ${stations.length} stations (Parent Job: ${parentJobId})`, {
            jobId: job.id,
            parentJobId,
            batchIndex,
            totalBatches,
            stationCount: stations.length,
            startTime: new Date(startTime).toISOString()
        });

        try {
            let updateStationList: StationDto[] = [];
            let failedStations = [];

            // 이것도 병렬처리
            const stationPromises = stations.map(async (station, index) => {
                try {
                    // 스테이션별 처리 시작 시간 기록
                    const stationStartTime = Date.now();

                    await new Promise(resolve => setTimeout(resolve, index * 50));

                    const routeResponse = await this.busRouteInfo.getBusRouteList(station.stationId);
                    const processingTime = Date.now() - stationStartTime;

                    // response object type check
                    if (!this.isValidBusRouteResponse(routeResponse)) {
                        this.logger.error(`Invalid response structure for station ${station.stationId}`,
                            new Error('Invalid response structure'), {
                                jobId: job.id,
                                parentJobId,
                                stationId: station.stationId,
                                processingTimeMs: processingTime
                            }
                        );
                        return {
                            success: false,
                            error: {
                                stationId: station.stationId,
                                reason: 'Invalid response structure',
                                processingTime
                            }
                        };
                    }

                    if (routeResponse.response.msgHeader.resultCode !== 0) {
                        this.logger.error(`Failed to get routes for station ${station.stationId}`,
                            new Error(routeResponse.response.msgHeader.resultMessage), {
                                jobId: job.id,
                                parentJobId,
                                stationId: station.stationId,
                                resultCode: routeResponse.response.msgHeader.resultCode,
                                processingTimeMs: processingTime
                            }
                        );
                        return {
                            success: false,
                            error: {
                                stationId: station.stationId,
                                reason: routeResponse.response.msgHeader.resultMessage,
                                processingTime
                            }
                        };
                    }

                    if (routeResponse.response.msgBody?.busRouteList?.length > 0) {
                        const routeList = routeResponse.response.msgBody.busRouteList;
                        this.logger.debug(`Retrieved ${routeList.length} routes for station: ${station.stationId} (${processingTime}ms)`);

                        station.routes = routeList.map(element => ({
                            routeId: element.routeId,
                            routeDestId: element.routeDestId,
                            routeName: String(element.routeName),
                        }));
                    } else {
                        this.logger.debug(`No routes found for station: ${station.stationId} (${processingTime}ms)`);
                        station.routes = [];
                    }

                    return { success: true, station, processingTime };

                } catch (error) {
                    this.logger.error(`Error processing station ${station.stationId}`, error, {
                        jobId: job.id,
                        parentJobId,
                        stationId: station.stationId
                    });
                    return {
                        success: false,
                        error: {
                            stationId: station.stationId,
                            reason: error.message
                        }
                    };
                }
            });

            // 모든 API 호출을 병렬로 실행
            const results = await Promise.allSettled(stationPromises);

            // 결과 처리 및 성능 분석
            let totalProcessingTime = 0;
            let successCount = 0;

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.success) {
                    updateStationList.push(result.value.station);
                    totalProcessingTime += result.value.processingTime || 0;
                    successCount++;
                } else {
                    const error = result.status === 'fulfilled'
                            ? result.value.error
                            : { stationId: stations[index].stationId, reason: 'Promise rejected' };
                    failedStations.push(error);
                }

                // 진행률 업데이트
                job.progress(Math.floor((index + 1) / results.length * 100));
            });

            // 배치 업데이트
            if (updateStationList.length > 0) {
                const dbUpdateStartTime = Date.now();
                await this.stationService.updateStationLists(updateStationList);
                const dbUpdateTime = Date.now() - dbUpdateStartTime;
                
                this.logger.log(`Batch ${batchIndex} DB Update completed in ${dbUpdateTime}ms`, {
                    jobId: job.id,
                    stationsUpdated: updateStationList.length,
                    dbUpdateTimeMs: dbUpdateTime
                });
            }

            // 성능 메트릭 로깅
            const totalBatchTime = Date.now() - startTime;
            const avgProcessingTime = successCount > 0 ? totalProcessingTime / successCount : 0;
            
            const batchResult = {
                batchIndex,
                processed: stations.length,
                updated: updateStationList.length,
                failed: failedStations.length,
                avgProcessingTime,
                totalBatchTimeMs: totalBatchTime,
                failedStations: failedStations.length > 0 ? failedStations : undefined
            };

            this.logger.log(
                `Batch ${batchIndex}/${totalBatches} completed: ` +
                `updated ${updateStationList.length} stations, ` +
                `failed ${failedStations.length}, ` +
                `avg API time: ${avgProcessingTime.toFixed(0)}ms`, 
                {
                    jobId: job.id,
                    parentJobId,
                    ...batchResult
                }
            );

            if (failedStations.length > 0) {
                this.logger.warn(`Batch ${batchIndex}/${totalBatches} failures: ${JSON.stringify(failedStations)}`);
            }

            this.logger.log(`Batch ${batchIndex} total processing completed in ${totalBatchTime}ms`, {
                jobId: job.id,
                stationsProcessed: stations.length,
                successRate: `${((successCount / stations.length) * 100).toFixed(1)}%`,
                totalBatchTimeMs: totalBatchTime
            });

            return batchResult;

        } catch (error) {
            this.logger.error(`Error processing batch ${batchIndex}/${totalBatches}`, error, {
                jobId: job.id,
                parentJobId,
                batchIndex,
                totalBatches
            });
            throw error;
        }
    }


    /**
     * isValidBusRouteResponse : response 객체 타입체크
     * @param response
     * @private
     */
    private isValidBusRouteResponse(response: any): response is BusRouteListResponse {
        return response && response.response && response.response.msgHeader && typeof response.response.msgHeader.resultCode === 'number'
    }
}