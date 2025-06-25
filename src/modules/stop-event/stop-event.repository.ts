import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StopEvent, StopEventDocument } from './schemas/stop-event.schema';
import { Model } from 'mongoose';
import { StopEventDto } from './dto/stop-event-dto';

@Injectable()
export class StopEventRepository {
    constructor(@InjectModel(StopEvent.name) private readonly stopEventModel: Model<StopEventDocument>) {
    }

    async upsertStopEventOne(stopEventDto: StopEventDto) {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);
        const eventId = `${stopEventDto.routeId}-${stopEventDto.vehId}-${stopEventDto.stationId}_${timestamp}`;

        await this.stopEventModel.findOneAndUpdate(
                { eventId: eventId },
                {
                    $set: {
                        ...stopEventDto,
                    },
                    $setOnInsert: {},
                },
                {   // new: true, << 객체 필요하면 new option 주면됨
                    upsert: true,
                    runValidators: true,
                },
        );
    }

    async upsertStopEventMany(stopEventDtos: StopEventDto[]) {
        const baseTime = new Date();
        const timestamp = Math.floor(baseTime.getTime() / 1000);

        const bulkOps = stopEventDtos.map(stopEvent => {
            const eventId = `${stopEvent.routeId}-${stopEvent.vehId}-${stopEvent.stationId}_${timestamp}`;
            return {
                updateOne: {
                    filter: { eventId: eventId },
                    update: {
                        $set: {
                            ...stopEvent,
                            eventId: eventId,
                            timestamp: timestamp
                        },
                        $setOnInsert: {}
                    },
                    upsert: true,
                }
            };
        });

        await this.stopEventModel.bulkWrite(bulkOps, {ordered: false}); // 일부 실패 무시
    }
}