### 2025.05.26 버스 실시간 위치 적재 Architecture

---

#### 현재 MongoDB 에 적재되어 있는 정류장 정보 데이터 Sample
```json
{
  "stationId": "218000316",
  "__v": 0,
  "cityCode": "41280",
  "cityName": "고양시",
  "createdDt": {
    "$date": "2025-05-04T07:14:27.358Z"
  },
  "latitude": "37.6267",
  "longitude": "126.8302",
  "routes": [
    {
      "routeId": 219000013,
      "routeDestId": 101000022,
      "routeName": "1000"
    },
    {
      "routeId": 218000011,
      "routeDestId": 101000022,
      "routeName": "1100"
    },
    {
      "routeId": 219000016,
      "routeDestId": 101000022,
      "routeName": "1200"
    },
    {
      "routeId": 219000027,
      "routeDestId": 101000022,
      "routeName": "1900"
    },
    {
      "routeId": 219000026,
      "routeDestId": 121000215,
      "routeName": "9700"
    },
    {
      "routeId": 100100607,
      "routeDestId": 121000221,
      "routeName": "9711"
    },
    {
      "routeId": 232000122,
      "routeDestId": 218001019,
      "routeName": "2000"
    } // 생략
  ],
  "stationLoc": "경기도 고양시덕양구 토당동",
  "stationManageNo": "19065",
  "stationName": "고양경찰서(중)",
  "updatedDt": {
    "$date": "2025-05-25T06:55:53.422Z"
  }
}
```

#### 버스정보 실시간 위치 조회 API Sample
```json
{
    "response": {
        "comMsgHeader": "",
        "msgHeader": {
            "queryTime": "2025-05-26 16:05:05.472",
            "resultCode": 0,
            "resultMessage": "정상적으로 처리되었습니다."
        },
        "msgBody": {
            "busLocationList": [
                {
                    "crowded": 1,
                    "lowPlate": 0,
                    "plateNo": "경기77바3471",
                    "remainSeatCnt": 45,
                    "routeId": 219000026,
                    "routeTypeCd": 11,
                    "stateCd": 2,
                    "stationId": 219000363,
                    "stationSeq": 6,
                    "taglessCd": 1,
                    "vehId": 234001381
                },
                {
                    "crowded": 1,
                    "lowPlate": 0,
                    "plateNo": "경기73아1419",
                    "remainSeatCnt": 39,
                    "routeId": 219000026,
                    "routeTypeCd": 11,
                    "stateCd": 2,
                    "stationId": 277103680,
                    "stationSeq": 36,
                    "taglessCd": 1,
                    "vehId": 218000322
                },
                {
                    "crowded": 1,
                    "lowPlate": 0,
                    "plateNo": "경기77바3472",
                    "remainSeatCnt": 34,
                    "routeId": 219000026,
                    "routeTypeCd": 11,
                    "stateCd": 2,
                    "stationId": 277103397,
                    "stationSeq": 56,
                    "taglessCd": 1,
                    "vehId": 234001382
                }
            ]
        }
    }
}
```
- 해당 Sample 데이터 기준으로 내가 필요한 정보
    - stationId(해당 노선의 현재 정류소 위치)
    - stateCd(1: 정류소 도착, 2: 정류소 출발)
    - crowded(1: 여유, 2: 보통, 3: 혼잡, 4: 매우혼잡)
    - remainSeatCnt(특정 시간대에 가장 사람이 얼마나 많은지에 대한 지표로도 쓰일수 있을듯!)

#### MongoDB 스키마 초안
```typescript
@Schema()
export class StopEvent {
    @Prop({ required: true, unique: true })
    eventId: string // `${routeId}_${vehId}_${stationId}_${timestamp}` 형태

    @Prop({ required: true })
    routeId: number

    @Prop({ required: true })
    vehId: number

    @Prop({ required: true })
    stationId: string

    @Prop({ default: Date.now })
    createdDt: Date

    @Prop()
    remainSeatCnt?: number
}

@Schema()
export class Bus {
    @Prop({ required: true, unique: true })
    routeId: number

    @Prop({ required: true })
    routeName: string

    @Prop({ required: true })
    routeDestId: number

    @Prop({ default: Date.now })
    createdDt: Date

    @Prop({ default: Date.now })
    updatedDt: Date

    @Prop({ default: false })
    isTracking: boolean
}
```

---

#### API 개발 초안
1. 노선 추적 관리 API 
- 1.1 노선 추적 시작
`POST /bus/tracking/routes/:routeName`
  - 기능: 특정 노선에 대한 실시간 위치 데이터 수집 시작
  - 유효성 검증: 고양시 경유 노선 여부 확인 (Station 컬렉션의 routes 배열 매칭)
  - 처리 로직: Bus 컬렉션에서 해당 노선의 isTracking을 true로 업데이트 또는 insert
  - 에러 처리: 고양시 미경유 노선 시 400 Bad Request 반환

- 노선 추적 중단 `DELETE /bus/tracking/routes/:routeName`
  - 기능: 특정 노선에 대한 실시간 위치 데이터 수집 중단
  - 처리 로직: 해당 노선의 isTracking을 false로 업데이트

2. 실시간 위치 조회 API
- 노선별 현재 버스 위치 조회 `GET /bus/tracking/routes/:routeName/current`
  - 기능: 특정 노선의 현재 운행 중인 모든 버스의 실시간 위치 정보 제공
  - 데이터: 차량별 현재 위치, 혼잡도, 잔여 좌석 수, 운행 상태
  - 외부 API 호출: 공공데이터 버스 위치 API 실시간 호출

- 정류장별 도착 예정 버스 조회 `GET /bus/tracking/stations/:stationId/arrivals`
  - 기능: 특정 정류장에 도착 예정인 버스들의 정보 제공
  - 데이터: 노선별 도착 예정 시간, 혼잡도, 잔여 좌석 수


#### Batch 개발 초안
- 실시간 위치 데이터 수집 배치
  - 실행 주기: 10분 간격 (@Cron('*/10 * * * *'))
  - 실행 시간: 24시간 연중무휴
    - 버스 막차시간 ~ 버스 첫차시간 사이엔 데이터 조회 안해도 됨 ** 날짜 체크 확인 필요
  - timeout: API 호출당 30초 제한

- 배치 처리 플로우
  - isTracking=true인 노선 조회
  - 공공데이터 API 호출 (for bull queue)
  - stateCd=1(정류소 도착)인 데이터만 필터링? (둘다 남길까..?)
  - StopEvent 데이터 생성 및 MongoDB 저장
  - 에러 발생 시 로깅 처리만 하고 다음 노선 계속 진행

