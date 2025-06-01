import { Body, Controller, Get, Post } from '@nestjs/common';
import { BaseResponse } from '../../models/base/base-response';
import { BusService } from './bus.service';
import { CreateBusTrackingRouteDto } from './dto/bus-tracking.dto';
import { BusRouteInfo } from '../apis/bus-route-info';

@Controller('bus')
export class BusController {
    constructor(
            private readonly busService: BusService,
            private readonly busRouteInfo: BusRouteInfo,
    ) {}

    @Get("/routes")
    async getBusRoutes() {
        let response : BaseResponse = {
            result: false,
        }

        // TODO : 버스 노선 리스트 조회 : 근데 이거 api 자체가 like 검색인거 같은데?;;;;

        return response;
    }

    @Post("/tracking/routes")
    async createBusTrackingRoute(@Body() body : CreateBusTrackingRouteDto) {
        let response : BaseResponse = {
            result: false,
        }

        // routeId 에 해당하는 버스 노선 정보 체크 : public-api
        let routeInfo = await this.busRouteInfo.getBusRouteInfo(body.routeId)
        if (!routeInfo.response.msgBody?.busRouteInfoItem) {
            response.reason = 'Invalid routeId'
            return response;
        }

        // TODO : upsert bus info

        return response;
    }
}

