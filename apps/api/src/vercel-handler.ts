import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverless from 'serverless-http';

let app: any;

async function bootstrap() {
  app = await NestFactory.create(AppModule, { snapshot: true });
  await app.init();
}

export const handler = serverless(async (req: any, res: any) => {
  if (!app) await bootstrap();
  return app.getHttpAdapter().getInstance()(req, res);
});