## 타임존 수정 스크립트

😂 서버 설정 이슈로 인해 날짜 데이터가 UTC 로 저장중이였음 

나중에 기존 데이터 기반 평균 내거나 1일전, 2일전 데이터 추출할때 문제 생김

### 작업 순서
   ```bash
   # 1단계: 백업 (필수!)
   npm run script:timezone-backup
   
   # 2단계: 전체 타임존 수정
   npm run script:timezone-direct
   
   # 3단계: 결과 확인 (KST 표시 시간이 +9 시간일 경우 정상처리)
   npm run script:timezone-check
   ```

### 스크립트 설명
- `script:timezone-backup`: MongoDB 백업 생성
- `script:timezone-check`: 현재 데이터의 시간 정보 확인
- `script:timezone-fix`: NestJS를 통한 안전한 업데이트
- `script:timezone-direct`: MongoDB 직접 업데이트

## ❗️주의사항

### 백업 필수
- 데이터 수정 전 반드시 백업을 생성하세요
- 백업은 `backups/` 폴더에 저장됩니다
