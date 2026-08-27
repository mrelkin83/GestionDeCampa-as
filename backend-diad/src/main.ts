import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis-io.adapter';
import { getAllowedOrigins } from './config/cors';

async function bootstrap() {
  // cors se configura explícitamente más abajo con enableCors(); `cors: true`
  // aquí era redundante y confuso (Express aplica la última configuración).
  const app = await NestFactory.create(AppModule, {
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
    origin: getAllowedOrigins(),
    credentials: true,
  });

  // Configurar Redis Adapter para WebSockets (escalabilidad horizontal)
  const redisAdapter = new RedisIoAdapter(app.get(ConfigService), app);
  await redisAdapter.connectToRedis();
  app.useWebSocketAdapter(redisAdapter);

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
