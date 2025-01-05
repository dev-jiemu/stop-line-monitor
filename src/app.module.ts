import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PublicController } from './public/public.controller';
import { AppService } from './app.service';
import { PublicService } from './public/public.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Station, StationSchema } from './schemas/station.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Station.name, schema: StationSchema },
        ])],
    controllers: [AppController, PublicController],
    providers: [AppService, PublicService],
})

export class AppModule {}