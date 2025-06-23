import { RouteBaseResponse } from './base/route-base-response';

export interface BusLocationMsgBody {
    busLocationList: {
        crowded: number,
        lowPlate: number,
        plateNo: string,
        remainSeatCnt: number,
        routeId: number,
        routeTypeCd: number,
        stateCd: number,
        stationId: number,
        stationSeq: number,
        taglessCd: number,
        vehId: number,
    }[]
}

export type BusLocationListResponse = RouteBaseResponse<BusLocationMsgBody>