import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConteoController } from './conteo.controller';
import { ConteoService } from './conteo.service';
import { ConteoGateway } from './conteo.gateway';
import { ConteoResultado } from './entities/conteo-resultado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConteoResultado])],
  controllers: [ConteoController],
  providers: [ConteoService, ConteoGateway],
  exports: [ConteoService],
})
export class ConteoModule {}
