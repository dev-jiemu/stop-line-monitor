## 타임존 수정 스크립트

😂 서버 설정 이슈로 인해 날짜 데이터가 UTC 로 저장중이였음 

나중에 기존 데이터 기반 평균 내거나 1일전, 2일전 데이터 추출할때 문제 생김

### 작업 순서
   ```bash
   # 1단계: 백업 (필수!)
   npm run script:timezone-backup
   
   # 2단계: 전체 타임존 수정
   # 6월 25일 이후 데이터만 수정
   npm run script:timezone-direct -- 2024-06-25
   
   # 특정 시간 기준 (ISO 형식)
   npm run script:timezone-direct -- 2024-06-25T10:30:00Z
   
   # 2단계 : 개발 환경에서 실행시 -- 빌드 없이 바로 실행
   npm run script:timezone-direct:dev -- 2024-06-25
   npm run script:timezone-check:dev
   npm run script:timezone-backup:dev
  
   # 3단계: 결과 확인 (KST 표시 시간이 +9 시간일 경우 정상처리)
   npm run script:timezone-check
   npm run script:timezone-check:dev
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
