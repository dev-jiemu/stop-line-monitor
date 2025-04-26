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
  "stationId": "219000190", // PK
  "cityCode": "41280",
  "cityName": "고양시",
  "latitude": "37.6674833",
  "longitude": "126.7661833",
  "routes": [],
  "stationLoc": "경기도 고양시 일산서구 주엽동",
  "stationManageNo": "20166",
  "stationName": "강선마을(중)"
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
---

#### route lists
- 경기데이터드림 -> 해당 사이트에서 고양시 버스정류소 리스트 가져옴
- 정차 노선 리스트 -> 이건 공공데이터포털 API 로 가야함
- 정류소별 노선 리스트 넣을때 -> stationId가 중복일수도 있어서 위/경도 추가 비교 필요함

* stationManageNo 고정값인거 알겠는데... 위/경도가 정확하게 올지를 모르겠어서, 일단 API 먼저 호출해보고 값 확인해야함

<br> sample)

```json
{
  "stationId": "219000996",
  "__v": 0,
  "cityCode": "41280",
  "cityName": "고양시",
  "latitude": "37.6430667", // 비교필요 1
  "longitude": "126.7906167", // 비교필요 2
  "routes": [],
  "stationLoc": "경기도 고양시 일산동구 백석동",
  "stationManageNo": "20664", // select equals * 
  "stationName": "고양(백석)종합터미널"
}
```

---
#### Public API List
- https://www.data.go.kr/data/15080662/openapi.do#/API%20%EB%AA%A9%EB%A1%9D/getBusRouteListv2
- https://www.data.go.kr/data/15080346/openapi.do#/API%20%EB%AA%A9%EB%A1%9D/getBusArrivalListv2