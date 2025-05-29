import { Module } from '@nestjs/common';
import { BusController } from './bus.controller';
import { BusService } from './bus.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Bus, BusSchema } from './schemas/bus.schema';
import { BusRepository } from './bus.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Bus.name, schema: BusSchema },
        ]),
    ],
    controllers: [BusController],
    providers: [BusService, BusRepository],
    exports: [
            BusService,
    ],
})
export class BusModule {}
