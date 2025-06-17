import { Body, Controller, Get, Post } from '@nestjs/common';
import { BaseResponse } from '../../models/base/base-response';
import { BusTrackingService } from './bus-tracking.service';
import { BusTrackingDto } from './dto/bus-tracking.dto';
import { BusRouteInfo } from '../apis/bus-route-info';
import { StationService } from '../station/station.service';
import { BusTracking } from './schemas/bus-tracking.schema';

@Controller('bus')
export class BusTrackingController {
    constructor(
            private readonly busTrackingService: BusTrackingService,
            private readonly busRouteInfo: BusRouteInfo,
            private readonly stationService: StationService,
    ) {}

    @Get("/tracking")
    async getBusRoutes() {
        let response : BaseResponse = {
            result: false,
        }

        return response;
    }

    @Post("/tracking")
    async createBusTrackingRoute(@Body() body : BusTrackingDto) {
        let response : BaseResponse = {
            result: false,
        }

        // 서버에 등록되어 있는 정보인지를 체크 및 insert
        const station = await this.stationService.getStationWithRouteName(body.stationId, body.routeName)
        if (!station) {
            response.reason = "station info is not found"
            return response;
        }

        let trackingKey = `${body.routeName}-${station.stationId}`


        return response;
    }
}

