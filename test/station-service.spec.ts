import { StationService } from '../src/modules/station/station.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Station, StationSchema } from '../src/schemas/station.schema';


// TODO : connect
describe('StationService', () => {
    let service: StationService
    let module: TestingModule
    let configService: ConfigService

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [require('./test.config')],
                    isGlobal: true
                }),
                MongooseModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (configService: ConfigService) => ({
                        uri: configService.get('mongodb.uri'),
                    }),
                    inject: [ConfigService],
                }),
                MongooseModule.forFeature([
                    { name: Station.name, schema: StationSchema }
                ])
            ],
            providers: [
                StationService,
            ],
        }).compile()

        service = module.get<StationService>(StationService)
        configService = module.get<ConfigService>(ConfigService)
    })

    afterEach(async () => {
        if (module) {
            await module.close();
        }
    })

    it('should fetch real stations from database', async () => {
        const stations = await service.getStationListForBatch(500)
        console.log('Fetched stations:', JSON.stringify(stations, null, 2))

        expect(stations).toBeDefined()
        expect(Array.isArray(stations)).toBe(true)

        // 데이터 체크
        if (stations.length > 0) {
            console.log('First station:', stations[0])
            expect(stations[0].stationId).toBeDefined()
        }
    })
})