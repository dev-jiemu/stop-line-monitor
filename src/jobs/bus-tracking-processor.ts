import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { BusService } from '../modules/bus/bus.service';
import { BusDto } from '../modules/bus/dto/bus-dto';
import { BusRouteInfo } from '../modules/apis/bus-route-info';

@Processor('bus-tracking')
export class BusTrackingProcessor {
    private readonly logger = new Logger(BusTrackingProcessor.name);

    constructor(
            @InjectQueue('bus-tracking') private busTrackingQueue: Queue,
            private readonly busService: BusService,
            private readonly busRouteInfo: BusRouteInfo,
    ) {
    }

    @Process('realtime-bus-tracking')
    async processRealtimeBusTracking(job: Job<{}>) {
        this.logger.log(`Processing realtime bus tracking...`)

        try {
            const busTrackingList = await this.busService.getBusListForRealtimeBatch()
            this.logger.log(`Realtime bus tracking list: ${busTrackingList.length}`)

            // routeId 별로 '별도 배치 처리'
            // routeId를 활용해서 index 잡을까...?
            let batchIndex = 0;

            const jobs = busTrackingList.map(async (bus) => {
                return await this.busTrackingQueue.add(
                    'realtime-bus-tracking-by-route',
                    {
                        parentJobId: job.id,
                        bus: bus,
                        batchIndex: batchIndex + 1,
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
            this.logger.log(`Created ${jobs.length} jobs`)

        } catch (error) {
            this.logger.error(`Failed to process realtime bus tracking: ${error.message}`)
            throw error;
        }
    }

    @Process({ name: 'realtime-bus-tracking-by-route', concurrency: 10})
    async processRealtimeBusTrackingByRoute(job: Job<{
        parentJobId: string,
        bus: BusDto,
        batchIndex: number,
    }>) {
        const { parentJobId, bus, batchIndex } = job.data;
        const startDate = Date.now();

        this.logger.log(`Processing realtime bus tracking by route...`)

        try {
            const locationResponse = await this.busRouteInfo.getBusLocationList(bus.routeId);

            // TODO : insert realtime data

        } catch (error) {
            this.logger.error(`Error processing station ${bus.routeId}`, error, {
                jobId: job.id,
                parentJobId,
                bus: bus,
            });
            return {
                success: false,
                error: {
                    routeId: bus.routeId,
                    reason: error.message
                }
            };
        }
    }

}