import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModule } from './modules/apis/api.module';
import { StationModule } from './modules/station/station.module';
import { PublicModule } from './modules/public/public.module';
import { BatchModule } from './jobs/batch.module';
import { DevModule } from './modules/dev/dev.module';

@Module({
    imports: [
        ConfigModule.forRoot({load: [config], isGlobal: true}),
        MongooseModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('mongo.url'),
            }),
            inject: [ConfigService],
        }),
        ApiModule,
        StationModule,
        PublicModule,
        BatchModule,
        DevModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}