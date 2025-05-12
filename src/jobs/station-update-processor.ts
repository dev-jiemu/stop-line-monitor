import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StationService } from '../modules/station/station.service';
import { InjectModel } from '@nestjs/mongoose';
import { Station } from 'src/schemas/station.schema';
import { Model } from 'mongoose';
import { Job } from 'bull';
import { BusRouteInfo } from '../modules/apis/bus-route-info';


@Processor('station-update-queue')
export class StationUpdateProcessor {
    private readonly logger = new Logger(StationUpdateProcessor.name)
    private readonly serviceKey: string

    constructor(
            private readonly stationService: StationService,
            @InjectModel(Station.name) private readonly stationModel: Model<Station>,
            private readonly configService: ConfigService,
            private readonly busRouteInfo : BusRouteInfo,
    ) {
        this.serviceKey = this.configService.get('') // TODO : config setting
    }

    @Process('update-station-routes')
    async processUpdateStationRoutes(job: Job<{ limit: number }>) {
        const { limit } = job.data
        this.logger.log(`Processing update station routes job with limit: ${limit}`)

        try {
            const stationList = await this.stationService.getStationListForBatch(limit)
            this.logger.log(`Retrieved ${stationList.length} stations for update`)

            // 진행상황 표시 (0%)
            await job.progress(0)

            const results = []
            for (let i = 0; i < stationList.length; i++) {
                const station = stationList[i]
                try {
                    // 경유노선 번호 가져옴
                    const routeResponse = await this.busRouteInfo.getBusRouteList(station.stationId)

                    if (routeResponse.response.msgHeader.resultCode !== 0) {
                        console.error(`fail get station routes : ${routeResponse.response.msgHeader.resultMessage}`)
                    } else if (routeResponse.response.msgBody.busRouteList.length > 0){
                        let routeList = routeResponse.response.msgBody.busRouteList
                        this.logger.log(`Retrieved ${routeList.length} routes for station: ${station.stationId}`)

                        // TODO : route insert
                        let routes = []

                        /*
                        {
                            "regionName": "고양",
                            "routeDestId": 101000022,
                            "routeDestName": "숭례문",
                            "routeId": 219000013,
                            "routeName": 1000,
                            "routeTypeCd": 11,
                            "routeTypeName": "직행좌석형시내버스",
                            "staOrder": 14
                        }
                         */
                        for (let i = 0; i < routeList.length; i++) {
                            // TODO : route Prop update : 번호만 저장하면 안될것 같음
                        }
                    }

                } catch (error) {
                    this.logger.error(`Error processing update station routes job: ${error.message}`)
                }

                await job.progress(Math.floor((i + 1) / stationList.length * 100));

                if (i < stationList.length - 1) { // API 요청 간 딜레이 (속도 제한 회피)
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        } catch (error) {
            this.logger.error(`Error processing update station routes job: ${error.message}`)
        }
    }
}