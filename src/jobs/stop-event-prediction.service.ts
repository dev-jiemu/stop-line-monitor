import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StopEventPredictionService {
  private readonly logger = new Logger(StopEventPredictionService.name);
  private readonly DEFAULT_CRON = '0 * * * *'; // 매시각 0분에 실행

  constructor(
    @InjectQueue('stop-event-prediction') private stopEventPredictionQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    this.setupStartJobs();
  }

  async setupStartJobs() {
    try {
      const repeatableJobs = await this.stopEventPredictionQueue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        await this.stopEventPredictionQueue.removeRepeatableByKey(job.key);
      }

      const cronSchedule = this.configService.get('batch.stopEventPredictionCron', this.DEFAULT_CRON);

      await this.stopEventPredictionQueue.add(
        'send-arrival-summary',
        {},
        {
          repeat: { cron: cronSchedule },
          jobId: 'daily-stop-event-prediction',
          removeOnComplete: false,
          removeOnFail: false,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      );

      this.logger.log(`Scheduled stop-event-prediction job with cron: ${cronSchedule}`);
      return { scheduled: true, cron: cronSchedule };
    } catch (error) {
      this.logger.error(`Failed to setup scheduled jobs: ${error.message}`);
      return { scheduled: false, error: error.message };
    }
  }

  async triggerPredictionJob() {
    try {
      const job = await this.stopEventPredictionQueue.add(
        'send-arrival-summary',
        {},
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: false,
          removeOnFail: false,
        },
      );
      this.logger.log(`Triggered stop-event-prediction job with ID: ${job.id}`);
      return { success: true, jobId: job.id, status: await job.getState() };
    } catch (error) {
      this.logger.error(`Failed to trigger stop-event-prediction job: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
