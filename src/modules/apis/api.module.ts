import { Module } from '@nestjs/common';
import { BusStopInfo } from './bus-stop-info';
import { BusRouteInfo } from './bus-route-info';
import { SlackApi } from './slack-api';

@Module({
    providers: [
        BusStopInfo,
        BusRouteInfo,
        SlackApi,
    ],
    exports: [
        BusStopInfo,
        BusRouteInfo,
        SlackApi,
    ]
})

export class ApiModule {}