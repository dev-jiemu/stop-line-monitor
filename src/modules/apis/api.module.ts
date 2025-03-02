import { Module } from '@nestjs/common';
import { BusStopInfo } from './bus-stop-info';

@Module({
    providers: [BusStopInfo]
})

export class ApiModule {}