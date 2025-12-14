import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global prefix
  app.setGlobalPrefix('v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.WEBSOCKET_CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║   🗳️  PLATAFORMA ELECTORAL COLOMBIA       ║
    ║   Backend Día D (Real-Time)               ║
    ║                                           ║
    ║   🚀 Server running on: ${port}              ║
    ║   📊 Environment: ${process.env.NODE_ENV}        ║
    ║   🔌 WebSocket: Enabled                   ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
  `);
}

bootstrap();
