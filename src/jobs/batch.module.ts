import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StationUpdateService } from './station-update.service';
import { StationModule } from '../modules/station/station.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        StationModule,
    ],
    providers: [StationUpdateService],
    exports: [StationUpdateService],
})
export class BatchModule {}