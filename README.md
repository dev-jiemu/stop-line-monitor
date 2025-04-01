## stop-line-monitor
#### next.js 로 연습해보는 수도권 버스정보 모니터링


----
##### 해야할일 정리
1. 각 정류소별 정차하는 버스 정보 조회
2. 정류소 데이터 routes 추가

** 주의 <br>
`중복 체크 제외` 되었기 때문에 정류소 판별할때 stationNo 만 비교하면 안됨

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
