import { Injectable, Logger } from '@nestjs/common';
import { BusTrackingRepository } from './bus-tracking.repository';
import { BusTrackingDto } from './dto/bus-tracking.dto';

@Injectable()
export class BusTrackingService {
    private readonly logger = new Logger(BusTrackingService.name)

    constructor(private readonly busRepository: BusTrackingRepository) {}

    async createBusTracking(busTrackingDto: BusTrackingDto, station: any) {
        // routes 배열에서 해당 routeName과 일치하는 route 찾기
        const matchedRoute = station.routes?.find(route => route.routeName === busTrackingDto.routeName);
        
        if (!matchedRoute) {
            throw new Error(`Route ${busTrackingDto.routeName} not found in station ${station.stationId}`);
        }

        this.logger.log(`createBusTraking :: matchedRoute = ${matchedRoute}`)

        await this.busRepository.upsertBusTracking(
            busTrackingDto, 
            matchedRoute.routeDestId, 
            station.stationId, 
            station.stationName
        );
    }

    async getBusTrackingListForRealtimeBatch() : Promise<BusTrackingDto[]> {
        const busTrackingDtos: BusTrackingDto[] = []
        let busTrackingList = await this.busRepository.findAllTracking()
        if (busTrackingList !== undefined && busTrackingList.length > 0) {
            for(const busTracking of busTrackingList) {
                const busTrackingDto = new BusTrackingDto()
                busTrackingDto.routeId = busTracking.routeId
                busTrackingDto.routeName = busTracking.routeName
                busTrackingDto.stationId = busTracking.targetStationId

                busTrackingDtos.push(busTrackingDto)
            }
        }

        return busTrackingDtos
    }
}
