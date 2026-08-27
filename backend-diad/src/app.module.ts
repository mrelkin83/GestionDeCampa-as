import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { HttpJwtGuard } from './auth/http-jwt.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActasModule } from './actas/actas.module';
import { TestigosModule } from './testigos/testigos.module';
import { ConteoModule } from './conteo/conteo.module';
import { AlertasModule } from './alertas/alertas.module';
import { PreconteoModule } from './preconteo/preconteo.module';
import { Acta } from './actas/entities/acta.entity';
import { Testigo } from './testigos/entities/testigo.entity';
import { ConteoResultado } from './conteo/entities/conteo-resultado.entity';
import { Alerta } from './alertas/entities/alerta.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: parseInt(configService.get('RATE_LIMIT_TTL', '60'), 10) * 1000,
          limit: parseInt(configService.get('RATE_LIMIT_MAX', '100'), 10),
        },
      ],
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT'), 10),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        schema: configService.get('DB_SCHEMA', 'diad'),
        // El build usa webpack (nest build empaqueta todo en un único
        // dist/main.js): un glob de directorio (__dirname + '/**/*.entity')
        // no encuentra nada ahí dentro, porque no hay una estructura de
        // carpetas real que recorrer. Confirmado en vivo: toda petición que
        // tocaba la BD fallaba con "EntityMetadataNotFoundError: No metadata
        // for 'Acta' was found" -es decir, el 100% del API REST estaba
        // roto en tiempo de ejecución pese a compilar y testear en verde.
        entities: [Acta, Testigo, ConteoResultado, Alerta],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        logging: configService.get('DB_LOGGING') === 'true',
      }),
      inject: [ConfigService],
    }),

    // `bull` (y `multer`, usado solo en ActasController) traen vulnerabilidades
    // npm conocidas (DoS, ver `npm audit`) sin fix no-breaking disponible -el
    // fix real es migrar a BullMQ, que cambia la forma de BullRootModuleOptions
    // y requiere su propio ciclo de prueba. Se deja sin migrar a propósito: hoy
    // ambos solo se ejercitan desde el módulo `actas` (cola 'actas' + subida de
    // imagen en ActasController), que no tiene ningún consumidor real todavía
    // (ver nota en auth/campaign-access.ts) -no hay tráfico expuesto a estas
    // dependencias en producción. Migrar antes de conectar un consumidor real.
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: parseInt(configService.get('REDIS_PORT'), 10),
          password: configService.get('REDIS_PASSWORD') || undefined,
        },
      }),
      inject: [ConfigService],
    }),

    ActasModule,
    TestigosModule,
    ConteoModule,
    AlertasModule,
    PreconteoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: HttpJwtGuard,
    },
  ],
})
export class AppModule {}
