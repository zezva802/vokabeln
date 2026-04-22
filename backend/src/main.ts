import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:4000' });
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 4001;
  await app.listen(port);
  console.log(`Vokabeln API running on http://localhost:${port}/api`);
}
bootstrap();
