import { Controller, Get } from '@nestjs/common';
import { StationUpdateService } from '../../jobs/station-update.service';

// 개발용 API 모음
@Controller('dev')
export class DevController {

    constructor(private readonly stationUpdateService: StationUpdateService) {}

    @Get('/execute/station-route')
    async executeStationRoute() {
        await this.stationUpdateService.updateStationRoutes()
    }
}