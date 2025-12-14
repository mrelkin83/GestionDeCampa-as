import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return app information', () => {
      const result = appController.getRoot();
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('status');
    });
  });

  describe('health', () => {
    it('should return health check', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });
  });
});
