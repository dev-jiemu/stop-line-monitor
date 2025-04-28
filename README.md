## stop-line-monitor
#### next.js 로 연습해보는 수도권 버스정보 모니터링


----
#### 해야할일 정리
1. 각 정류소별 정차하는 버스 정보 조회 ✅ 
2. 정류소 데이터 routes 추가
3. 노선별로 실시간 데이터 받아와서 입력하는 batch 만들기

--> 여기까지 이번 branch 에서 할 일 ㅇㅂㅇ

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
  
Sample
```
// 버스정거장 info : 현재 mongodb 에 저장된 값
{
    "_id": {
        "$oid": "680d0cec6662fe28eeb1b651"
    },
    "stationId": "218000317",
    "__v": 0,
    "cityCode": "41280",
    "cityName": "고양시",
    "latitude": "37.62215",
    "longitude": "126.8375",
    "routes": [],
    "stationLoc": "경기도 고양시덕양구 행신동",
    "stationManageNo": "19348",
    "stationName": "행신초등학교(중)"
}

// gbis.go.kr 통해서 검색해보면 (search stationManageNo)
{
    "response": {
        "comMsgHeader": "",
        "msgHeader": {
            "queryTime": "2025-04-27 22:21:01.434",
            "resultCode": 0,
            "resultMessage": "정상적으로 처리되었습니다."
        },
        "msgBody": {
            "busStationList": {
                "centerYn": "Y",
                "mobileNo": " 19348", // stationManageNo
                "regionName": "고양",
                "stationId": 218000317,
                "stationName": "행신초등학교(중)",
                "x": 126.8375, // longitude
                "y": 37.62215 // latitude
            }
        }
    }
}

// stationId 기준으로 경유노선 검색해보면(일부생략)
{
    "response": {
        "comMsgHeader": "",
        "msgHeader": {
            "queryTime": "2025-04-27 22:23:29.207",
            "resultCode": 0,
            "resultMessage": "정상적으로 처리되었습니다."
        },
        "msgBody": {
            "busRouteList": [
                {
                    "regionName": "고양",
                    "routeDestId": 101000022,
                    "routeDestName": "숭례문",
                    "routeId": 219000013,
                    "routeName": 1000,
                    "routeTypeCd": 11,
                    "routeTypeName": "직행좌석형시내버스",
                    "staOrder": 14
                },
                {
                    "regionName": "고양",
                    "routeDestId": 101000022,
                    "routeDestName": "숭례문",
                    "routeId": 218000011,
                    "routeName": 1100,
                    "routeTypeCd": 11,
                    "routeTypeName": "직행좌석형시내버스",
                    "staOrder": 26
                } 
                // 생략
            ]
        }
    }
}
```

4/28 :: 일일 API 호출 제한이 있어서 route list 불러오는건 batch job 으로 처리해야할듯 ㅠ

---
#### Public API List
```markdown
정류소명/번호 목록조회
- https://www.gbis.go.kr/gbis2014/publicService.action?cmd=mBusStation

정류소 경유노선 목록조회
- https://www.gbis.go.kr/gbis2014/publicService.action?cmd=mBusStationRoute
```