## stop-line-monitor
#### nest.js 로 연습해보는 수도권 버스정보 모니터링


----
#### 2025.05.25 기준 완료된 작업 
1. 각 정류소별 정차하는 버스 정보 조회 ✅ 
2. 정류소 데이터 routes 추가 ✅  -> 오전 10시 100개의 데이터 업데이트


#### Next Jobs
1. 노선 별 실시간 위치 적재 배치
2. Jenkins CI/CD 구성
3. 언제쯤 해당 노선에 도착할지 예측하는 서비스 만들기?! (근데 이거 데이터 많이 필요한데ㅠㅠ)
----


##### mongo DB 설계
```markdown
database : stop-line-monitor
컬렉션으로 분할

- station (static)
_id: stationId 
stationManageNo: 정류소 번호
cityCode: 도시 코드
stationName: 정류소 이름
routes: 정차 노선 리스트

- bus (static)
routeId: 노선번호
licensePlate: 차량번호

- stopEvent (batch job)
stationManageNo
routeId
arrivalDt: 도착
departureDt: 출발
```

---

#### Scheduling
```
Request Scheduler(BollMQ / Agenda) → Job Queue → Worker → MongoDB
```
---

#### route lists
- 경기데이터드림 -> 해당 사이트에서 고양시 버스정류소 리스트 가져옴
- 정차 노선 리스트 -> 이건 공공데이터포털 API 로 가야함
  - 정류소 경유노선 목록조회 API 로 얻을 수 있음
- 정류소별 노선 리스트 넣을때 -> stationId 가 중복일수도 있어서 위/경도 추가 비교 필요함
  - stationId 가 PK 인것 같긴 한데 ... 위/경도가 정확하게 올지를 모르겠어서, 일단 API 먼저 호출해보고 값 확인해야함 
  - 경기버스정보에서 제공하는 API 페이지 기준으로 확인해본 결과 일치하는것 같음 ㅇㅂㅇ
---
#### Public API List
```markdown
정류소명/번호 목록조회
- https://www.gbis.go.kr/gbis2014/publicService.action?cmd=mBusStation

정류소 경유노선 목록조회
- https://www.gbis.go.kr/gbis2014/publicService.action?cmd=mBusStationRoute
```
