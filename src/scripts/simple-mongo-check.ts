/**
 * 간단한 MongoDB 연결 및 컬렉션 확인 스크립트
 */

const mongoose = require('mongoose');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

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

async function simpleMongoCheck() {
    try {
        const mongoUrl = getMongoUrl();
        console.log('MongoDB 연결 중...');
        await mongoose.connect(mongoUrl);

        console.log('✅ MongoDB 연결 성공!');

        // 컬렉션 목록 확인
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('\n📊 컬렉션 목록:');
        collections.forEach((collection, index) => {
            console.log(`  ${index + 1}. ${collection.name}`);
        });

        // 각 컬렉션의 데이터 개수와 샘플 확인
        console.log('\n📈 컬렉션 상세 정보:');
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`\n${collection.name}: ${count}개`);

            if (count > 0) {
                // 최신 데이터 1개 가져오기
                const sample = await db.collection(collection.name)
                        .findOne({}, { sort: { _id: -1 } });

                console.log('  최신 데이터 샘플:');
                if (sample.createdDt) {
                    console.log(`    createdDt: ${sample.createdDt}`);
                    console.log(`    createdDt (ISO): ${sample.createdDt.toISOString()}`);
                    console.log(`    createdDt (KST): ${sample.createdDt.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
                }
                if (sample.updatedDt) {
                    console.log(`    updatedDt: ${sample.updatedDt.toISOString()}`);
                }
                if (sample.eventId) {
                    console.log(`    eventId: ${sample.eventId}`);
                }
                if (sample.trackingKey) {
                    console.log(`    trackingKey: ${sample.trackingKey}`);
                }
            }
        }

        await mongoose.disconnect();
        console.log('\n✅ 확인 완료');

    } catch (error) {
        console.error('❌ 오류 발생:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    simpleMongoCheck().catch(console.error);
}

export { simpleMongoCheck };
