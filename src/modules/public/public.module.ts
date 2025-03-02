import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { StationService } from '../station/station.service';
import { BusStopInfo } from '../apis/bus-stop-info';
import { StationModule } from '../station/station.module';

@Module({
    imports: [StationModule],
    controllers: [PublicController],
    providers: [BusStopInfo, StationService],
})

export class PublicModule {}