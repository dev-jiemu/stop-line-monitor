import { RouteBaseResponse } from './base/route-base-response';

export interface BusRouteInfoMsgBody {
    busRouteInfoItem: {
        adminName: string,
        companyId: number,
        companyName: string,
        companyTel: string,
        districtCd: number,
        downFirstTime: string,
        downLastTime: string,
        endStationId: number,
        endStationName: string,
        garageName: string,
        garageTel: string,
        multiFlag: string,
        peekAlloc: number,
        regionName: string,
        routeId: number,
        routeName: string,
        routeTypeCd: number,
        routeTypeName: string,
        satDownFirstTime: string
        satDownLastTime: string,
        sunNPeekAlloc: number,
        sunPeekAlloc: number,
        sunUpFirstTime: string,
        sunUpLastTime: string,
        turnStID: number,
        turnStNm: string,
        upFirstTime: string,
        upLastTime: string,
        weDownFirstTime: string,
        weDownLastTime: string,
        weNPeekAlloc: number,
        wePeekAlloc: number,
        weUpFirstTime: string,
        weUpLastTime: string,
        nPeekAlloc: number,
        nightAlloc: number
    }
}

export type BusRouteInfoResponse = RouteBaseResponse<BusRouteInfoMsgBody>