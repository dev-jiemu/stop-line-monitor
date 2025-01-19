import { Module } from '@nestjs/common';
import { StationService } from './station.service';
import { StationRepository } from './station.repository';
import { StationController } from './station.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Station, StationSchema } from '../../schemas/station.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Station.name, schema: StationSchema },
        ]),
    ],
    controllers: [StationController],
    providers: [StationService, StationRepository],
    exports: [StationService, StationRepository]
})

export class StationModule {}
