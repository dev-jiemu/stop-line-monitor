import { Injectable } from '@nestjs/common';
import { StopEventRepository } from './stop-event.repository';
import { StopEventDto } from './dto/stop-event-dto';

@Injectable()
export class StopEventService {
    constructor(private readonly stopEventRepository: StopEventRepository) {}

    async getRouteStopEventList(currentHour: string, routeId: number, stationId: string) {
        const stopEventDtos: StopEventDto[] = []
        const stopEventList = await this.stopEventRepository.findStopEventByNotificationTime(currentHour, routeId, stationId)

        if (stopEventList !== undefined && stopEventList.length > 0) {
            for (const stopEvent of stopEventList) {
                const stopEventDto: StopEventDto = new StopEventDto()
                stopEventDto.routeId = stopEvent.routeId;
                stopEventDto.stationId = stopEvent.stationId;
                stopEventDto.vehId = stopEvent.vehId;
                stopEventDto.remainSeatCnt = stopEvent.remainSeatCnt;
                stopEventDto.createdDt = stopEvent.createdDt;

                stopEventDtos.push(stopEventDto)
            }
        }

        return stopEventDtos
     }

    async createStopEvent(stopEventDto: StopEventDto) {
        await this.stopEventRepository.upsertStopEventOne(stopEventDto)
    }

    async updateStopEvent(stopEventDto: StopEventDto) {
        await this.stopEventRepository.upsertStopEventOne(stopEventDto)
    }

    async createStopEventLists(stopEvents: StopEventDto[]) {
        await this.stopEventRepository.upsertStopEventMany(stopEvents)
    }
}
