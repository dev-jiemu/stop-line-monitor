import { Module } from '@nestjs/common';
import { StationUpdateService } from './station-update.service';
import { BullModule } from '@nestjs/bull';
import { StationUpdateProcessor } from './station-update-processor';
import { BusRouteInfo } from '../modules/apis/bus-route-info';
import { BatchController } from './batch.controller';
import { StationModule } from '../modules/station/station.module';
import { StopEventModule } from '../modules/stop-event/stop-event.module';
import { BusTrackingModule } from '../modules/bus-tracking/bus-tracking.module';
import { ApiModule } from '../modules/apis/api.module';
import { BusTrackingService } from './bus-tracking.service';
import { BusTrackingProcessor } from './bus-tracking-processor';
import { StopEventPredictionService } from './stop-event-prediction.service';
import { StopEventPredictionProcessor } from './stop-event-prediction-processor';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'station-update',
        }),
        BullModule.registerQueue({
           name: 'bus-tracking',
        }),
        BullModule.registerQueue({
            name: 'send-arrival-notification'
        }),
        StationModule, StopEventModule, BusTrackingModule, ApiModule,
    ],
    controllers: [BatchController],
    providers: [
        StationUpdateService,
        StationUpdateProcessor,
        BusRouteInfo,
        BusTrackingService,
        StopEventPredictionService,
        StopEventPredictionProcessor,
        BusTrackingProcessor,
    ],
    exports: [StationUpdateService, BusTrackingService],
})

export class BatchModule {}