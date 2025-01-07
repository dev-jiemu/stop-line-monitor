import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PublicController } from './modules/public/public.controller';
import { AppService } from './app.service';
import { StationService } from './modules/station/station.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Station, StationSchema } from './schemas/station.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Station.name, schema: StationSchema },
        ])],
    controllers: [AppController, PublicController],
    providers: [AppService, StationService],
})

export class AppModule {}