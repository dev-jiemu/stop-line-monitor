import { Controller, Get, Post } from '@nestjs/common';
import { type BaseResponse } from '../../models/base/base-response'
import { BusStopInfo } from '../apis/bus-stop-info'
import { type StationDto } from '../../models/station-dto';
import { StationService } from '../station/station.service';

@Controller('public')
export class PublicController {

    constructor(private readonly busStopInfo: BusStopInfo, private readonly stationService: StationService) {}

    // default setting
    private readonly pSize : number = 50

    // Get bus-stop : 데이터 확인용 API
    @Get('/bus-stop')
    async getBusStopList() : Promise<BaseResponse> {
        let response: BaseResponse = {
            result: false,
        }

        let pIndex : number = 1

        // request public-api
        let result = await this.busStopInfo.getBusStopInformation(this.pSize, pIndex)
        if (result.BusStation[0].head[1].RESULT.CODE !== "INFO-000") {
            response.result = false
            response.reason = result.BusStation[0].head[1].RESULT.MESSAGE

            return response
        }

        let totalCount: number = result.BusStation[0].head[0].list_total_count
        let stations: StationDto[] = []

        const totalPages: number = Math.ceil(totalCount / this.pSize)

        for (const element of result.BusStation[1].row) {
            const item: StationDto = {
                stationId: element.STATION_ID,
                stationManageNo: element.STATION_MANAGE_NO,
                cityCode: element.SIGUN_CD,
                cityName: element.SIGUN_NM,
                stationName: element.STATION_NM_INFO,
                stationLoc: element.LOCPLC_LOC,
                latitude: element.WGS84_LAT,
                longitude: element.WGS84_LOGT,
            };
            stations.push(item);
        }

        for (let page = pIndex + 1; page <= totalPages; page++) {
            let result = await this.busStopInfo.getBusStopInformation(this.pSize, page)

            if (result.BusStation[0].head[1].RESULT.CODE !== "INFO-000") {
                response.result = false
                response.reason = result.BusStation[0].head[1].RESULT.MESSAGE

                return response
            }

            for (const element of result.BusStation[1].row) {
                const item: StationDto = {
                    stationId: element.STATION_ID,
                    stationManageNo: element.STATION_MANAGE_NO,
                    cityCode: element.SIGUN_CD,
                    cityName: element.SIGUN_NM,
                    stationName: element.STATION_NM_INFO,
                    stationLoc: element.LOCPLC_LOC,
                    latitude: element.WGS84_LAT,
                    longitude: element.WGS84_LOGT,
                };
                stations.push(item);
            }
        }

        response.result = true
        response.data = {
            total_count : totalCount,
            total_pages : totalPages,
            stations_count : stations.length,
            stations : stations
        }

        return response
    }

    @Post('/bus-stop')
    async insertBusStopInfo() {
        let response: BaseResponse = {
            result: false,
        }

        let pIndex : number = 1

        // request public-api
        let result = await this.busStopInfo.getBusStopInformation(this.pSize, pIndex)
        if (result.BusStation[0].head[1].RESULT.CODE !== "INFO-000") {
            response.result = false
            response.reason = result.BusStation[0].head[1].RESULT.MESSAGE

            return response
        }

        let totalCount: number = result.BusStation[0].head[0].list_total_count

        const totalPages: number = Math.ceil(totalCount / this.pSize)
        console.log('getBusStopList : totalPages = ', totalPages)

        let stations: StationDto[] = []

        // 1번 index 에서 돌린 데이터 처리
        for (const element of result.BusStation[1].row) {
            if (element.STATION_MANAGE_NO !== null) {
                const item: StationDto = {
                    stationId: element.STATION_ID,
                    stationManageNo: element.STATION_MANAGE_NO,
                    cityCode: element.SIGUN_CD,
                    cityName: element.SIGUN_NM,
                    stationName: element.STATION_NM_INFO,
                    stationLoc: element.LOCPLC_LOC,
                    latitude: element.WGS84_LAT,
                    longitude: element.WGS84_LOGT,
                }
                stations.push(item)
            }
        }


        // 2번 index 부터 돌림
        for (let page = pIndex + 1; page <= totalPages; page++) {
            let result = await this.busStopInfo.getBusStopInformation(this.pSize, page)

            if (result.BusStation[0].head[1].RESULT.CODE !== "INFO-000") {
                response.result = false
                response.reason = result.BusStation[0].head[1].RESULT.MESSAGE

                return response
            }

            for (const element of result.BusStation[1].row) {
                if (element.STATION_MANAGE_NO !== null) {
                    const item: StationDto = {
                        stationId: element.STATION_ID,
                        stationManageNo: element.STATION_MANAGE_NO,
                        cityCode: element.SIGUN_CD,
                        cityName: element.SIGUN_NM,
                        stationName: element.STATION_NM_INFO,
                        stationLoc: element.LOCPLC_LOC,
                        latitude: element.WGS84_LAT,
                        longitude: element.WGS84_LOGT,
                    }
                    stations.push(item)
                }
            }
        }

        // insert data
        if (stations && stations.length > 0) {
            this.stationService.createStationLists(stations).then(() => {
                console.log('createStationLists success')
            }).catch(err => {
                console.error('createStationLists fail : ', err)

                response.result = false
                response.reason = err

                return response
            })
        }

        response.result = true
        response.data = {
            list_total_count: totalCount,
            total_pages: totalPages,
            insert_station_count: stations.length,
        }

        return response
    }
}

