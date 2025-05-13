import { Injectable, Logger } from '@nestjs/common';
import { StationService } from '../modules/station/station.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StationUpdateService {
    private readonly logger = new Logger(StationUpdateService.name);
    private readonly DEFAULT_BATCH_LIMIT = 500;
    
    constructor(
        @InjectQueue('station-update-queue') private stationQueue: Queue,
        private readonly stationService: StationService,
        private readonly configService: ConfigService
    ) {
        this.setupStartJobs();
    }

    /**
     * 매일 오전 10시에 자동 업데이트 작업 설정
     */
    async setupStartJobs() {
        try {
            // 기존 예약 작업 삭제
            const repeatableJobs = await this.stationQueue.getRepeatableJobs()
            for (const job of repeatableJobs) {
                await this.stationQueue.removeRepeatableByKey(job.key)
            }

            // 스케줄 정의 (환경 설정에서 가져올 수도 있음)
            const cronSchedule = this.configService.get('batch.stationUpdateCron', '0 0 10 * * *')
            const batchLimit = this.configService.get('batch.stationUpdateLimit', this.DEFAULT_BATCH_LIMIT)

            // 1. station routes update : 10AM
            await this.stationQueue.add('update-station-routes', {
                limit: batchLimit,
            }, {
                repeat: {
                    cron: cronSchedule,
                },
                jobId: 'daily-station-update',
                removeOnComplete: false, // 성공한 작업 이력 보존
                removeOnFail: false,     // 실패한 작업 이력 보존
                attempts: 3,             // 실패 시 재시도 횟수
                backoff: {
                    type: 'exponential', 
                    delay: 5000,
                }
            })

            this.logger.log(`Scheduled daily station update job with cron: ${cronSchedule}, limit: ${batchLimit}`)
            return { scheduled: true, cron: cronSchedule, limit: batchLimit }
        } catch (error) {
            this.logger.error(`Failed to setup scheduled jobs: ${error.message}`)
            return { scheduled: false, error: error.message }
        }
    }

    /**
     * 수동 트리거로 정류장 노선 업데이트 실행
     */
    async triggerStationRouteUpdate(limit: number = this.DEFAULT_BATCH_LIMIT) {
        try {
            const job = await this.stationQueue.add(
                'update-station-routes',
                { limit },
                {
                    attempts: 3,
                    backoff: {
                        type: 'exponential', 
                        delay: 5000,
                    },
                    removeOnComplete: false,
                    removeOnFail: false,
                }
            )

            this.logger.log(`Triggered station update job with ID: ${job.id}, limit: ${limit}`)
            return { 
                success: true, 
                jobId: job.id,
                status: await job.getState()
            }
        } catch (error) {
            this.logger.error(`Failed to trigger station update job: ${error.message}`)
            return { 
                success: false, 
                error: error.message 
            }
        }
    }

    /**
     * 작업 상태 확인
     */
    async getJobStatus() {
        try {
            const [active, waiting, completed, failed] = await Promise.all([
                this.stationQueue.getActiveCount(),
                this.stationQueue.getWaitingCount(),
                this.stationQueue.getCompletedCount(),
                this.stationQueue.getFailedCount(),
            ])

            // 최근 작업 이력 가져오기
            const [activeJobs, completedJobs, failedJobs] = await Promise.all([
                this.stationQueue.getActive(),
                this.stationQueue.getCompleted(0, 5),  // 최근 5개
                this.stationQueue.getFailed(0, 5),     // 최근 5개
            ])

            return { 
                counts: { active, waiting, completed, failed },
                latestActive: activeJobs.map(job => ({ 
                    id: job.id, 
                    type: job.name,
                    data: job.data,
                    progress: job.progress(),
                    timestamp: job.timestamp
                })),
                latestCompleted: completedJobs.map(job => ({ 
                    id: job.id, 
                    type: job.name,
                    data: job.data,
                    result: job.returnvalue,
                    completedAt: job.finishedOn 
                })),
                latestFailed: failedJobs.map(job => ({ 
                    id: job.id, 
                    type: job.name,
                    data: job.data,
                    error: job.failedReason,
                    failedAt: job.finishedOn
                }))
            };
        } catch (error) {
            this.logger.error(`Failed to get job status: ${error.message}`)
            return { 
                error: error.message 
            }
        }
    }

    /**
     * 특정 작업 상태 및 정보 조회
     */
    async getJobById(jobId: string) {
        try {
            const job = await this.stationQueue.getJob(jobId);
            if (!job) {
                return { found: false };
            }

            const state = await job.getState();
            const progress = await job.progress();
            
            return {
                found: true,
                id: job.id,
                type: job.name,
                data: job.data,
                state,
                progress,
                logs: {
                    createdAt: new Date(job.timestamp),
                    startedAt: job.processedOn ? new Date(job.processedOn) : null,
                    finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
                },
                result: job.returnvalue,
                error: job.failedReason
            }
        } catch (error) {
            this.logger.error(`Failed to get job by ID ${jobId}: ${error.message}`);
            return { 
                error: error.message 
            }
        }
    }
}