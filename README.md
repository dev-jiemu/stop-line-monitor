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

----

###### 메모;;
노트북 왔다갔다 하는 바람에 할때마다 mongo db 계정 없어서 에러남 ㅜ
``` 
// 없으면 계정 하나 만들어주라..ㅜㅠㅠ
db.createUser(
  {
    user: "mongo",
    pwd: "test",
    roles: [{ role: "readWrite", db: "stop-line-monitor" }]
  }
)

// 있는지 확인해주라..ㅠ
show users
```
경기도 공공데이터 API : 버스정류장 리스트 sample
```json
    "BusStation": [
      {
        "head": [
          {
            "list_total_count": 2197
          },
          {
            "RESULT": {
              "CODE": "INFO-000",
              "MESSAGE": "정상 처리되었습니다."
            }
          },
          {
            "api_version": "1.0"
          }
        ]
      },
      {
        "row": [
          {
            "SIGUN_NM": "고양시",
            "SIGUN_CD": "41280",
            "STATION_NM_INFO": "백석역2번출구",
            "STATION_ID": "219000572",
            "STATION_MANAGE_NO": "20482",
            "STATION_DIV_NM": "노변정류장",
            "JURISD_INST_NM": "경기도 고양시",
            "LOCPLC_LOC": "경기도 고양시 일산동구 백석동",
            "ENG_STATION_NM_INFO": "Baekseok Station Exit 2",
            "WGS84_LOGT": "126.7876333",
            "WGS84_LAT": "37.6425"
          },
          {
            "SIGUN_NM": "고양시",
            "SIGUN_CD": "41280",
            "STATION_NM_INFO": "잣골",
            "STATION_ID": "219000070",
            "STATION_MANAGE_NO": "20377",
            "STATION_DIV_NM": "노변정류장",
            "JURISD_INST_NM": "경기도 고양시",
            "LOCPLC_LOC": "경기도 고양시 일산동구 성석동",
            "ENG_STATION_NM_INFO": "Jatgol",
            "WGS84_LOGT": "126.7933333",
            "WGS84_LAT": "37.6876"
          },
          {
            "SIGUN_NM": "고양시",
            "SIGUN_CD": "41280",
            "STATION_NM_INFO": "초가집.저동고교",
            "STATION_ID": "219000111",
            "STATION_MANAGE_NO": "20277",
            "STATION_DIV_NM": "노변정류장",
            "JURISD_INST_NM": "경기도 고양시",
            "LOCPLC_LOC": "경기도 고양시 일산동구 정발산동",
            "ENG_STATION_NM_INFO": "Chogajib, Jeodong High School",
            "WGS84_LOGT": "126.781",
            "WGS84_LAT": "37.6695667"
          },
          {
            "SIGUN_NM": "고양시",
            "SIGUN_CD": "41280",
            "STATION_NM_INFO": "희망원",
            "STATION_ID": "219000109",
            "STATION_MANAGE_NO": "20429",
            "STATION_DIV_NM": "노변정류장",
            "JURISD_INST_NM": "경기도 고양시",
            "LOCPLC_LOC": "경기도 고양시 일산동구 문봉동",
            "ENG_STATION_NM_INFO": "Huimangwon",
            "WGS84_LOGT": "126.82185",
            "WGS84_LAT": "37.7028167"
          },
          {
            "SIGUN_NM": "고양시",
            "SIGUN_CD": "41280",
            "STATION_NM_INFO": "문봉빌라단지",
            "STATION_ID": "219000108",
            "STATION_MANAGE_NO": "20427",
            "STATION_DIV_NM": "노변정류장",
            "JURISD_INST_NM": "경기도 고양시",
            "LOCPLC_LOC": null,
            "ENG_STATION_NM_INFO": "Munbong Villa Complex ",
            "WGS84_LOGT": "126.8186667",
            "WGS84_LAT": "37.7041167"
          },
          {
            "SIGUN_NM": "고양시",
            "SIGUN_CD": "41280",
            "STATION_NM_INFO": "성석초교",
            "STATION_ID": "219000107",
            "STATION_MANAGE_NO": "20424",
            "STATION_DIV_NM": "노변정류장",
            "JURISD_INST_NM": "경기도 고양시",
            "LOCPLC_LOC": "경기도 고양시 일산동구 문봉동",
            "ENG_STATION_NM_INFO": "Seongseok Elementary School",
            "WGS84_LOGT": "126.8128667",
            "WGS84_LAT": "37.7066"
          }
        ]
      }
    ]

```