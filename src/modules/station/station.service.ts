import { Injectable } from '@nestjs/common';
import { StationRepository } from './station.repository';
import { StationDto } from '../../models/station-dto';

@Injectable()
export class StationService {
    constructor(private readonly stationRepository: StationRepository) {}

    async createStationLists(stations: StationDto[]) {
        await this.stationRepository.createStationMany(stations)
    }
}