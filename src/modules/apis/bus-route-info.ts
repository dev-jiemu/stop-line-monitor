import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetchApiGet } from './axios-client';
import { BusRouteListResponse } from './interfaces/bus-route-list-response';
import { BusLocationListResponse } from './interfaces/bus-location-list-response';

@Injectable()
export class BusRouteInfo {
    constructor(private readonly configService: ConfigService) {}

    getBusRouteList = async (stationId: string) => {
        const reqUrl = this.configService.get('publicApi.busRouteServiceUrl')
        const serviceKey = this.configService.get('publicApi.routeServiceKey')

        let url = `${reqUrl}/busstationservice/v2/getBusStationViaRouteListv2?serviceKey=${serviceKey}&format=json&stationId=${stationId}`
        return await fetchApiGet<BusRouteListResponse>(url, undefined, {
            timeout: 25000,
            retries: 2,
            logMetrics: true
        })
    }

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