import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StationService } from '../modules/station/station.service';
import { InjectModel } from '@nestjs/mongoose';
import { Station } from 'src/schemas/station.schema';
import { Model } from 'mongoose';


@Processor('station-update-queue')
export class StationUpdateProcessor {
    private readonly logger = new Logger(StationUpdateProcessor.name)

    constructor(
            private readonly stationService: StationService,
            @InjectModel(Station.name) private readonly stationModel: Model<Station>,
            private readonly configService: ConfigService
    ) {

    }

    @Process('update-station-routes')
    async processUpdateStationRoutes(job: any) {
        const { limit } = job.data
        this.logger.log(`Processing update station routes job with limit: ${limit}`)

        try {
            const stationList = await this.stationService.getStationListForBatch(limit)
            this.logger.log(`Retrieved ${stationList.length} stations for update`)

            // 진행상황 표시 (0%)
            await job.progress(0)

            const results = []
            for (let i = 0; i < stationList.length; i++) {
                const station = stationList[i]

                // TODO
            }
        } catch (error) {
            this.logger.error(`Error processing update station routes job: ${error.message}`)
        }
    }
}