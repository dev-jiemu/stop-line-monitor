import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Station } from '../schemas/station.schema';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class StationUpdateService {
    constructor(
            @InjectModel(Station.name) private stationModel: Model<Station>
    ) {}

    private readonly logger = new Logger(StationUpdateService.name)

    // 매 오전 10시
    @Cron('0 0 10 * * *')
    async updateStationRoutes() {
        const DAILY_LIMIT = 500 // 하루 500개까지만 호출

        this.logger.log('Starting station routes update...')


        // TODO : fetch route list
        // 1. 오래된 업데이트 순으로 최대 500개씩 끊어서 가져올것
        // 2. update 하는 로직 호출
    }
}