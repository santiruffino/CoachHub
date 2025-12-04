import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FileLogger } from './common/logger/file.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new FileLogger(),
  });
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
