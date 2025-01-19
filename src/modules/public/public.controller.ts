import { Controller, Get } from '@nestjs/common';
import { type BaseResponse } from '../../models/base/baseResponse'
import { BusStopInfo } from '../apis/busStopInfo'
import { type StationDto } from '../../models/stationDto';
import { StationService } from '../station/station.service';

@Controller('public')
export class PublicController {

    constructor(private readonly busStopInfo: BusStopInfo, private readonly stationService: StationService) {}

    @Get('/bus-stop')
    async getBusStopList() : Promise<BaseResponse> {
        let response: BaseResponse = {
            result: false,
        }

        // default setting
        let pSize: number = 50
        let pIndex: number = 1

        // request public-api
        let result = await this.busStopInfo.getBusStopInformation(pSize, pIndex)
        if (result.BusStation[0].head[1].RESULT.CODE !== "INFO-000") {
            response.result = false
            response.reason = result.BusStation[0].head[1].RESULT.MESSAGE

            return response
        }

        let totalCount: number = result.BusStation[0].head[0].list_total_count

        const totalPages: number = Math.ceil(totalCount / pSize)
        console.log('getBusStopList : totalPages = ', totalPages)

        let stations: StationDto[] = []

        // 1번 index 에서 돌린 데이터 처리
        for (const element of result.BusStation[1].row) {
            const item: StationDto = {
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

        // // 2번 index 부터 돌림
        for (let page = pIndex + 1; page <= totalPages; page++) {
            let result = await this.busStopInfo.getBusStopInformation(page, pIndex)

            if (result.BusStation[0].head[1].RESULT.CODE !== "INFO-000") {
                response.result = false
                response.reason = result.BusStation[0].head[1].RESULT.MESSAGE

                return response
            }

            for (const element of result.BusStation[1].row) {
                const item: StationDto = {
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

        /*
            2025.01.19 result

            // 20250119175357
            // http://localhost:3000/public/bus-stop

            {
              "result": true,
              "info": {
                "list_total_count": 2197,
                "total_pages": 44,
                "insert_station_count": 1039
              }
            }

            TODO:: FIX) 정류소 코드 겹친것 같음!
            createStationLists fail :  MongoBulkWriteError: E11000 duplicate key error collection: stop-line-monitor.stations index: stationManageNo_1 dup key: { stationManageNo: "20482" }
         */

        return response
    }


}

