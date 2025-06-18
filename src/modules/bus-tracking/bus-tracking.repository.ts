import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusTracking, BusDocument } from './schemas/bus-tracking.schema';
import { BusTrackingDto } from './dto/bus-tracking.dto';

@Injectable()
export class BusTrackingRepository {
    constructor(
            @InjectModel(BusTracking.name) private readonly busTrackingModel: Model<BusDocument>
    ) {}

    async findAllTracking() : Promise<BusTracking[]> {
        return await this.busTrackingModel.find({ isActive: true }).exec()
    }

    async upsertBusTracking(busTrackingDto: BusTrackingDto, routeDestId: number, targetStationId: string, targetStationName?: string) {
        const now = new Date();
        const trackingKey = `${busTrackingDto.routeName}-${targetStationId}`;

        await this.busTrackingModel.findOneAndUpdate(
                { 
                    trackingKey: trackingKey
                },
                {
                    $set: {
                        trackingKey,
                        routeId: busTrackingDto.routeId,
                        routeName: busTrackingDto.routeName,
                        routeDestId,
                        targetStationId,
                        ...(targetStationName && { targetStationName }),
                        ...(busTrackingDto.notificationTime && { notificationTime: busTrackingDto.notificationTime }),
                        updatedDt: now,
                    },
                    $setOnInsert: {
                        isActive: true, // 등록 요청이니까 default true
                        createdDt: now,
                    }
                },
                {
                    upsert: true,
                    runValidators: true
                }
        )
    }
}