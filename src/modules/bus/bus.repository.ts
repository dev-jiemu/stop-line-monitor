import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bus, BusDocument } from './schemas/bus.schema';
import { BusDto } from './dto/bus-dto';

@Injectable()
export class BusRepository {
    constructor(
            @InjectModel(Bus.name) private readonly busModel: Model<BusDocument>
    ) {}

    async findAllTracking() : Promise<Bus[]> {
        return await this.busModel.find({ isTracking: true }).exec()
    }

    async upsertBusOne(busDto: BusDto) {
        const now = new Date();

        await this.busModel.findOneAndUpdate(
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