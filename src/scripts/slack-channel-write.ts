const { WebClient } = require('@slack/web-api')

const botClient = new WebClient('');
const channelId = ''

botClient.chat.postMessage({
    channel: channelId,
    text: 'bus-tracking channel message write test',
}).then(() => {
    console.log('success')
}).catch(e => {
    console.error(e)
})