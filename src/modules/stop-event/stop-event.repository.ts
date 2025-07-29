import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StopEvent, StopEventDocument } from './schemas/stop-event.schema';
import { Model } from 'mongoose';
import { StopEventDto } from './dto/stop-event-dto';

@Injectable()
export class StopEventRepository {
    constructor(@InjectModel(StopEvent.name) private readonly stopEventModel: Model<StopEventDocument>) {}

    async findStopEventByNotificationTime(currentHour: string, routeId: number, stationId: string, daysBefore: number = 7): Promise<StopEvent[]> {
        const results = [];
        const targetHour = parseInt(currentHour);

        // 7일간의 데이터를 각각 조회
        for(let i = 1; i <= daysBefore; i++) {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - i);

            const startOfDay = new Date(targetDate);
            startOfDay.setHours(targetHour - 1, 0, 0, 0); // 1시간 버퍼

            const endOfDay = new Date(targetDate);
            endOfDay.setHours(targetHour + 1, 59, 59, 999); // 1시간 버퍼

            const dayData = await this.stopEventModel.find({
                routeId: routeId,
                stationId: stationId,
                createdDt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).exec();

            results.push(...dayData);
        }

        return results;
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