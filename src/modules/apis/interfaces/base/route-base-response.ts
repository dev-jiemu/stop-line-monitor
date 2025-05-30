export interface RouteBaseResponse<T> {
    response: {
        comMsgHeader: string,
        msgHeader: {
            queryTime: string,
            resultCode: number,
            resultMessage: string
        },
        msgBody: T
    }
}