import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthCheck(): object {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      database: 'connected', // TODO: Implement actual DB health check
      redis: 'connected', // TODO: Implement actual Redis health check
    };
  }
}
