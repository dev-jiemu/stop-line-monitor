import { StationService } from '../src/modules/station/station.service';
import { StationRepository } from '../src/modules/station/station.repository'; // 이 경로는 실제 경로에 맞게 수정하세요
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

describe('StationService', () => {
    let service: StationService

    const mockStations = [
        { stationId: '1', updatedDt: new Date('2023-01-01') },
        { stationId: '2', updatedDt: new Date('2023-01-02') }
    ]


    const mockStationModel = {
        find: jest.fn().mockReturnThis(),
        findOne: jest.fn().mockReturnThis(),
        findOneAndUpdate: jest.fn().mockReturnThis(),
        save: jest.fn(),
        exec: jest.fn(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
    }

    // 모킹할 StationRepository 정의
    const mockStationRepository = {
        getStationListForBatch: jest.fn().mockResolvedValue(mockStations)
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StationService,
                {
                    provide: StationRepository,
                    useValue: mockStationRepository,
                },
                {
                    provide: getModelToken('Station'),
                    useValue: {},
                },
            ],
        }).compile()

        service = module.get<StationService>(StationService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined();
    })

    it('should return stations sorted by updatedDt', async () => {
        mockStationModel.exec.mockResolvedValue(mockStations)

        const result = await service.getStationListForBatch(500)

        console.log('Test result:', result)
        expect(result).toBeDefined()
        expect(result).toEqual(mockStations)
    })
})