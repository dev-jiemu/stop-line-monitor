## stop-line-monitor
#### next.js 로 연습해보는 수도권 버스정보 모니터링

----

##### mongo DB 설계
```markdown
database : bus-info
컬렉션으로 분할

- station
stationManageNo: 정류소 번호 (PK)
cityCode: 도시 코드
stationName: 정류소 이름
routes: 정차 노선 리스트

- bus
routeId: 노선번호
licensePlate: 차량번호

- stopEvent
stationManageNo
routeId
arrivalDt: 도착
departureDt: 출발
```