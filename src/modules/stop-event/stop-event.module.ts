import { Module } from '@nestjs/common';
import { StopEventController } from './stop-event.controller';
import { StopEventService } from './stop-event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StopEvent, StopEventSchema } from './schemas/stop-event.schema';
import { StopEventRepository } from './stop-event.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: StopEvent.name, schema: StopEventSchema },
        ]),
    ],
    controllers: [StopEventController],
    providers: [StopEventService, StopEventRepository],
    exports: [
        StopEventService,
    ],
})

export class StopEventModule {}
