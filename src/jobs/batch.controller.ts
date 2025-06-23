import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { StationUpdateService } from './station-update.service';
import { BusTrackingService } from './bus-tracking.service';

@Controller('batch')
export class BatchController {
    constructor(
            private readonly stationUpdateService: StationUpdateService,
            private readonly busTrackingService: BusTrackingService
    ) {}

    /**
     * 정류장 노선 업데이트 배치 작업 수동 트리거
     * POST /batch/station-update
     */
    @Post('station-update')
    async triggerStationUpdate(@Body() body: { limit?: number }) {
        const limit = body.limit || 50;
        return await this.stationUpdateService.triggerStationRouteUpdate(limit);
    }

    /**
     * 노선 트래킹 배치 작업 수동 트리거
     * POST /batch/bus-tracking
     */
    @Post('bus-tracking')
    async triggerBusTracking() {
        return await this.busTrackingService.triggerRealtimeBusTracking();
    }

    /**
     * 배치 작업 상태 조회
     * GET /batch/status
     */
    @Get('status')
    async getBatchStatus() {
        return await this.stationUpdateService.getJobStatus();
    }

    /**
     * 특정 작업 상태 조회
     * GET /batch/job/:jobId
     */
    @Get('job/:jobId')
    async getJobById(@Param('jobId') jobId: string) {
        return await this.stationUpdateService.getJobById(jobId);
    }

    /**
     * 스케줄 작업 재설정
     * POST /batch/reschedule
     */
    @Post('reschedule')
    async rescheduleJobs() {
        return await this.stationUpdateService.setupStartJobs();
    }

    /**
     * 실패한 작업들 정리
     * DELETE /batch/failed
     */
    @Delete('failed')
    async clearFailedJobs() {
        return await this.stationUpdateService.clearFailedJobs();
    }

    /**
     * 완료된 작업들 정리
     * DELETE /batch/completed
     */
    @Delete('completed')
    async clearCompletedJobs() {
        return await this.stationUpdateService.clearCompletedJobs();
    }

    /**
     * 모든 작업 이력 정리
     * DELETE /batch/all
     */
    @Delete('all')
    async clearAllJobs() {
        return await this.stationUpdateService.clearAllJobs();
    }
}
