import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Station, StationDocument } from '../schema/station.schema';
import { Model } from 'mongoose';
import { StationDto } from '../interfaces/stationDto'

@Injectable()
export class PublicRepository {
    constructor(@InjectModel(Station.name)private stationModel : Model<StationDocument>) {}

    async getStationList(): Promise<StationDto[]> {
        return null
    }

}