/**
 * 전체 컬렉션의 UTC 시간을 KST로 변환하는 스크립트
 * stopevents, bustrackings, stations 모든 컬렉션 처리
 */

const mongoose = require('mongoose');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const NINE_HOURS_MS = 9 * 60 * 60 * 1000; // 9시간을 밀리초로 변환

// config.yaml에서 MongoDB URL 가져오기
function getMongoUrl() {
    try {
        const configPath = path.join(process.cwd(), 'config', 'config.yaml');
        const yamlConfig = yaml.load(fs.readFileSync(configPath, 'utf8'));
        return yamlConfig.mongo.url;
    } catch (error) {
        console.error('❌ config.yaml 파일을 읽을 수 없습니다:', error);
        console.error('환경변수 MONGODB_URI를 확인합니다...');

        const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
        if (!mongoUri) {
            throw new Error('MongoDB URL을 찾을 수 없습니다. config.yaml 또는 환경변수 MONGODB_URI를 설정해주세요.');
        }
        return mongoUri;
    }
}

// 전체 컬렉션 타임존 수정 (지정된 날짜 이후 데이터만)
async function fixAllTimezones(cutoffDateString?: string) {
    console.log('='.repeat(60));
    console.log('📅 전체 컬렉션 타임존 수정 시작');
    console.log('='.repeat(60));

    try {
        const mongoUrl = getMongoUrl();
        console.log('MongoDB 연결 중...');
        await mongoose.connect(mongoUrl);
        console.log('✅ MongoDB 연결 성공!');

        const db = mongoose.connection.db;

        // 기준일 설정 (인자로 받거나 기본값 사용)
        let cutoffDate: Date;
        if (cutoffDateString) {
            cutoffDate = new Date(cutoffDateString);
            if (isNaN(cutoffDate.getTime())) {
                throw new Error(`❌ 잘못된 날짜 형식: ${cutoffDateString}. YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm:ss 형식을 사용하세요.`);
            }
            console.log(`📅 사용자 지정 기준일: ${cutoffDate.toISOString()}`);
        } else {
            cutoffDate = new Date('2024-06-24T00:00:00.000Z');
            console.log(`📅 기본 기준일: ${cutoffDate.toISOString()}`);
        }
        console.log(`   → 이후 데이터만 UTC에서 KST로 변환합니다.`);

        // 수정할 컬렉션들
        const collections = [
            { name: 'stopevents', fields: ['createdDt'] },
            { name: 'bustrackings', fields: ['createdDt', 'updatedDt'] },
            { name: 'stations', fields: ['createdDt', 'updatedDt'] },
        ];

        let totalUpdated = 0;

        for (const collection of collections) {
            console.log(`\n🔄 ${collection.name} 컬렉션 처리 중...`);

            // 기준일 이후 데이터 개수 확인
            const targetCount = await db.collection(collection.name).countDocuments({
                createdDt: { $gte: cutoffDate }
            });
            console.log(`  대상 문서: ${targetCount}개 (${cutoffDate.toISOString()} 이후)`);

            if (targetCount === 0) {
                console.log(`  ⏭️ 수정할 데이터가 없습니다.`);
                continue;
            }

            // 수정 전 샘플 데이터 (기준일 이후)
            const sampleBefore = await db.collection(collection.name).findOne({
                createdDt: { $gte: cutoffDate }
            });
            if (sampleBefore) {
                console.log(`  수정 전 샘플: ${sampleBefore.createdDt?.toISOString()}`);
            }

            // 업데이트 쿼리 생성
            const updateFields = {};
            collection.fields.forEach(field => {
                updateFields[field] = {
                    $cond: {
                        if: { $and: [
                            { $type: `$${field}` },
                            { $gte: [`$${field}`, cutoffDate] }
                        ]},
                        then: { $add: [`$${field}`, NINE_HOURS_MS] },
                        else: `$${field}`,
                    },
                };
            });

            // 기준일 이후 데이터만 업데이트
            const result = await db.collection(collection.name).updateMany(
                { createdDt: { $gte: cutoffDate } },
                [{ $set: updateFields }],
            );

            console.log(`  ✅ ${collection.name}: ${result.modifiedCount}개 업데이트 완료`);
            totalUpdated += result.modifiedCount;

            // 수정 후 샘플 데이터
            const sampleAfter = await db.collection(collection.name).findOne({
                createdDt: { $gte: new Date(cutoffDate.getTime() + NINE_HOURS_MS) }
            });
            if (sampleAfter) {
                console.log(`  수정 후 샘플: ${sampleAfter.createdDt?.toISOString()}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`🎉 전체 수정 완료! 총 ${totalUpdated}개 문서 업데이트`);
        console.log(`📅 기준: ${cutoffDate.toISOString()} 이후 데이터만 처리`);
        console.log('='.repeat(60));

        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ 타임존 수정 중 오류:', error);
        process.exit(1);
    }
}

// 백업 생성
async function createBackup() {
    console.log('📦 전체 데이터베이스 백업 생성 중...');

    try {
        const { exec } = require('child_process');
        const fs = require('fs');
        const path = require('path');

        const backupDate = new Date().toISOString().split('T')[0];
        const backupTime = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '');
        const backupPath = path.join(process.cwd(), 'backups', `full-backup-${backupDate}-${backupTime}`);

        if (!fs.existsSync(path.join(process.cwd(), 'backups'))) {
            fs.mkdirSync(path.join(process.cwd(), 'backups'), { recursive: true });
        }

        await new Promise((resolve, reject) => {
            const mongoUrl = getMongoUrl();
            const command = `mongodump --uri="${mongoUrl}" --out="${backupPath}"`;
            console.log('백업 명령어 실행 중...');

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('백업 오류:', error);
                    reject(error);
                } else {
                    console.log('백업 출력:', stdout);
                    if (stderr) console.warn('백업 경고:', stderr);
                    resolve(stdout);
                }
            });
        });

        console.log(`✅ 백업 완료: ${backupPath}`);

    } catch (error) {
        console.error('❌ 백업 생성 오류:', error);
        throw error;
    }
}

// 데이터 확인
async function checkData() {
    console.log('🔍 현재 데이터 상태 확인...');

    try {
        const mongoUrl = getMongoUrl();
        await mongoose.connect(mongoUrl);
        const db = mongoose.connection.db;

        const collections = ['stopevents', 'bustrackings', 'stations'];

        for (const collectionName of collections) {
            console.log(`\n📊 ${collectionName}:`);

            const count = await db.collection(collectionName).countDocuments();
            console.log(`  총 개수: ${count}개`);

            if (count > 0) {
                const latest = await db.collection(collectionName)
                        .findOne({}, { sort: { _id: -1 } });

                if (latest.createdDt) {
                    console.log(`  최신 createdDt: ${latest.createdDt.toISOString()}`);
                    console.log(`  KST 표시: ${latest.createdDt.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
                }
            }
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ 데이터 확인 오류:', error);
        process.exit(1);
    }
}

// 실행 함수
async function run() {
    const args = process.argv.slice(2);
    const command = args[0];
    const dateArg = args[1]; // 두 번째 인자로 날짜 받기

    console.log('실행 명령어:', command || 'direct');
    if (dateArg) {
        console.log('기준 날짜:', dateArg);
    }

    switch (command) {
        case 'backup':
            await createBackup();
            break;
        case 'check':
            await checkData();
            break;
        case 'service':
            console.log('⚠️ service 모드는 현재 direct 모드와 동일하게 동작합니다.');
            await fixAllTimezones(dateArg);
            break;
        case 'direct':
        default:
            await fixAllTimezones(dateArg);
            break;
    }
}

if (require.main === module) {
    run().catch(console.error);
}

export { fixAllTimezones, createBackup, checkData };
