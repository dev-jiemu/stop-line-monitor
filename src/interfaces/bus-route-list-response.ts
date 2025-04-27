export interface BusRouteListResponse {
    response: {
        comMsgHeader: string,
        msgHeader: {
            queryTime: string,
            resultCode: number,
            resultMessage: string
        },
        msgBody: {
            busRouteList: {
                regionName: string,
                routeDestId: number,
                routeDestName: string,
                routeId: number,
                routeTypeCd: number,
                routeTypeName: string,
                staOrder: number,
            }[]
        }
    }
}