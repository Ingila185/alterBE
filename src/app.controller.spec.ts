import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IGridGeneratorResponse } from './common/interfaces/GridGeneratorResponse';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('RandomAlphabetGenerator', () => {
    it('should return IGridGeneratorResponse', () => {
      const result = appController.RandomAlphabetGenerator();
      expect(result).toHaveProperty('gridContents');
      expect(result).toHaveProperty('gridCode');
      expect(Array.isArray(result.gridContents)).toBe(true);
      expect(typeof result.gridCode).toBe('number');
    });
  });
});
