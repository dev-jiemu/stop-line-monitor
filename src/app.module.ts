import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PublicController } from './modules/public/public.controller';
import { AppService } from './app.service';
import { StationService } from './modules/station/station.service';
import { BusStopInfo } from './apis/busStopInfo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Station, StationSchema } from './schemas/station.schema';

@Module({
    imports: [
        ConfigModule.forRoot({load: [config], isGlobal: true}),
        MongooseModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('mongo.url'),
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: Station.name, schema: StationSchema },
        ])
    ],
    controllers: [AppController, PublicController],
    providers: [AppService, StationService, BusStopInfo],
})

export class AppModule {}