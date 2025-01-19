export class StationDto {
    stationManageNo: string
    cityCode: string
    cityName: string
    stationName: string
    stationLoc: string | null
    latitude: string
    longitude: string
    routes?: string[] // 정차하는 버스 노선 리스트
}