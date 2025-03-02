import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Station, StationDocument } from '../../schemas/station.schema';
import { Model } from 'mongoose';
import { StationDto } from '../../models/station-dto'

@Injectable()
export class StationRepository {
    constructor(@InjectModel(Station.name) private readonly stationModel: Model<StationDocument>) {}

    getStationList(): Promise<StationDto[]> {
        return this.stationModel.find().exec()
    }

    async getStation(stationManageNo: string) : Promise<StationDto> {
        return await this.stationModel.findOne({ stationManageNo }).exec()
    }

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
        }

        await this.stationModel.create(create)
    }

    // stationNo 겹치면 업데이트 처리
    async createStationMany(stationList: StationDto[]) {
        const bulkOps = stationList.map(station => ({
            updateOne: {
                filter: { stationManageNo: station.stationManageNo, stationName: station.stationName },
                update: { $set: station },
                upsert: true
            }
        }))

        await this.stationModel.bulkWrite(bulkOps)
        //await this.stationModel.insertMany(stationList)
    }

}