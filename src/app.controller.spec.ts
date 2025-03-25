import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GridGeneratorResponse } from './interfaces/api-response.interface';
import { BIAS_EXCEPTIONS } from './constants';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'grid.rows': 10,
        'grid.columns': 10,
        'grid.biasFactor': 0.2,
      };
      return config[key];
    }),
  };

  const mockAppService = {
    getGridGeneratorResponse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return grid generator response', async () => {
    const mockResponse = {
      status: {
        code: 200,
        message: 'Grid generated successfully',
        success: true,
      },
      data: {
        gridContents: Array(10).fill(Array(10).fill('a')),
        gridCode: 42,
        metadata: {
          dimensions: {
            rows: 10,
            columns: 10,
          },
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      },
    };

    mockAppService.getGridGeneratorResponse.mockReturnValue(mockResponse);

    const result = await controller.getGrid();
    expect(result).toEqual(mockResponse);
  });

  it('should return grid generator response with bias', async () => {
    const bias = 'x';
    const mockResponse = {
      status: {
        code: 200,
        message: 'Grid generated successfully',
        success: true,
      },
      data: {
        gridContents: Array(10).fill(Array(10).fill('a')),
        gridCode: 42,
        metadata: {
          dimensions: {
            rows: 10,
            columns: 10,
          },
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          biasCharacter: bias,
          biasPercentage: 20,
        },
      },
    };

    mockAppService.getGridGeneratorResponse.mockReturnValue(mockResponse);

    const result = await controller.getGrid(bias);
    expect(result.status.success).toBe(true);
    expect(result.status.code).toBe(200);
    expect(result.data).toBeDefined();

    if (result.data) {
      expect(Array.isArray(result.data.gridContents)).toBe(true);
      expect(typeof result.data.gridCode).toBe('number');
      expect(result.data.metadata).toBeDefined();
      expect(result.data.metadata.dimensions).toBeDefined();
      expect(result.data.metadata.dimensions.rows).toBe(10);
      expect(result.data.metadata.dimensions.columns).toBe(10);
      expect(result.data.metadata.biasCharacter).toBe(bias);
      expect(result.data.metadata.biasPercentage).toBe(20); // 0.2 * 100
      expect(result.data.metadata.timestamp).toBeDefined();
      expect(result.data.metadata.version).toBe('1.0.0');
    }
  });

  it('should return error response for bias that is a capital letter', async () => {
    mockAppService.getGridGeneratorResponse.mockImplementation(() => {
      throw new Error(BIAS_EXCEPTIONS.CAPITAL_LETTER);
    });

    await expect(controller.getGrid('A')).rejects.toThrow(HttpException);
    await expect(controller.getGrid('A')).rejects.toMatchObject({
      response: {
        status: {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
          success: false,
          error: 'InternalServerError',
        },
        data: null,
      },
    });
  });

  it('should return error response for numeric bias', async () => {
    mockAppService.getGridGeneratorResponse.mockImplementation(() => {
      throw new Error(BIAS_EXCEPTIONS.NUMBER);
    });

    await expect(controller.getGrid('5')).rejects.toThrow(HttpException);
    await expect(controller.getGrid('5')).rejects.toMatchObject({
      response: {
        status: {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
          success: false,
          error: 'InternalServerError',
        },
        data: null,
      },
    });
  });

  it('should return error response for special character bias', async () => {
    mockAppService.getGridGeneratorResponse.mockImplementation(() => {
      throw new Error(BIAS_EXCEPTIONS.SPECIAL_CHARACTER);
    });

    await expect(controller.getGrid('@')).rejects.toThrow(HttpException);
    await expect(controller.getGrid('@')).rejects.toMatchObject({
      response: {
        status: {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
          success: false,
          error: 'InternalServerError',
        },
        data: null,
      },
    });
  });
});
