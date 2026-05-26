import { NestFactory } from '@nestjs/core';
import serverless from 'serverless-http';
import { AppModule } from '../apps/api/src/app.module';

let app: any;

async function bootstrap() {
  app = await NestFactory.create(AppModule, { snapshot: true });
  await app.init();
}

export default serverless(async (req, res) => {
  if (!app) await bootstrap();
  return app.getHttpAdapter().getInstance()(req, res);
});
