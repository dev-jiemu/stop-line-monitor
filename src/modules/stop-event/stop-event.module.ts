import { Module } from '@nestjs/common';
import { StopEventController } from './stop-event.controller';
import { StopEventService } from './stop-event.service';

@Module({
  controllers: [StopEventController],
  providers: [StopEventService]
})
export class StopEventModule {}
