import { Module } from '@nestjs/common';
import { BusTrackingController } from './bus-tracking.controller';
import { BusTrackingService } from './bus-tracking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BusTracking, BusTrackingSchema } from './schemas/bus-tracking.schema';
import { BusTrackingRepository } from './bus-tracking.repository';
import { BusRouteInfo } from '../apis/bus-route-info';
import { StationModule } from '../station/station.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: BusTracking.name, schema: BusTrackingSchema },
        ]),
        StationModule,
    ],
    controllers: [BusTrackingController],
    providers: [BusTrackingService, BusTrackingRepository, BusRouteInfo],
    exports: [BusTrackingService],
})
export class BusTrackingModule {}
