export interface SlackMessage {
    text: string;
    username?: string;
    icon_emoji?: string;
    channel?: string;
    blocks?: any[];
    attachments?: any[];
}