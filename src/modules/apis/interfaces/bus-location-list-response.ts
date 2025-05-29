export interface BusLocationListResponse {
    response: {
        comMsgHeader: string,
        msgHeader: {
            queryTime: string,
            resultCode: number,
            resultMessage: string
        },
        msgBody: {
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
    }
}