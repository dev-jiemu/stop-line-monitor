import { Injectable } from '@nestjs/common';
import { StopEventRepository } from './stop-event.repository';
import { StopEventDto } from './dto/stop-event-dto';

@Injectable()
export class StopEventService {
    constructor(private readonly stopEventRepository: StopEventRepository) {}

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
