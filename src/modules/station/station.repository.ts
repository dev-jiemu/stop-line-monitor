import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Station, StationDocument } from './schemas/station.schema';
import { HydratedDocument, Model } from 'mongoose';
import { StationDto } from './dto/station-dto'

@Injectable()
export class StationRepository {
    constructor(@InjectModel(Station.name) private readonly stationModel: Model<StationDocument>) {}

    // getStationListForBatch: 업데이트 기준으로 limit search
    async getStationListForBatch(limit: number) : Promise<Array<HydratedDocument<StationDocument, {}, {}>>> {
        return await this.stationModel.find().sort({updatedDt: 1}).limit(limit).exec()
    }

    async getStationOne(stationId: string) : Promise<HydratedDocument<StationDocument, {}, {}>> {
        return await this.stationModel.findOne({ stationId: stationId }).exec()
    }

    async getStationWithRouteName(stationId: string, routeName: string): Promise<HydratedDocument<StationDocument, {}, {}> | null> {
        return await this.stationModel.findOne({
            stationId: stationId,
            routes: {
                $elemMatch: { routeName: routeName }
            }
        }).exec();
    }

    async upsertStationOne(stationDto: StationDto) {
        const now = new Date();

        await this.stationModel.findOneAndUpdate(
                { stationId: stationDto.stationId },  // filter
                {
                    $set: {
                        ...stationDto,
                        updatedDt: now
                    },
                    $setOnInsert: {
                        createdDt: now
                    } // update
                },
                // options (new: true 옵션 주면 객체 리턴함ㅇㅇ)
                {
                    upsert: true,
                    runValidators: true // 스키마 유효성 검사 실행
                }
        )
    }


    // stationNo 겹치면 업데이트 처리, 아니면 insert 처리
    async upsertStationMany(stationList: StationDto[]) {
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