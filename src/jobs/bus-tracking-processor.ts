import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { BusTrackingService } from '../modules/bus-tracking/bus-tracking.service';
import { BusTrackingDto } from '../modules/bus-tracking/dto/bus-tracking.dto';
import { BusRouteInfo } from '../modules/apis/bus-route-info';
import { StopEventService } from '../modules/stop-event/stop-event.service';
import { StopEventDto } from '../modules/stop-event/dto/stop-event-dto';

@Processor('bus-tracking')
export class BusTrackingProcessor {
    private readonly logger = new Logger(BusTrackingProcessor.name);

    constructor(
            @InjectQueue('bus-tracking') private busTrackingQueue: Queue,
            private readonly busService: BusTrackingService,
            private readonly busRouteInfo: BusRouteInfo,
            private readonly stopEventService: StopEventService,
    ) {
    }

    @Process('realtime-bus-tracking')
    async processRealtimeBusTracking(job: Job<{}>) {
        this.logger.log(`Processing realtime bus tracking...`)

        try {
            const busTrackingList = await this.busService.getBusTrackingListForRealtimeBatch()
            this.logger.log(`Realtime bus tracking list: ${busTrackingList.length}`)

            // routeId 별로 중복 제거 (같은 노선은 한 번만 호출)
            const uniqueRoutes = busTrackingList.reduce((acc, busTracking) => {
                if (!acc.find(item => item.routeId === busTracking.routeId)) {
                    acc.push(busTracking);
                }
                return acc;
            }, []);

            this.logger.log(`Unique routes to process: ${uniqueRoutes.length}`)

            const jobs = uniqueRoutes.map(async (busTracking, index) => {
                return await this.busTrackingQueue.add(
                    'realtime-bus-tracking-by-route',
                    {
                        parentJobId: job.id,
                        busTracking: busTracking,
                        batchIndex: index + 1,
                    },
                    {
                        removeOnComplete: false,
                        removeOnFail: false,
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 5000,
                        },
                    }
                )
            })

            await Promise.all(jobs)
            this.logger.log(`Created ${jobs.length} jobs for unique routes`)

        } catch (error) {
            this.logger.error(`Failed to process realtime bus tracking: ${error.message}`)
            throw error;
        }
    }

    @Process({ name: 'realtime-bus-tracking-by-route', concurrency: 10})
    async processRealtimeBusTrackingByRoute(job: Job<{
        parentJobId: string,
        busTracking: BusTrackingDto,
        batchIndex: number,
    }>) {
        const { parentJobId, busTracking, batchIndex } = job.data;
        const startDate = Date.now();

        this.logger.log(`Processing realtime bus tracking by route: ${busTracking.routeName} (${busTracking.routeId})`)

        try {
            const locationResponse = await this.busRouteInfo.getBusLocationList(busTracking.routeId);
            const processingTime = Date.now() - startDate;

            if (!locationResponse) {
                this.logger.error(`Invalid response structure for route ${busTracking.routeId}`,
                    new Error('Invalid response structure'), {
                        jobId: job.id,
                        routeId: busTracking.routeId,
                        routeName: busTracking.routeName,
                        processingTimeMs: processingTime,
                    }
                );
                return {
                    success: false,
                    error: {
                        routeId: busTracking.routeId,
                        routeName: busTracking.routeName,
                        reason: 'Invalid response structure',
                        processingTime
                    }
                }
            }

            if (locationResponse.response.msgHeader.resultCode !== 0) {
                this.logger.error(`Failed to get bus location list for route ${busTracking.routeId}: ${locationResponse.response.msgHeader.resultMessage}`,
                    new Error(locationResponse.response.msgHeader.resultMessage), {
                        jobId: job.id,
                        routeId: busTracking.routeId,
                        routeName: busTracking.routeName,
                        resultCode: locationResponse.response.msgHeader.resultCode,
                        processingTimeMs: processingTime,
                    }
                );
                return {
                    success: false,
                    error: {
                        routeId: busTracking.routeId,
                        routeName: busTracking.routeName,
                        reason: locationResponse.response.msgHeader.resultMessage,
                        processingTime
                    }
                }
            }

            if (locationResponse.response.msgBody?.busLocationList?.length > 0) {
                const locationList = locationResponse.response.msgBody.busLocationList;

                let stopEventLists = [];
                const currentTime = new Date();
                for(const element of locationList) {
                    let stopEvent: StopEventDto = {
                        routeId: element.routeId,
                        vehId: element.vehId,
                        stationId: element.stationId,
                        remainSeatCnt: element.remainSeatCnt,
                        createdDt: currentTime,
                    }

                    stopEventLists.push(stopEvent)
                }

                await this.stopEventService.createStopEventLists(stopEventLists)
                
                this.logger.log(`Successfully processed route ${busTracking.routeName} (${busTracking.routeId}): ${stopEventLists.length} stop events created`, {
                    jobId: job.id,
                    routeId: busTracking.routeId,
                    routeName: busTracking.routeName,
                    stopEventsCount: stopEventLists.length,
                    processingTimeMs: processingTime,
                });

                return {
                    success: true,
                    routeId: busTracking.routeId,
                    routeName: busTracking.routeName,
                    stopEventsCount: stopEventLists.length,
                    processingTime
                }
            } else {
                this.logger.warn(`No bus location data found for route ${busTracking.routeName} (${busTracking.routeId})`, {
                    jobId: job.id,
                    routeId: busTracking.routeId,
                    routeName: busTracking.routeName,
                    processingTimeMs: processingTime,
                });

                return {
                    success: true,
                    routeId: busTracking.routeId,
                    routeName: busTracking.routeName,
                    stopEventsCount: 0,
                    processingTime,
                    message: 'No bus location data found'
                }
            }

        } catch (error) {
            const processingTime = Date.now() - startDate;
            this.logger.error(`Error processing bus-tracking :: ${busTracking.routeName} (${busTracking.routeId})`, error, {
                jobId: job.id,
                parentJobId,
                busTracking: busTracking,
                processingTimeMs: processingTime,
            });
            return {
                success: false,
                error: {
                    routeId: busTracking.routeId,
                    routeName: busTracking.routeName,
                    reason: error.message,
                    processingTime
                }
            };
        }
    }

}