import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BusStopInfo {
    constructor(private readonly configService: ConfigService) {}

    getBusStopInformation = async () => {
        const reqUrl = this.configService.get('publicApi.stationInfoUrl')
        const serviceKey = this.configService.get('publicApi.serviceKey')

        console.log('reqUrl : ', reqUrl)
        console.log('serviceKey : ', serviceKey)
    }
}

