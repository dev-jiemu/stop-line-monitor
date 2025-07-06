import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { BusTrackingRepository } from '../modules/bus-tracking/bus-tracking.repository';
import { StopEventRepository } from '../modules/stop-event/stop-event.repository';
import { SlackApi } from '../modules/apis/slack-api';
import { Logger } from '@nestjs/common';

function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isNotificationHour(now: Date, notificationHours: string[]): boolean {
  const hour = now.getHours().toString().padStart(2, '0');
  return Array.isArray(notificationHours) && notificationHours.includes(hour);
}

@Processor('stop-event-prediction')
export class StopEventPredictionProcessor {
  private readonly logger = new Logger(StopEventPredictionProcessor.name);

  constructor(
    // TODO : service DI Add (busTracking, stopEvent)
    private readonly slackApi: SlackApi,
  ) {}

  @Process('send-arrival-summary')
  async handleSendArrivalSummary(job: Job) {
    const now = new Date();

    // TODO :
    this.logger.log('StopEventPredictionProcessor: Batch completed');
  }
} 