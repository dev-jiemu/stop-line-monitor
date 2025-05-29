import { Injectable } from '@nestjs/common';
import { BusRepository } from './bus.repository';
import { BusDto } from './dto/bus-dto';

@Injectable()
export class BusService {
    constructor(private readonly busRepository: BusRepository) {}

    async createOneBus(busDto: BusDto) {
        await this.busRepository.upsertBusOne(busDto)
    }

    async updateOneBus(busDto: BusDto) {
        await this.busRepository.upsertBusOne(busDto)
    }

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
