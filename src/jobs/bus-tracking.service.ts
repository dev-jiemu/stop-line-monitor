import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config'

@Injectable()
export class BusTrackingService {
    private readonly logger = new Logger(BusTrackingService.name);

    constructor(
            @InjectQueue('bus-tracking') private busTrackingQueue: Queue,
            private readonly configService: ConfigService,
    ) {
        this.setupStartJobs();
    }

    async setupStartJobs() {
        try {
            const repeatableJobs = await this.busTrackingQueue.getRepeatableJobs()
            for (const job of repeatableJobs) {
                await this.busTrackingQueue.removeRepeatableByKey(job.key)
            }

            // 스케줄 정의 (환경 설정에서 가져올 수도 있음)
            const cronSchedule = this.configService.get('batch.busTrackingCron', '*/10 * * * *')

            await this.busTrackingQueue.add('realtime-bus-tracking', null, {
                repeat: {
                    cron: cronSchedule,
                },
                jobId: 'bus-tracking-scheduler',
                removeOnComplete: false,
                removeOnFail: false,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                }
            })

            this.logger.log(`Scheduled daily station update job with cron: ${cronSchedule}`)
            return { scheduled: true, cron: cronSchedule }
        } catch (error) {
            this.logger.error(`Failed to setup scheduled jobs: ${error.message}`)
            return { scheduled: false, error: error.message }
        }
    }

    // trigger 실행
    async triggerRealtimeBusTracking() {
        try {
            const job = await this.busTrackingQueue.add(
                'realtime-bus-tracking',
                null,
                {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 5000,
                    },
                    removeOnComplete: false,
                    removeOnFail: false,
                }
            );

            this.logger.log(`Triggered station update job with ID: ${job.id}`);
            return {
                success: true,
                jobId: job.id,
                status: await job.getState()
            };
        } catch (error) {
            this.logger.error(`Failed to trigger station update job: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // TODO : 작업상태 로깅용 추가

}