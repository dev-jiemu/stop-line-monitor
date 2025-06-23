import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModule } from './modules/apis/api.module';
import { StationModule } from './modules/station/station.module';
import { PublicModule } from './modules/public/public.module';
import { BullModule } from '@nestjs/bull';
import { BatchModule } from './jobs/batch.module';
import { BusTrackingModule } from './modules/bus-tracking/bus-tracking.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [config], isGlobal: true }),
        MongooseModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('mongo.url'),
                maxPoolSize: 20,
                minPoolSize: 10,
                maxIdleTimeMS: 30000,
            }),
            inject: [ConfigService],
        }),
        BullModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                redis: {
                    host: configService.get<string>('redis.host', 'localhost'),
                    port: configService.get<number>('redis.port', 6379),
                    maxRetriesPerRequest: 3,
                    retryDelayOnFailover: 100,
                    enableReadyCheck: false
                },
            }),
            inject: [ConfigService],
        }),
        ApiModule,
        StationModule,
        PublicModule,
        BatchModule,
        BusTrackingModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}