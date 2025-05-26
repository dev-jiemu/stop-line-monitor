## stop-line-monitor
#### nest.js 로 연습해보는 수도권 버스정보 모니터링


----
#### 2025.05.25 기준 완료된 작업 
1. 각 정류소별 정차하는 버스 정보 조회 ✅ 
2. 정류소 데이터 routes 추가 ✅  -> 오전 10시 100개의 데이터 업데이트

#### Next Jobs
1. 노선 별 실시간 위치 적재 배치
   - 적재 처리 요청할 API 개발 필요
   - 해당 API 요청이 왔다면 해당 노선번호 기준으로 데이터 적재 처리
   - 적재를 요청할 플랫폼 구성 필요(그냥 간단한 모바일 UI 만들까..? 🤔)
2. Jenkins CI/CD 구성
3. 언제쯤 해당 노선에 도착할지 예측하는 서비스 만들기
   - Slack 으로 알람 보내주기
     - 주기적으로 버스 정보 노티해주는 알람
     - 특정 날짜, 특정 시간에 출발할거라면(요청 API 필요) '이쯤 너가 정류장 오면 될것 같아!' 알려주는 알람도 괜찮을듯
----

#### Scheduling (Batch Job)
```
Request Scheduler(BollMQ / Agenda) → Job Queue → Worker → MongoDB
```
---
#### Public API List
```markdown
정류소명/번호 목록조회
- https://www.gbis.go.kr/gbis2014/publicService.action?cmd=mBusStation

정류소 경유노선 목록조회
- https://www.gbis.go.kr/gbis2014/publicService.action?cmd=mBusStationRoute

버스위치정보 조회 서비스
- https://www.gbis.go.kr/gbis2014/publicService.action?cmd=mBusLocation
```
