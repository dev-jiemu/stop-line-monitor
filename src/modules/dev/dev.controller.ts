import { Controller, Get } from '@nestjs/common';
import { StationUpdateService } from '../../jobs/station-update.service';
import { StationService } from '../station/station.service';

// 개발용 API 모음
@Controller('dev')
export class DevController {

    constructor(
            private readonly stationUpdateService: StationUpdateService,
            private readonly stationService: StationService,
    ) {}

    @Get('/execute/station-route')
    async executeStationRoute() {
        await this.stationUpdateService.updateStationRoutes()
    }
}