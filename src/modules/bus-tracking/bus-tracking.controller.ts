import { Body, Controller, Get, Post, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseResponse } from '../../models/base/base-response';
import { BusTrackingService } from './bus-tracking.service';
import { BusTrackingDto } from './dto/bus-tracking.dto';
import { BusRouteInfo } from '../apis/bus-route-info';
import { StationService } from '../station/station.service';

@Controller('bus')
export class BusTrackingController {
    private readonly logger = new Logger(BusTrackingController.name);

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
        try {
            // 서버에 등록되어 있는 정보인지를 체크 및 insert
            const station = await this.stationService.getStationWithRouteName(body.stationId, body.routeName)
            if (!station) {
                throw new HttpException('station info is not found', HttpStatus.BAD_REQUEST);
            }

            this.logger.log(`createBusTrackingRoute :: search station info : ${station}`)

            const busTrackingDto: BusTrackingDto = {
                routeName: body.routeName,
                routeId: body.routeId,
                stationId: body.stationId,
                notificationTime: body.notificationTime
            }

            // TODO : API 호출해서 검증할지 말지 결정
            
            // BusTracking 생성 또는 업데이트 (trackingKey 기준으로 upsert)
            await this.busTrackingService.createBusTracking(busTrackingDto, station);

            const response : BaseResponse = {
                result: true,
                data: {
                    trackingKey: `${body.routeName}-${station.stationId}`,
                    routeId: body.routeId,
                    routeName: body.routeName,
                    stationId: station.stationId,
                    stationName: station.stationName
                }
            };


            this.logger.log(`createBusTrackingRoute :: response : ${response}`)
            return response;

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(`Failed to create bus tracking: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

