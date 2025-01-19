import { Module } from '@nestjs/common';
import { BusStopInfo } from './busStopInfo';

@Module({
    providers: [BusStopInfo]
})

export class ApiModule {}