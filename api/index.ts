import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import serverless from 'serverless-http';
import { AppModule } from '../apps/api/src/app.module';

let app: any;

async function bootstrap() {
  app = await NestFactory.create(AppModule, { snapshot: true });
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL') ?? true,
    credentials: true,
  });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
}

export default serverless(async (req, res) => {
  if (!app) await bootstrap();
  return app.getHttpAdapter().getInstance()(req, res);
});
