import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { StationService } from '../modules/station/station.service';
import { Job } from 'bull';
import { BusRouteInfo } from '../modules/apis/bus-route-info';
import { StationDto, StationRouteDto } from '../models/station-dto';

@Processor('station-update-queue')
export class StationUpdateProcessor {
    private readonly logger = new Logger(StationUpdateProcessor.name);
    private readonly BATCH_SIZE = 50 // 한 번에 업데이트할 정류장 수 (메모리 관리를 위해)
    private readonly API_DELAY_MS = 500

    constructor(
        private readonly stationService: StationService,
        private readonly busRouteInfo: BusRouteInfo,
    ) {}

    @Process('update-station-routes')
    async processUpdateStationRoutes(job: Job<{ limit: number }>) {
        const { limit } = job.data
        this.logger.log(`Processing update station routes job with limit: ${limit}`)

        try {
            const stationList = await this.stationService.getStationListForBatch(limit)
            this.logger.log(`Retrieved ${stationList.length} stations for update`)

            // 진행상황 표시 (0%)
            await job.progress(0)

            // 배치 처리를 위한 준비
            const totalBatches = Math.ceil(stationList.length / this.BATCH_SIZE)
            let processedCount = 0
            let failedStations = []

            // 배치 단위로 처리
            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const startIdx = batchIndex * this.BATCH_SIZE
                const endIdx = Math.min(startIdx + this.BATCH_SIZE, stationList.length)
                const currentBatch = stationList.slice(startIdx, endIdx)
                
                let updateStationList: StationDto[] = []

                // 현재 배치의 각 정류장 처리
                for (let i = 0; i < currentBatch.length; i++) {
                    const station = currentBatch[i];
                    try {
                        // 경유노선 번호 가져옴
                        const routeResponse = await this.busRouteInfo.getBusRouteList(station.stationId)

                        if (routeResponse.response.msgHeader.resultCode !== 0) {
                            this.logger.error(`Failed to get routes for station ${station.stationId}: ${routeResponse.response.msgHeader.resultMessage}`)
                            failedStations.push({
                                stationId: station.stationId, 
                                reason: routeResponse.response.msgHeader.resultMessage
                            })
                        } else if (routeResponse.response.msgBody?.busRouteList?.length > 0) {
                            station.routes = station.routes || [] // 필드가 없으면 초기화

                            let routeList = routeResponse.response.msgBody.busRouteList
                            this.logger.debug(`Retrieved ${routeList.length} routes for station: ${station.stationId}`)

                            let routes: StationRouteDto[] = routeList.map(element => ({
                                routeId: element.routeId,
                                routeDestId: element.routeDestId,
                                routeName: element.routeName,
                            }))

                            // 정류장 정보 업데이트
                            station.routes = routes
                        } else {
                            // API에서 노선 정보가 없는 경우
                            this.logger.debug(`No routes found for station: ${station.stationId}`)
                            station.routes = []
                        }

                        updateStationList.push(station)

                    } catch (error) {
                        this.logger.error(`Error processing station ${station.stationId}: ${error.message}`)
                        failedStations.push({
                            stationId: station.stationId, 
                            reason: error.message
                        })
                    }

                    // API 요청 간 딜레이 (속도 제한 회피)
                    if (i < currentBatch.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, this.API_DELAY_MS))
                    }
                    
                    // 전체 진행률 업데이트
                    processedCount++
                    await job.progress(Math.floor(processedCount / stationList.length * 100))
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
}