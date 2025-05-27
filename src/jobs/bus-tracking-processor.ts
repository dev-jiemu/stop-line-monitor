import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Queue } from 'bull';


@Processor('bus-tracking')
export class BusTrackingProcessor {
    private readonly logger = new Logger(BusTrackingProcessor.name);
    private readonly BATCH_SIZE = 20;

    constructor(
            @InjectQueue('bus-tracking') private busTrackingQueue: Queue,
            // TODO :
    ) {
    }

    @Process('realtime-bus-tracking')
    async processRealtimeBusTracking() {
        this.logger.log(`Processing realtime bus tracking...`)

        try {

        } catch (error) {
            this.logger.error(`Failed to process realtime bus tracking: ${error.message}`)
            throw error;
        }
    }

}