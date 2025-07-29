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

        // job.data에서 executionTime과 isScheduled 추출
        const { executionTime, isScheduled } = job.data;

        let currentHour, targetTime;
        if (isScheduled) {
            targetTime = new Date(executionTime);
            currentHour = targetTime.getHours().toString().padStart(2, '0');
        } else {
            currentHour = executionTime.toString().padStart(2, '0');
        }

        this.logger.log(`Execution mode: ${isScheduled ? 'Scheduled' : 'Controller'}, Target time: ${executionTime}, Hour: ${currentHour}`);

        try {
            // 노선 정보 get
            const notificationList = await this.busTrackingService.getActiveBusTrackingList(currentHour);
            this.logger.log(`Notification bus route lists : ${notificationList.length}`)

            for(const notification of notificationList) {
                const eventLists = await this.stopEventService.getRouteStopEventList(currentHour, notification.routeId, notification.stationId);
                this.logger.log(`bus route event lists : ${eventLists.length}`);
                for(const events of eventLists) {
                    console.log(events);
                    // TODO : 10분 배치로 했더니 데이터가 심각하게 부족해서 배치 간격 줄이고 다시 이어서 함
                }
            }

        } catch (error) {
            const processingTime = Date.now() - startDate;
            this.logger.error(`Error processing stop-event-notification`, error, {
                jobId: job.id,
                processingTimeMs: processingTime,
                executionTime,
                isScheduled,
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