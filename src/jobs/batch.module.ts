import { Module } from '@nestjs/common';
import { StationUpdateService } from './station-update.service';
import { StationModule } from '../modules/station/station.module';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { Station, StationSchema } from '../schemas/station.schema';
import { StationUpdateProcessor } from './station-update-processor';
import { BusRouteInfo } from '../modules/apis/bus-route-info';
import { BatchController } from './batch.controller';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'station-update-queue',
        }),
        MongooseModule.forFeature([{ name: Station.name, schema: StationSchema }]),
        StationModule,
    ],
    controllers: [BatchController],
    providers: [
        StationUpdateService,
        StationUpdateProcessor, 
        BusRouteInfo
    ],
    exports: [StationUpdateService],
})
export class BatchModule {}