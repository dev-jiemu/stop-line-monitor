import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StationUpdateService } from './station-update.service';
import { StationModule } from '../modules/station/station.module';
import { StationService } from '../modules/station/station.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        StationModule,
    ],
    providers: [StationUpdateService, StationService],
    exports: [StationUpdateService],
})
export class BatchModule {}