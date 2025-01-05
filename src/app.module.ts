import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PublicController } from './public/public.controller';
import { AppService } from './app.service';
import { PublicService } from './public/public.service';

@Module({
  imports: [],
  controllers: [AppController, PublicController],
  providers: [AppService, PublicService],
})
export class AppModule {}
