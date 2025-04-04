import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetchApiGet } from './axios-client';
import { BusStationResponse } from '../../interfaces/public-api';
import { SIGUN_CD } from '../../constants/codes';

@Injectable()
export class BusStopInfo {
    constructor(private readonly configService: ConfigService) {}

    // pIndex = 페이지 위치, pSize = 페이지 size
    getBusStopInformation = async (pSize: number, pIndex: number) => {
        const reqUrl = this.configService.get('publicApi.stationInfoUrl')
        const serviceKey = this.configService.get('publicApi.serviceKey')

        let url = reqUrl + '?key=' + serviceKey + `&type=json&pSize=${pSize}&pIndex=${pIndex}&SIGUN_CD=${SIGUN_CD}`
        return await fetchApiGet<BusStationResponse>(url)
    }
}

