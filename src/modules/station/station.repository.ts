import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Station, StationDocument } from '../../schemas/station.schema';
import { Model } from 'mongoose';
import { StationDto } from '../../models/station-dto'

@Injectable()
export class StationRepository {
    constructor(@InjectModel(Station.name) private readonly stationModel: Model<StationDocument>) {}

    // getStationListForBatch : 업데이트 기준으로 limit search
    async getStationListForBatch(limit: number) : Promise<StationDto[]> {
        return await this.stationModel.find().sort({updatedDt: 1}).limit(limit).exec()
        //return await this.stationModel.find().limit(limit).exec()
    }

    // TODO: 구조 변경으로 인한 재구현
    async createStationOne(stationDto: StationDto) {
        const create = {
            stationManageNo: stationDto.stationManageNo,
            cityCode: stationDto.cityCode,
            cityName: stationDto.cityName,
            stationName: stationDto.stationName,
            stationLoc: stationDto.stationLoc,
            latitude: stationDto.latitude,
            longitude: stationDto.longitude,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.stationModel.create(create)
    }

    // stationNo 겹치면 업데이트 처리
    async createStationMany(stationList: StationDto[]) {
        const now = new Date();

        const bulkOps = stationList.map(station => ({
            updateOne: {
                filter: { stationId: station.stationId },
                update: {
                    $set: {
                        ...station,
                        updatedDt: now
                    },
                    $setOnInsert: {
                        createdDt: now
                    }
                },
                upsert: true
            }
        }))

        await this.stationModel.bulkWrite(bulkOps)
    }

}