import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { batchJobs } from './jobs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  await app.listen(configService.get('http.port') ?? 3000)
  // batchJobs()
}
bootstrap().then();