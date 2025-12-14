import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestigosController } from './testigos.controller';
import { TestigosService } from './testigos.service';
import { TestigosGateway } from './testigos.gateway';
import { Testigo } from './entities/testigo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Testigo])],
  controllers: [TestigosController],
  providers: [TestigosService, TestigosGateway],
  exports: [TestigosService],
})
export class TestigosModule {}
