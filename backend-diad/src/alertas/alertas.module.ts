import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';
import { AlertasGateway } from './alertas.gateway';
import { Alerta } from './entities/alerta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alerta])],
  controllers: [AlertasController],
  providers: [AlertasService, AlertasGateway],
  exports: [AlertasService],
})
export class AlertasModule {}
