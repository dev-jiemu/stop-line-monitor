import { Controller, Get } from '@nestjs/common';
import {type BaseResponse} from '../../models/base/baseResponse'
import { ConfigService } from '@nestjs/config';
import { BusStopInfo } from '../../apis/busStopInfo';

@Controller('public')
export class PublicController {

    constructor(private busStopInfo: BusStopInfo) {}

    @Get('/bus-stop')
    async getBusStopList() : Promise<BaseResponse> {
        let response: BaseResponse = {
            result: false,
        }

        // request public-api
        await this.busStopInfo.getBusStopInformation()

        return response
    }
}
