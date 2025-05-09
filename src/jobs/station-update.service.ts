import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StationService } from '../modules/station/station.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StationUpdateService {
    private readonly logger = new Logger(StationUpdateService.name)

    constructor(
            @InjectQueue('station-update-queue') private stationQueue: Queue,
            private readonly stationService: StationService,
            private readonly configService: ConfigService
    ) {
        this.setupStartJobs()
    }

    // 매일 오전 10시
    async setupStartJobs() {
        // 기존 작업 있으면 일단 삭제
        const repeatableJobs = await this.stationQueue.getRepeatableJobs()
        for (const job of repeatableJobs) {
            await this.stationQueue.removeRepeatableByKey(job.key)
        }

        // 1. station routes update : 10AM
        await this.stationQueue.add('update-station-routes', {
            limit: 500,
        }, {
            repeat: {
                cron: '0 0 10 * * *',
            },
            jobId: 'daily-station-update',
        })

        this.logger.log('Scheduled daily station update job at 10:00 AM')
        return { scheduled: true }
    }

    // 수동 운영용 / 테스트용
    // default 500
    async triggerStationRouteUpdate(limit: number = 500) {
        const job = await this.stationQueue.add(
                'update-station-routes',
                { limit },
                {
                    attempts: 3,
                    backoff: {
                        type: 'exponential', delay: 5000,
                    }
                })

        this.logger.log(`Triggered station update job ID: ${job.id}`)
        return { jobId: job.id }
    }


    // status check
    async getJobStatus() {
        const [active, waiting, completed, failed] = await Promise.all([
            this.stationQueue.getActiveCount(),
            this.stationQueue.getWaitingCount(),
            this.stationQueue.getCompletedCount(),
            this.stationQueue.getFailedCount(),
        ]);

        return { active, waiting, completed, failed };
    }
}