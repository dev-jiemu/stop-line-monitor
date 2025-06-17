import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusTracking, BusDocument } from './schemas/bus-tracking.schema';
import { BusDto } from './dto/bus-dto';

@Injectable()
export class BusTrackingRepository {
    constructor(
            @InjectModel(BusTracking.name) private readonly busTrackingModel: Model<BusDocument>
    ) {}

    async findAllTracking() : Promise<BusTracking[]> {
        return await this.busTrackingModel.find({ isActive: true }).exec()
    }

    async upsertBusOne(busDto: BusDto) {
        const now = new Date();

        await this.busTrackingModel.findOneAndUpdate(
                { routeId: busDto.routeId },
                {
                    $set: {
                        ...busDto,
                        updatedDt: now,
                    },
                    $setOnInsert: {
                        isTracking: false, // default false
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