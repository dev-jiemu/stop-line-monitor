export class StopEventDto {
    routeId: number
    vehId: number
    stationId: number
    remainSeatCnt?: number
    createdDt?: Date  // 추가
}