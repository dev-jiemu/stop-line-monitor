export class StationDto {
    stationId: string
    stationManageNo: string
    cityCode: string
    cityName: string
    stationName: string
    stationLoc: string | null
    latitude: string
    longitude: string
    routes?: StationRouteDto[] // 정차하는 버스 노선 리스트
    createdDt?: Date
    updatedDt?: Date
}

export class StationRouteDto {
    routeId: number
    routeDestId: number
    routeName: string  // 실제로는 문자열 (예: '88B')
}