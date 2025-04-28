import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { Station, StationSchema } from '../schemas/station.schema';
import { StationUpdateService } from './station-update.service';


@Module({
    imports: [
        ScheduleModule.forRoot(),
        // MongooseModule.forFeature([
        //     { name: Station.name, schema: StationSchema }
        // ]),
    ],
    providers: [StationUpdateService],
    exports: [],
})
export class BatchModule {}