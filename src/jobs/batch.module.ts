import { Module } from '@nestjs/common';
import { StationUpdateService } from './station-update.service';
import { BullModule } from '@nestjs/bull';
import { StationUpdateProcessor } from './station-update-processor';
import { BusRouteInfo } from '../modules/apis/bus-route-info';
import { BatchController } from './batch.controller';
import { StationModule } from '../modules/station/station.module';
import { StopEventModule } from '../modules/stop-event/stop-event.module';
import { BusModule } from '../modules/bus/bus.module';
import { BusTrackingService } from './bus-tracking.service';
import { BusTrackingProcessor } from './bus-tracking-processor';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'station-update',
        }),
        BullModule.registerQueue({
           name: 'bus-tracking',
        }),
        StationModule, StopEventModule, BusModule,
    ],
    controllers: [BatchController],
    providers: [
        StationUpdateService,
        StationUpdateProcessor,
        BusRouteInfo,
        BusTrackingService,
        BusTrackingProcessor,
    ],
    exports: [StationUpdateService, BusTrackingService],
})

export class BatchModule {}