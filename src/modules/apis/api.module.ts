import { Module } from '@nestjs/common';
import { BusStopInfo } from './bus-stop-info';
import { BusRouteInfo } from './bus-route-info';

@Module({
    providers: [
            BusStopInfo,
            BusRouteInfo,
    ]
})

export class ApiModule {}