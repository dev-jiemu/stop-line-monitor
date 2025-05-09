import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StationUpdateService } from './station-update.service';
import { StationModule } from '../modules/station/station.module';
import { StationService } from '../modules/station/station.service';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { Station, StationSchema } from '../schemas/station.schema';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'station-update-queue',
        }),
        MongooseModule.forFeature([{ name: Station.name, schema: StationSchema }]),
        StationModule,
    ],
    providers: [StationUpdateService, StationService],
    exports: [StationUpdateService],
})
export class BatchModule {}