import { RouteBaseResponse } from './base/route-base-response';

export interface BusRouteMsgBody {
    busRouteList: {
        regionName: string,
        routeDestId: number,
        routeDestName: string,
        routeId: number,
        routeName: string | number, // 문자열 또는 숫자 모두 가능
        routeTypeCd: number,
        routeTypeName: string,
        staOrder: number,
    }[]
}

export type BusRouteListResponse = RouteBaseResponse<BusRouteMsgBody>