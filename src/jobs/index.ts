import cron from 'node-cron'

// TODO : batch job
export const batchJobs = () => {
    console.log('server batch jobs start ---')

    cron.schedule('0 * * * *', () => {
        // TODO
    })
}