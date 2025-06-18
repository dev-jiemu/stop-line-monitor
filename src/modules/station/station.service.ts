import { Injectable } from '@nestjs/common';
import { StationRepository } from './station.repository';
import { StationDto, StationRouteDto } from './dto/station-dto';

@Injectable()
export class StationService {
    constructor(private readonly stationRepository: StationRepository) {}

    async createStationLists(stations: StationDto[]) {
        await this.stationRepository.upsertStationMany(stations)
    }

    async updateStationLists(stations: StationDto[]) {
        await this.stationRepository.upsertStationMany(stations)
    }

    async getStationWithRouteName(stationId: string, routeName: string) {
        return await this.stationRepository.getStationWithRouteName(stationId, routeName)
    }

    async getStationListForBatch(limit: number): Promise<StationDto[]> {
        let stations = await this.stationRepository.getStationListForBatch(limit);
        const stationDtos: StationDto[] = []

        for (const station of stations) {
            const stationDto = new StationDto()
            stationDto.stationId = station.stationId
            stationDto.stationManageNo = station.stationManageNo
            stationDto.cityCode = station.cityCode
            stationDto.cityName = station.cityName
            stationDto.stationName = station.stationName
            stationDto.stationLoc = station.stationLoc
            stationDto.latitude = station.latitude
            stationDto.longitude = station.longitude

            // 라우트 처리
            stationDto.routes = []
            if (station.routes && station.routes.length > 0) {
                for (const route of station.routes) {
                    const routeDto = new StationRouteDto()
                    routeDto.routeId = route.routeId
                    routeDto.routeDestId = route.routeDestId
                    routeDto.routeName = route.routeName
                    stationDto.routes.push(routeDto)
                }
            }

            stationDtos.push(stationDto)
        }

        return stationDtos
    }
}