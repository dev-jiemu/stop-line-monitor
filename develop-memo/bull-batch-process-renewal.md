### 2025.05.25 Batch 로직 개선관련 메모

---

1. 기존에 개발했던 배치 로직
```typescript
@Process('update-station-routes')
async processUpdateStationRoutes(job: Job<{ limit: number }>) {
    const { limit } = job.data
    this.logger.log(`Processing update station routes job with limit: ${limit}`)

    try {
        const stationList = await this.stationService.getStationListForBatch(limit)
        this.logger.log(`Retrieved ${stationList.length} stations for update`)

        // 진행상황 표시 (0%)
        await job.progress(0)

        // 배치 처리를 위한 준비
        const totalBatches = Math.ceil(stationList.length / this.BATCH_SIZE)
        let processedCount = 0
        let failedStations = []

        // 배치 단위로 처리
        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const startIdx = batchIndex * this.BATCH_SIZE
            const endIdx = Math.min(startIdx + this.BATCH_SIZE, stationList.length)
            const currentBatch = stationList.slice(startIdx, endIdx)

            let updateStationList: StationDto[] = []

            // 현재 배치의 각 정류장 처리
            for (let i = 0; i < currentBatch.length; i++) {
                const station = currentBatch[i];
                try {
                    // 경유노선 번호 가져옴
                    const routeResponse = await this.busRouteInfo.getBusRouteList(station.stationId)

                    if (routeResponse.response.msgHeader.resultCode !== 0) {
                        this.logger.error(`Failed to get routes for station ${station.stationId}: ${routeResponse.response.msgHeader.resultMessage}`)
                        failedStations.push({
                            stationId: station.stationId,
                            reason: routeResponse.response.msgHeader.resultMessage
                        })
                    } else if (routeResponse.response.msgBody?.busRouteList?.length > 0) {
                        station.routes = station.routes || [] // 필드가 없으면 초기화

                        let routeList = routeResponse.response.msgBody.busRouteList
                        this.logger.debug(`Retrieved ${routeList.length} routes for station: ${station.stationId}`)

                        let routes: StationRouteDto[] = routeList.map(element => ({
                            routeId: element.routeId,
                            routeDestId: element.routeDestId,
                            routeName: String(element.routeName), // 문자열로 변환
                        }))

                        // 정류장 정보 업데이트
                        station.routes = routes
                    } else {
                        // API에서 노선 정보가 없는 경우
                        this.logger.debug(`No routes found for station: ${station.stationId}`)
                        station.routes = []
                    }

                    updateStationList.push(station)

                } catch (error) {
                    this.logger.error(`Error processing station ${station.stationId}: ${error.message}`)
                    failedStations.push({
                        stationId: station.stationId,
                        reason: error.message
                    })
                }

                // API 요청 간 딜레이 (속도 제한 회피)
                if (i < currentBatch.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.API_DELAY_MS))
                }

                // 전체 진행률 업데이트
                processedCount++
                await job.progress(Math.floor(processedCount / stationList.length * 100))
            }

            // 현재 배치 업데이트
            if (updateStationList.length > 0) {
                this.logger.log(`Updating batch ${batchIndex + 1}/${totalBatches} with ${updateStationList.length} stations`)
                await this.stationService.updateStationLists(updateStationList)
            }
        }

        // 작업 완료
        await job.progress(100)

        // 실패한 정류장 정보 로깅
        if (failedStations.length > 0) {
            this.logger.warn(`Failed to update ${failedStations.length} stations`)
        }

        return {
            processed: processedCount,
            updated: processedCount - failedStations.length,
            failed: failedStations.length,
            failedStations: failedStations.length > 0 ? failedStations : undefined
        }

    } catch (error) {
        this.logger.error(`Error processing update station routes job: ${error.message}`)
        throw error // Bull이 자동으로 재시도할 수 있도록 에러를 throw
    }
}
```

- limit 값을 기준으로 배치 사이즈마다 나눠서 여러개 돌림
- 100 건정도로 잡고 돌려봤을때 로그

```log
[Nest] 3043  - 2025. 05. 25. 오후 12:30:17     LOG [StationUpdateService] Triggered station update job with ID: 11, limit: 100
[Nest] 3043  - 2025. 05. 25. 오후 12:30:17     LOG [StationUpdateProcessor] Processing update station routes job with limit: 100
[Nest] 3043  - 2025. 05. 25. 오후 12:30:17     LOG [StationUpdateProcessor] Retrieved 100 stations for update
[Nest] 3043  - 2025. 05. 25. 오후 12:30:18   DEBUG [StationUpdateProcessor] Retrieved 7 routes for station: 219000623
[Nest] 3043  - 2025. 05. 25. 오후 12:30:19   DEBUG [StationUpdateProcessor] No routes found for station: 219000224
[Nest] 3043  - 2025. 05. 25. 오후 12:30:26     LOG [StationUpdateService] Cleared all failed jobs
[Nest] 3043  - 2025. 05. 25. 오후 12:31:27   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000167
[Nest] 3043  - 2025. 05. 25. 오후 12:31:27   DEBUG [StationUpdateProcessor] Retrieved 7 routes for station: 219000138
[Nest] 3043  - 2025. 05. 25. 오후 12:31:28   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000160
[Nest] 3043  - 2025. 05. 25. 오후 12:31:28   DEBUG [StationUpdateProcessor] No routes found for station: 219000181
[Nest] 3043  - 2025. 05. 25. 오후 12:31:29   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000233
[Nest] 3043  - 2025. 05. 25. 오후 12:31:30   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000125
[Nest] 3043  - 2025. 05. 25. 오후 12:31:31   DEBUG [StationUpdateProcessor] Retrieved 25 routes for station: 219000163
[Nest] 3043  - 2025. 05. 25. 오후 12:31:31   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000121
[Nest] 3043  - 2025. 05. 25. 오후 12:31:32   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000145
[Nest] 3043  - 2025. 05. 25. 오후 12:31:33   DEBUG [StationUpdateProcessor] No routes found for station: 219000258
[Nest] 3043  - 2025. 05. 25. 오후 12:31:33   DEBUG [StationUpdateProcessor] Retrieved 7 routes for station: 219000112
[Nest] 3043  - 2025. 05. 25. 오후 12:31:34   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000134
[Nest] 3043  - 2025. 05. 25. 오후 12:31:35   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000442
[Nest] 3043  - 2025. 05. 25. 오후 12:31:35   DEBUG [StationUpdateProcessor] No routes found for station: 219000155
[Nest] 3043  - 2025. 05. 25. 오후 12:31:36   DEBUG [StationUpdateProcessor] Retrieved 3 routes for station: 219000177
[Nest] 3043  - 2025. 05. 25. 오후 12:31:37   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000228
[Nest] 3043  - 2025. 05. 25. 오후 12:32:44   DEBUG [StationUpdateProcessor] Retrieved 33 routes for station: 219000189
[Nest] 3043  - 2025. 05. 25. 오후 12:32:45   ERROR [StationUpdateProcessor] Error processing station 219000219: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:32:46   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000123
[Nest] 3043  - 2025. 05. 25. 오후 12:32:46   ERROR [StationUpdateProcessor] Error processing station 219000826: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:33:54   ERROR [StationUpdateProcessor] Error processing station 219000187: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:33:55   ERROR [StationUpdateProcessor] Error processing station 219000478: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:33:55   ERROR [StationUpdateProcessor] Error processing station 219000118: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:33:56   ERROR [StationUpdateProcessor] Error processing station 219000148: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:33:57   ERROR [StationUpdateProcessor] Error processing station 219000066: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:33:57   ERROR [StationUpdateProcessor] Error processing station 219000114: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:33:58   ERROR [StationUpdateProcessor] Error processing station 219000142: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:33:58   ERROR [StationUpdateProcessor] Error processing station 219000183: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:33:59   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000136
[Nest] 3043  - 2025. 05. 25. 오후 12:34:00   ERROR [StationUpdateProcessor] Error processing station 219000157: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:34:00   ERROR [StationUpdateProcessor] Error processing station 219000132: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:34:02   DEBUG [StationUpdateProcessor] Retrieved 40 routes for station: 219000191
[Nest] 3043  - 2025. 05. 25. 오후 12:34:02   DEBUG [StationUpdateProcessor] No routes found for station: 219000821
[Nest] 3043  - 2025. 05. 25. 오후 12:34:03   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000179
[Nest] 3043  - 2025. 05. 25. 오후 12:34:04   ERROR [StationUpdateProcessor] Error processing station 219000235: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:34:04   ERROR [StationUpdateProcessor] Error processing station 219000128: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:34:06   ERROR [StationUpdateProcessor] Error processing station 219000230: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:34:07   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000170
[Nest] 3043  - 2025. 05. 25. 오후 12:34:07   DEBUG [StationUpdateProcessor] No routes found for station: 219000226
[Nest] 3043  - 2025. 05. 25. 오후 12:34:08   DEBUG [StationUpdateProcessor] No routes found for station: 219000216
[Nest] 3043  - 2025. 05. 25. 오후 12:34:08   DEBUG [StationUpdateProcessor] No routes found for station: 219000221
[Nest] 3043  - 2025. 05. 25. 오후 12:34:09   ERROR [StationUpdateProcessor] Error processing station 219000165: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:34:10   ERROR [StationUpdateProcessor] Error processing station 219000217: Cannot read properties of undefined (reading 'msgHeader')
[Nest] 3043  - 2025. 05. 25. 오후 12:34:10   DEBUG [StationUpdateProcessor] No routes found for station: 219000188
[Nest] 3043  - 2025. 05. 25. 오후 12:34:11   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000162
[Nest] 3043  - 2025. 05. 25. 오후 12:34:12   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000122
[Nest] 3043  - 2025. 05. 25. 오후 12:34:13   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000161
[Nest] 3043  - 2025. 05. 25. 오후 12:34:13   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000107
[Nest] 3043  - 2025. 05. 25. 오후 12:34:13     LOG [StationUpdateProcessor] Updating batch 1/2 with 33 stations
[Nest] 3043  - 2025. 05. 25. 오후 12:35:21   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000477
[Nest] 3043  - 2025. 05. 25. 오후 12:35:21   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000120
[Nest] 3043  - 2025. 05. 25. 오후 12:35:22   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000486
[Nest] 3043  - 2025. 05. 25. 오후 12:35:23   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000186
[Nest] 3043  - 2025. 05. 25. 오후 12:35:23   DEBUG [StationUpdateProcessor] No routes found for station: 219000650
[Nest] 3043  - 2025. 05. 25. 오후 12:35:24   DEBUG [StationUpdateProcessor] No routes found for station: 219000117
[Nest] 3043  - 2025. 05. 25. 오후 12:35:25   DEBUG [StationUpdateProcessor] Retrieved 10 routes for station: 219000150
[Nest] 3043  - 2025. 05. 25. 오후 12:36:32   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000489
[Nest] 3043  - 2025. 05. 25. 오후 12:36:33   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000115
[Nest] 3043  - 2025. 05. 25. 오후 12:36:34   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000146
[Nest] 3043  - 2025. 05. 25. 오후 12:36:35   DEBUG [StationUpdateProcessor] Retrieved 8 routes for station: 219000184
[Nest] 3043  - 2025. 05. 25. 오후 12:36:35   DEBUG [StationUpdateProcessor] Retrieved 7 routes for station: 219000143
[Nest] 3043  - 2025. 05. 25. 오후 12:36:36   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000113
[Nest] 3043  - 2025. 05. 25. 오후 12:36:37   DEBUG [StationUpdateProcessor] Retrieved 8 routes for station: 219000141
[Nest] 3043  - 2025. 05. 25. 오후 12:36:37   DEBUG [StationUpdateProcessor] Retrieved 28 routes for station: 219000192
[Nest] 3043  - 2025. 05. 25. 오후 12:36:38   DEBUG [StationUpdateProcessor] No routes found for station: 219000137
[Nest] 3043  - 2025. 05. 25. 오후 12:37:46   ERROR [StationUpdateProcessor] Failed to get routes for station 219000159: 결과가 존재하지 않습니다.
[Nest] 3043  - 2025. 05. 25. 오후 12:37:46   DEBUG [StationUpdateProcessor] Retrieved 8 routes for station: 219000135
[Nest] 3043  - 2025. 05. 25. 오후 12:37:47   DEBUG [StationUpdateProcessor] No routes found for station: 219000444
[Nest] 3043  - 2025. 05. 25. 오후 12:38:55   DEBUG [StationUpdateProcessor] Retrieved 13 routes for station: 219000133
[Nest] 3043  - 2025. 05. 25. 오후 12:38:56   DEBUG [StationUpdateProcessor] Retrieved 7 routes for station: 219000182
[Nest] 3043  - 2025. 05. 25. 오후 12:38:56   DEBUG [StationUpdateProcessor] Retrieved 33 routes for station: 219000131
[Nest] 3043  - 2025. 05. 25. 오후 12:38:57   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000215
[Nest] 3043  - 2025. 05. 25. 오후 12:38:58   DEBUG [StationUpdateProcessor] No routes found for station: 219000587
[Nest] 3043  - 2025. 05. 25. 오후 12:38:58   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000180
[Nest] 3043  - 2025. 05. 25. 오후 12:38:59   DEBUG [StationUpdateProcessor] No routes found for station: 219000730
[Nest] 3043  - 2025. 05. 25. 오후 12:39:00   DEBUG [StationUpdateProcessor] Retrieved 32 routes for station: 219000130
[Nest] 3043  - 2025. 05. 25. 오후 12:39:01   DEBUG [StationUpdateProcessor] Retrieved 8 routes for station: 219000151
[Nest] 3043  - 2025. 05. 25. 오후 12:39:02   DEBUG [StationUpdateProcessor] Retrieved 3 routes for station: 219000178
[Nest] 3043  - 2025. 05. 25. 오후 12:40:10   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000234
[Nest] 3043  - 2025. 05. 25. 오후 12:40:10   DEBUG [StationUpdateProcessor] Retrieved 29 routes for station: 219000190
[Nest] 3043  - 2025. 05. 25. 오후 12:40:11   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000231
[Nest] 3043  - 2025. 05. 25. 오후 12:41:19   DEBUG [StationUpdateProcessor] Retrieved 10 routes for station: 219000176
[Nest] 3043  - 2025. 05. 25. 오후 12:41:20   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000229
[Nest] 3043  - 2025. 05. 25. 오후 12:41:21   DEBUG [StationUpdateProcessor] Retrieved 13 routes for station: 219000127
[Nest] 3043  - 2025. 05. 25. 오후 12:42:29   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000227
[Nest] 3043  - 2025. 05. 25. 오후 12:42:29   DEBUG [StationUpdateProcessor] Retrieved 10 routes for station: 219000168
[Nest] 3043  - 2025. 05. 25. 오후 12:42:30   DEBUG [StationUpdateProcessor] No routes found for station: 219000225
[Nest] 3043  - 2025. 05. 25. 오후 12:42:31   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000214
[Nest] 3043  - 2025. 05. 25. 오후 12:42:32   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000223
[Nest] 3043  - 2025. 05. 25. 오후 12:42:32   DEBUG [StationUpdateProcessor] Retrieved 7 routes for station: 219000166
[Nest] 3043  - 2025. 05. 25. 오후 12:42:33   DEBUG [StationUpdateProcessor] No routes found for station: 219000220
[Nest] 3043  - 2025. 05. 25. 오후 12:42:34   DEBUG [StationUpdateProcessor] Retrieved 8 routes for station: 219000124
[Nest] 3043  - 2025. 05. 25. 오후 12:43:41   DEBUG [StationUpdateProcessor] Retrieved 10 routes for station: 219000446
[Nest] 3043  - 2025. 05. 25. 오후 12:43:42   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000213
[Nest] 3043  - 2025. 05. 25. 오후 12:43:43   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000164
[Nest] 3043  - 2025. 05. 25. 오후 12:43:44   DEBUG [StationUpdateProcessor] Retrieved 29 routes for station: 219000193
[Nest] 3043  - 2025. 05. 25. 오후 12:43:44   DEBUG [StationUpdateProcessor] No routes found for station: 219000185
[Nest] 3043  - 2025. 05. 25. 오후 12:43:45   DEBUG [StationUpdateProcessor] No routes found for station: 219000116
[Nest] 3043  - 2025. 05. 25. 오후 12:43:46   ERROR [StationUpdateProcessor] Failed to get routes for station 219000676: 결과가 존재하지 않습니다.
[Nest] 3043  - 2025. 05. 25. 오후 12:43:46     LOG [StationUpdateProcessor] Updating batch 2/2 with 50 stations
[Nest] 3043  - 2025. 05. 25. 오후 12:43:46    WARN [StationUpdateProcessor] Failed to update 19 stations
```
- 12시 30분경 100건의 데이터를 요청하는 batch api 요청 -> 12시 43분경 종료 :: 약 13분
- bull을 쓰려고 했던 의도가 이렇게 처리하려고 한게 아니였는데 ㅡ.,ㅡ...;;; 공부가 부족했던듯...;;

----

2. 개선점
- 작업 분산처리 할 메인 스케쥴러 만듬
- 해당 스케쥴러에서 여러개로 뽀갬

```typescript
@Process('schedule-station-updates')
async processScheduleStationUpdates(job: Job<{ limit: number }>) {
    const { limit } = job.data
    this.logger.log(`Processing schedule station updates job with limit: ${limit}`)

    try {
        const stationList = await this.stationService.getStationListForBatch(limit)
        this.logger.log(`Retrieved ${stationList.length} stations for scheduling`)

        // 스테이션 목록을 배치로 분할
        const totalBatches = Math.ceil(stationList.length / this.BATCH_SIZE)
        const jobPromises = []

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const startIdx = batchIndex * this.BATCH_SIZE
            const endIdx = Math.min(startIdx + this.BATCH_SIZE, stationList.length)
            const batchStations = stationList.slice(startIdx, endIdx)

            // 각 배치를 별도의 Bull 작업으로 큐에 추가
            const jobPromise = this.stationQueue.add('process-station-batch', {
                batchIndex: batchIndex + 1,
                totalBatches,
                stations: batchStations,
                parentJobId: job.id,
            }, {
                removeOnComplete: false, // 일단 확인을 위해 전부 다남김
                removeOnFail: false,
                attempts: 2,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            })

            jobPromises.push(jobPromise)
        }

        // queue add
        await Promise.all(jobPromises)

        this.logger.log(`Scheduled ${totalBatches} batch jobs for parallel processing`)
        return {
            scheduled: true,
            totalBatches,
            totalStations: stationList.length,
        }

    } catch (error) {
        this.logger.error(`Error processing update station routes job: ${error.message}`)
        throw error
    }
}
```
- parent queue 가 있고 안에 children queue 가 들어가는 구조
```log
[Nest] 4614  - 2025. 05. 25. 오후 2:00:59     LOG [StationUpdateService] Triggered station update job with ID: 6, limit: 50
[Nest] 4614  - 2025. 05. 25. 오후 2:00:59     LOG [StationUpdateProcessor] Processing schedule station updates job with limit: 50
[Nest] 4614  - 2025. 05. 25. 오후 2:00:59     LOG [StationUpdateProcessor] Retrieved 50 stations for scheduling
[Nest] 4614  - 2025. 05. 25. 오후 2:00:59     LOG [StationUpdateProcessor] Scheduled 3 batch jobs for parallel processing
[Nest] 4614  - 2025. 05. 25. 오후 2:00:59     LOG [StationUpdateProcessor] Processing batch 1/3 with 20 stations (Parent Job: 6)
[Nest] 4614  - 2025. 05. 25. 오후 2:00:59     LOG [StationUpdateProcessor] Processing batch 2/3 with 20 stations (Parent Job: 6)
[Nest] 4614  - 2025. 05. 25. 오후 2:00:59     LOG [StationUpdateProcessor] Processing batch 3/3 with 10 stations (Parent Job: 6)
[Nest] 4614  - 2025. 05. 25. 오후 2:00:59   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000202
[Nest] 4614  - 2025. 05. 25. 오후 2:00:59   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000199
[Nest] 4614  - 2025. 05. 25. 오후 2:00:59   ERROR [StationUpdateProcessor] Failed to get routes for station 219000238: 결과가 존재하지 않습니다.
[Nest] 4614  - 2025. 05. 25. 오후 2:01:00   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000210
[Nest] 4614  - 2025. 05. 25. 오후 2:01:00   DEBUG [StationUpdateProcessor] Retrieved 7 routes for station: 219000142
[Nest] 4614  - 2025. 05. 25. 오후 2:01:00   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000264
[Nest] 4614  - 2025. 05. 25. 오후 2:01:00   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000448
[Nest] 4614  - 2025. 05. 25. 오후 2:01:01   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000066
[Nest] 4614  - 2025. 05. 25. 오후 2:01:01   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000235
[Nest] 4614  - 2025. 05. 25. 오후 2:01:02   DEBUG [StationUpdateProcessor] No routes found for station: 219000217
[Nest] 4614  - 2025. 05. 25. 오후 2:01:02   DEBUG [StationUpdateProcessor] Retrieved 3 routes for station: 219000148
[Nest] 4614  - 2025. 05. 25. 오후 2:01:03   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000307
[Nest] 4614  - 2025. 05. 25. 오후 2:01:04   DEBUG [StationUpdateProcessor] Retrieved 12 routes for station: 219000132
[Nest] 4614  - 2025. 05. 25. 오후 2:01:05   DEBUG [StationUpdateProcessor] Retrieved 8 routes for station: 219000239
[Nest] 4614  - 2025. 05. 25. 오후 2:01:06   DEBUG [StationUpdateProcessor] Retrieved 10 routes for station: 219000207
[Nest] 4614  - 2025. 05. 25. 오후 2:01:06   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000208
[Nest] 4614  - 2025. 05. 25. 오후 2:02:07   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000300
[Nest] 4614  - 2025. 05. 25. 오후 2:02:07   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000204
[Nest] 4614  - 2025. 05. 25. 오후 2:02:08   DEBUG [StationUpdateProcessor] Retrieved 3 routes for station: 219000203
[Nest] 4614  - 2025. 05. 25. 오후 2:02:09   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000298
[Nest] 4614  - 2025. 05. 25. 오후 2:02:09   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000230
[Nest] 4614  - 2025. 05. 25. 오후 2:02:14   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000114
[Nest] 4614  - 2025. 05. 25. 오후 2:03:17   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000299
[Nest] 4614  - 2025. 05. 25. 오후 2:03:17   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000826
[Nest] 4614  - 2025. 05. 25. 오후 2:03:17   DEBUG [StationUpdateProcessor] No routes found for station: 219000261
[Nest] 4614  - 2025. 05. 25. 오후 2:03:18   DEBUG [StationUpdateProcessor] Retrieved 8 routes for station: 219000271
[Nest] 4614  - 2025. 05. 25. 오후 2:03:18   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000201
[Nest] 4614  - 2025. 05. 25. 오후 2:03:19   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000272
[Nest] 4614  - 2025. 05. 25. 오후 2:03:19   ERROR [StationUpdateProcessor] Failed to get routes for station 219000211: 결과가 존재하지 않습니다.
[Nest] 4614  - 2025. 05. 25. 오후 2:03:19   DEBUG [StationUpdateProcessor] Retrieved 8 routes for station: 219000267
[Nest] 4614  - 2025. 05. 25. 오후 2:03:19   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000478
[Nest] 4614  - 2025. 05. 25. 오후 2:03:20     LOG [StationUpdateProcessor] Batch 3/3 completed: updated 10 stations
[Nest] 4614  - 2025. 05. 25. 오후 2:03:20    WARN [StationUpdateProcessor] Batch 3/3 had 1 failed stations
[Nest] 4614  - 2025. 05. 25. 오후 2:03:22   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000118
[Nest] 4614  - 2025. 05. 25. 오후 2:03:22   DEBUG [StationUpdateProcessor] Retrieved 8 routes for station: 219000269
[Nest] 4614  - 2025. 05. 25. 오후 2:03:23   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000157
[Nest] 4614  - 2025. 05. 25. 오후 2:03:24   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000275
[Nest] 4614  - 2025. 05. 25. 오후 2:03:25   DEBUG [StationUpdateProcessor] Retrieved 7 routes for station: 219000279
[Nest] 4614  - 2025. 05. 25. 오후 2:03:25   DEBUG [StationUpdateProcessor] No routes found for station: 219000276
[Nest] 4614  - 2025. 05. 25. 오후 2:03:26   ERROR [StationUpdateProcessor] Failed to get routes for station 218000775: 결과가 존재하지 않습니다.
[Nest] 4614  - 2025. 05. 25. 오후 2:04:27   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000306
[Nest] 4614  - 2025. 05. 25. 오후 2:04:27   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000305
[Nest] 4614  - 2025. 05. 25. 오후 2:04:28   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000314
[Nest] 4614  - 2025. 05. 25. 오후 2:04:34   DEBUG [StationUpdateProcessor] Retrieved 2 routes for station: 219000197
[Nest] 4614  - 2025. 05. 25. 오후 2:04:34   DEBUG [StationUpdateProcessor] No routes found for station: 219000165
[Nest] 4614  - 2025. 05. 25. 오후 2:04:34     LOG [StationUpdateProcessor] Batch 1/3 completed: updated 20 stations
[Nest] 4614  - 2025. 05. 25. 오후 2:04:34    WARN [StationUpdateProcessor] Batch 1/3 had 2 failed stations
[Nest] 4614  - 2025. 05. 25. 오후 2:05:36   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000301
[Nest] 4614  - 2025. 05. 25. 오후 2:05:36   DEBUG [StationUpdateProcessor] Retrieved 8 routes for station: 219000278
[Nest] 4614  - 2025. 05. 25. 오후 2:05:37   DEBUG [StationUpdateProcessor] No routes found for station: 219000277
[Nest] 4614  - 2025. 05. 25. 오후 2:05:38   DEBUG [StationUpdateProcessor] Retrieved 6 routes for station: 219000280
[Nest] 4614  - 2025. 05. 25. 오후 2:06:45   DEBUG [StationUpdateProcessor] Retrieved 5 routes for station: 219000265
[Nest] 4614  - 2025. 05. 25. 오후 2:06:46   DEBUG [StationUpdateProcessor] Retrieved 3 routes for station: 219000196
[Nest] 4614  - 2025. 05. 25. 오후 2:06:46   DEBUG [StationUpdateProcessor] Retrieved 4 routes for station: 219000194
[Nest] 4614  - 2025. 05. 25. 오후 2:06:47     LOG [StationUpdateProcessor] Batch 2/3 completed: updated 20 stations
```
- 요청 데이터 자체를 100건에서 50건 정도로 줄여서 시간도 그만큼 줄었지만, 로그 보면 job 자체가 병렬처리 된건 맞는듯함
- API 호출 타임아웃 관련도 수정
```typescript
interface FetchOptions {
    timeout?: number
    retries?: number
    logMetrics?: boolean
}

export const fetchApiGet = async <T>(
        url: string,
        header?: Record<string, string>,
        options?: FetchOptions
): Promise<T | null> => {

    const { timeout = 15000, retries = 2, logMetrics = false } = options || {} // default options

    let axiosHeader = {
        'Content-Type': 'application/json',
    }

    if (header && Object.entries(header).length > 0) {
        axiosHeader = {
            ...axiosHeader,
            ...header,
        }
    }

    // 재시도 로직
    for (let attempt = 0; attempt <= retries; attempt++) {
        const startTime = Date.now();

        try {
            const response = await axios.get(url, {
                headers: axiosHeader,
                timeout: timeout,
            });

            // 성능체크
            if (logMetrics) {
                const duration = Date.now() - startTime;
                if (duration > 10000) {
                    console.warn(`Slow API response: ${duration}ms - ${url}`)
                } else {
                    console.log(`API response: ${duration}ms`)
                }
            }
            return response.data
        } catch (err) {
            const duration = Date.now() - startTime;

            const shouldRetry = attempt < retries && (
                    err.code === 'ECONNRESET' ||
                    err.code === 'ETIMEDOUT' ||
                    err.code === 'ENOTFOUND' ||
                    err.response?.status >= 500
            )

            if (shouldRetry) {
                const delay = (attempt + 1) * 1000
                if (logMetrics) {
                    console.log(`Retrying API call (${attempt + 1}/${retries}) after ${delay}ms: ${err.message}`)
                }
                await new Promise(resolve => setTimeout(resolve, delay))
                continue
            }

            if (logMetrics) {
                console.error(`API call failed after ${duration}ms: ${err.message}`)
            }
            console.error('error fetch get API data : ', err)
            throw err
        }
    }
}
```
- axios 호출할때 timeout 설정 및 재시도 관련 option 추가
- 15000 정도로 주니 확실히 timeout 나는 건들 몇개 있긴 함
- 최종 개선 버전 (limit 100)
```log
-- 최초 배치 시작시점
{"context":"StationUpdateService","level":"info","message":"Triggered station update job with ID: 18, limit: 100","timestamp":"2025-05-25 15:30:53"}

-- 20개씩 잘라서 총 5개로 나눴을때 로그
{"timestamp":"2025-05-25 15:31:20","level":"info","context":26246,"message":"Batch 4 Total Processing"}
{"timestamp":"2025-05-25 15:32:18","level":"info","context":25965,"message":"Batch 2 Total Processing"}
{"timestamp":"2025-05-25 15:32:18","level":"info","context":25965,"message":"Batch 3 Total Processing"}
{"timestamp":"2025-05-25 15:32:28","level":"info","context":25964,"message":"Batch 5 Total Processing"}
{"timestamp":"2025-05-25 15:32:28","level":"info","context":25964,"message":"Batch 1 Total Processing"}
```
- 2분정도로 단축 시킨듯!?

--- 

3. 생각해보기
- 아무래도 외부 api 호출하는 구간이 있다보니 병목을 완전히 줄이는건 한계가 있어보임..ㅠ
- 25000 으로 설정해도 생각 이상으로 timeout 자주 발생함
- 해당 배치는 어차피 자주 업데이트 할 필요가 없어서 하루 100건정도 매일 도는 배치로 일단 생각해야할듯