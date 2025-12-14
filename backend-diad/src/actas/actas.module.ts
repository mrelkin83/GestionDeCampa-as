import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ActasController } from './actas.controller';
import { ActasService } from './actas.service';
import { ActasGateway } from './actas.gateway';
import { Acta } from './entities/acta.entity';
import { ActaProcessor } from './processors/acta.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Acta]),
    BullModule.registerQueue({
      name: 'actas',
    }),
  ],
  controllers: [ActasController],
  providers: [ActasService, ActasGateway, ActaProcessor],
  exports: [ActasService],
})
export class ActasModule {}
