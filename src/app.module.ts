import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModule } from './modules/apis/api.module';
import { StationModule } from './modules/station/station.module';
import { PublicModule } from './modules/public/public.module';

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
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}