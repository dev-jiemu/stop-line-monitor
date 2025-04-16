## stop-line-monitor
#### next.js 로 연습해보는 수도권 버스정보 모니터링


----
##### 해야할일 정리
1. 각 정류소별 정차하는 버스 정보 조회
2. 정류소 데이터 routes 추가

** 주의 <br>
~~중복 체크 제외되었기 때문에 정류소 판별할때 stationNo 만 비교하면 안됨~~ <br>
2025.04.16 수정 : stationManageNo 말고 `stationId` PK

----

##### mongo DB 설계
```markdown
database : bus-info
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

- stopEvent
stationManageNo
routeId
arrivalDt: 도착
departureDt: 출발
```

example)
```
{
  _id: '219000572', // STATION_ID
  stationManageNo: '20482',
  cityCode: '41280',
  cityName: '고양시',
  stationName: '백석역2번출구',
  stationType: '노변정류장',
  coordinates: {
    lat: 37.6425,
    lon: 126.7876333
  },
  engStationName: 'Baekseok Station Exit 2',
  address: '경기도 고양시 일산동구 백석동',
  jurisdiction: '경기도 고양시',
  routes: []
}
```
```typescript
db.station.createIndex({ _id: 1 }, { unique: true });
```
---

#### Scheduling
```
Request Scheduler(BollMQ / Agenda) → Job Queue → Worker → MongoDB
```