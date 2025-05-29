import { Module } from '@nestjs/common';
import { StationUpdateService } from './station-update.service';
import { StationModule } from '../modules/station/station.module';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { Station, StationSchema } from '../modules/station/schemas/station.schema';
import { StationUpdateProcessor } from './station-update-processor';
import { BusRouteInfo } from '../modules/apis/bus-route-info';
import { BatchController } from './batch.controller';
import { BusTrackingService } from './bus-tracking.service';
import { BusModule } from '../modules/bus/bus.module';
import { StopEventModule } from '../modules/stop-event/stop-event.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'station-update',
        }),
        MongooseModule.forFeature([{ name: Station.name, schema: StationSchema }]),
        StationModule, BusModule, StopEventModule,
    ],
    controllers: [BatchController],
    providers: [
        StationUpdateService,
        StationUpdateProcessor, 
        BusRouteInfo,
        BusTrackingService,
    ],
    exports: [StationUpdateService, BusTrackingService],
})
export class BatchModule {}