import { StationService } from '../src/modules/station/station.service';
import { Test, TestingModule } from '@nestjs/testing';
import { StationRepository } from '../src/modules/station/station.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Station, StationSchema } from '../src/modules/station/schemas/station.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import testConfig from './test.config';

describe('StationService Test With MongooseModule', () => {
    let service: StationService
    const config = testConfig()

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [testConfig],
                    isGlobal: true
                }),
                MongooseModule.forRootAsync({
                    useFactory: async () => ({
                        uri: config.mongodb.uri,
                    }),
                    inject: [ConfigService],
                }),
                MongooseModule.forFeature([
                    { name: Station.name, schema: StationSchema },
                ]),
            ],
            providers: [
                StationService,
                StationRepository
            ],
        }).compile()

        service = module.get<StationService>(StationService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    it('should fetch stations from MongoDB', async () => {
        try {
            const stations = await service.getStationListForBatch(5)
            console.log('results : ', stations)

            expect(stations).toBeDefined()
            expect(Array.isArray(stations)).toBe(true)

            if (stations.length > 0) {
                expect(stations[0].stationId).toBeDefined();
            }

        } catch (error) {
            console.error('error : ', error)
        }
    })

})