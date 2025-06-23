## stop-line-monitor
#### nest.js 로 연습해보는 수도권 버스정보 모니터링


----
#### 2025.06.23 기준 완료된 작업 
1. 트래킹 요청 노선 별 실시간 위치 적재 배치 ✅
2. Jenkins 환경 구성 ✅
   - 일단 브랜치 선택해서 직접 빌드하는 환경으로 구성함 (배포 자동화 필요하면 웹훅 활성화)

#### Next Job
1. 언제쯤 해당 노선에 도착할지 예측하는 서비스 만들기
   - Slack 으로 알람 보내주기
     - 주기적으로 버스 정보 노티해주는 알람
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
