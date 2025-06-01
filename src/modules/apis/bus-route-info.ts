import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetchApiGet } from './axios-client';
import { BusRouteListResponse } from './interfaces/bus-route-list-response';
import { BusLocationListResponse } from './interfaces/bus-location-list-response';
import { BUS_API_COMMON_VALIDATOR, ValidateApiResponse } from './decorators/api-validator';
import { BusRouteInfoResponse } from './interfaces/bus-route-info-response';

@Injectable()
export class BusRouteInfo {
    constructor(private readonly configService: ConfigService) {}

    @ValidateApiResponse((response: any): response is BusRouteListResponse => {
        return BUS_API_COMMON_VALIDATOR(response);
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

    @ValidateApiResponse((response: any): response is BusLocationListResponse => {
        return BUS_API_COMMON_VALIDATOR(response);
    })
    async getBusLocationList(routeId: number) : Promise<BusLocationListResponse | null> {
        const reqUrl = this.configService.get('publicApi.busRouteServiceUrl');
        const serviceKey = this.configService.get('publicApi.routeServiceKey');

        let url = `${reqUrl}/buslocationservice/v2/getBusLocationListv2?serviceKey=${serviceKey}&format=json&routeId=${routeId}`
        return await fetchApiGet<BusLocationListResponse>(url, undefined, {
            timeout: 25000,
            retries: 2,
            logMetrics: true
        })
    }

    @ValidateApiResponse((response: any): response is BusRouteInfoResponse => {
        return BUS_API_COMMON_VALIDATOR(response);
    })
    async getBusRouteInfo(routeId: number) : Promise<BusRouteInfoResponse | null> {
        const reqUrl = this.configService.get('publicApi.busRouteServiceUrl');
        const serviceKey = this.configService.get('publicApi.routeServiceKey');

        let url = `${reqUrl}/busrouteservice/v2/getBusRouteInfoItemv2?serviceKey=${serviceKey}&format=json&routeId=${routeId}`
        return await fetchApiGet<BusRouteInfoResponse>(url, undefined, {
            timeout: 25000,
            retries: 2,
            logMetrics: true
        })
    }
}