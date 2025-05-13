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
}

export class StationRouteDto {
    routeId: number
    routeDestId: number
    routeName: number  // 공공데이터 API에서 int로 제공
}