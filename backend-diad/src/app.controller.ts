import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): object {
    return {
      message: 'Backend Día D - Plataforma Electoral Colombia',
      version: '0.1.0',
      status: 'running',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('health')
  getHealth(): object {
    return this.appService.getHealthCheck();
  }
}
