import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SlackApi } from '../modules/apis/slack-api';
import { Logger } from '@nestjs/common';
import { BusTrackingService } from '../modules/bus-tracking/bus-tracking.service';
import { StopEventService } from '../modules/stop-event/stop-event.service';

@Processor('send-arrival-notification')
export class StopEventPredictionProcessor {
    private readonly logger = new Logger(StopEventPredictionProcessor.name);

    constructor(
            private readonly slackApi: SlackApi,
            private readonly busTrackingService: BusTrackingService,
            private readonly stopEventService: StopEventService,
    ) {}

    @Process('send-arrival-summary')
    async handleSendArrivalSummary(job: Job) {
        this.logger.log(`Processing send arrival summary...`);
        const startDate = Date.now();

        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0'); // "08", "09" 형태

        try {
            // 노선 정보 get
            const notificationList = await this.busTrackingService.getActiveBusTrackingList(currentHour)
            this.logger.log(`Notification bus route lists : ${notificationList.length}`)

            // 일단 단순한 for 문으로 처리하는데 데이터가 많아지면 분할해야함
            // 굳이 알람을 0분에 딱 맞춰서 보낼 필요는 없음(아직까진)
            for(const notification of notificationList) {
                // TODO : currentHour stop-event list
            }

        } catch (error) {
            const processingTime = Date.now() - startDate;
            this.logger.error(`Error processing stop-event-notification`, error, {
                jobId: job.id,
                processingTimeMs: processingTime,
            });
        }

        this.logger.log('StopEventPredictionProcessor: Batch completed');
    }

    // TODO : 교통 상황에 따라 도착시간 예측해보기
    @Process('send-arrival-prediction')
    async haneldSendArrivalPrediction(job: Job) {
        this.logger.log('StopEventPredictionProcessor: Sending arrival prediction');

    }
} 