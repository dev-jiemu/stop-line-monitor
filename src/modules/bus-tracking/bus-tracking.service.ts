import { Injectable } from '@nestjs/common';
import { BusTrackingRepository } from './bus-tracking.repository';
import { BusDto } from './dto/bus-dto';
import { BusTrackingDto } from './dto/bus-tracking.dto';
import { StationDto } from '../station/dto/station-dto';

@Injectable()
export class BusTrackingService {
    constructor(private readonly busRepository: BusTrackingRepository) {}

    async createOneBus(busDto: BusDto) {
        await this.busRepository.upsertBusOne(busDto)
    }

    async updateOneBus(busDto: BusDto) {
        await this.busRepository.upsertBusOne(busDto)
    }

    async createBusTracking(busTrackingDto: BusTrackingDto, stationDto: StationDto) {

    }


    // TODO : update fix
    async getBusListForRealtimeBatch() : Promise<BusDto[]> {
        const busDtos: BusDto[] = []
        let busTrackingList = await this.busRepository.findAllTracking()
        if (busTrackingList !== undefined && busTrackingList.length > 0) {
            for(const bus of busTrackingList) {
                const busDto = new BusDto()
                busDto.routeId = bus.routeId
                busDto.routeName = bus.routeName
                busDto.routeDestId = bus.routeDestId

                busDtos.push(busDto)
            }
        }

        return busDtos
    }
}
