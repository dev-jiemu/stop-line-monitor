import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { BusService } from '../modules/bus/bus.service';


@Processor('bus-tracking')
export class BusTrackingProcessor {
    private readonly logger = new Logger(BusTrackingProcessor.name);

    constructor(
            @InjectQueue('bus-tracking') private busTrackingQueue: Queue,
            private readonly busService: BusService,
    ) {
    }

    @Process('realtime-bus-tracking')
    async processRealtimeBusTracking() {
        this.logger.log(`Processing realtime bus tracking...`)

        try {
            const busTrackingList = await this.busService.getBusListForRealtimeBatch()
            this.logger.log(`Realtime bus tracking list: ${busTrackingList.length}`)

            // routeId 별로 '별도 배치 처리'
            const jobs = busTrackingList.map(async (bus) => {
                return await this.busTrackingQueue.add(
                    'realtime-bus-tracking-by-route',
                    { bus },
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

    @Process('realtime-bus-tracking-by-route')
    async processRealtimeBusTrackingByRoute(job: any) {
        this.logger.log(`Processing realtime bus tracking by route...`)
    }

}