import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetchApiGet } from './axios-client';
import { BusRouteListResponse } from './interfaces/bus-route-list-response';
import { BusLocationListResponse } from './interfaces/bus-location-list-response';
import { ValidateApiResponse } from './decorators/api-response-validator.decorator';

@Injectable()
export class BusRouteInfo {
    constructor(private readonly configService: ConfigService) {}

    // 데코레이터 적용하려면 함수형 형태를 쓸 수 없다고...?
    @ValidateApiResponse((response: any): response is BusRouteListResponse => {
        return response &&
                response.response &&
                response.response.msgHeader &&
                typeof response.response.msgHeader.resultCode === 'number';
    })
    async getBusRouteList(stationId: string): Promise<BusRouteListResponse | null> {
        const reqUrl = this.configService.get('publicApi.busRouteServiceUrl')
        const serviceKey = this.configService.get('publicApi.routeServiceKey')

        let url = `${reqUrl}/busstationservice/v2/getBusStationViaRouteListv2?serviceKey=${serviceKey}&format=json&stationId=${stationId}`
        return await fetchApiGet<BusRouteListResponse>(url, undefined, {
            timeout: 25000,
            retries: 2,
            logMetrics: true
        })
    }

    // TODO: decorator 적용 필요
    // @ValidateApiResponse((response: any): response is BusLocationListResponse => {
    //     return response &&
    //             response.response &&
    //             response.response.msgHeader &&
    //             typeof response.response.msgHeader.resultCode === 'number';
    // })
    getBusLocationList = async (routeId: number) => {
        const reqUrl = this.configService.get('publicApi.busRouteServiceUrl');
        const serviceKey = this.configService.get('publicApi.routeServiceKey');

        let url = `${reqUrl}/buslocationservice/v2/getBusLocationListv2?serviceKey=${serviceKey}&format=json&routeId=${routeId}`
        return await fetchApiGet<BusLocationListResponse>(url, undefined, {
            timeout: 25000,
            retries: 2,
            logMetrics: true
        })
    }
}