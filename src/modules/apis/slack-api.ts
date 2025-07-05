import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient, ChatPostMessageArguments } from '@slack/web-api';
import { BusArrivalNotification } from './interfaces/bus-arrival-notification';

@Injectable()
export class SlackApi {
    private readonly logger = new Logger(SlackApi.name);
    private readonly botClient: WebClient;
    private readonly channelId: string;

    constructor(private readonly configService: ConfigService) {
        this.botClient = new WebClient(this.configService.get('slack.token'));
        this.channelId = this.configService.get('slack.channelId');
    }

    // TODO 
    async sendMessage(notification: BusArrivalNotification): Promise<void> {
        const message: ChatPostMessageArguments = {
            channel: this.channelId,
            text: `🚌 버스 도착 알림
                    정류장: ${notification.stationName}
                    노선: ${notification.routeNumber}
                    과거 도착 시간(1일 전): ${notification.arrivalTimes.join(', ')}`,
        };

        this.botClient.chat.postMessage(message).then(() => {
            this.logger.log(`Slack Api Send success : ${JSON.stringify(message)}`);
        }).catch(error => {
            this.logger.error('Slack Api Send error : ' + error);
        });
    }
}
