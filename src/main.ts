import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { createWinstonLogger } from './config/logger.config'

async function bootstrap() {
  // Winston 로거를 사용하여 애플리케이션 생성
  const app = await NestFactory.create(AppModule, {
    logger: createWinstonLogger(),
  })
  
  const configService = app.get(ConfigService)
  const port = configService.get('http.port') ?? 3000
  
  await app.listen(port)
  
  console.log(`🚀 Application is running on: http://localhost:${port}`)
  console.log(`📂 Log files are stored in: logs/`)
}

bootstrap().catch(error => {
  console.error('Failed to start application:', error)
  process.exit(1)
})