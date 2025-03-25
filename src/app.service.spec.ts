import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { getGridSize, ALPHABET } from './constants';
import { BIAS_EXCEPTIONS } from './constants';
import { BiasValidationException } from './common/exceptions/bias-validation.exception';

describe('AppService', () => {
  let service: AppService;
  let configService: ConfigService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('getGridGeneratorResponse', () => {
    it('should generate a grid with correct dimensions', () => {
      const result = service.getGridGeneratorResponse();
      expect(result.status.success).toBe(true);
      expect(result.status.code).toBe(200);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.gridContents.length).toBe(
          getGridSize(configService).MAX_ROWS,
        );
        expect(result.data.gridContents[0].length).toBe(
          getGridSize(configService).MAX_COLUMNS,
        );
      }
    });

    it('should contain only lowercase letters', () => {
      const result = service.getGridGeneratorResponse();
      expect(result.status.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        const allLetters = result.data.gridContents.flat().join('');
        expect(allLetters).toMatch(/^[a-z]+$/);
      }
    });

    it('should include bias character approximately 20% of the time when provided', () => {
      const bias = 'x';
      const result = service.getGridGeneratorResponse(bias);
      expect(result.status.success).toBe(true);
      expect(result.status.code).toBe(200);
      expect(result.data).toBeDefined();

      if (result.data) {
        const allLetters = result.data.gridContents.flat();
        const biasCount = allLetters.filter((letter) => letter === bias).length;
        const totalCells = 100; // 10x10 grid
        const expectedBiasCount = Math.floor(totalCells * 0.2);

        // Allow for some randomness, but should be close to 20%
        expect(biasCount).toBeGreaterThanOrEqual(expectedBiasCount - 5);
        expect(result.data.metadata.biasPercentage).toBe(20); // 0.2 * 100
      }
    });

    it('should return complete response structure', () => {
      const result = service.getGridGeneratorResponse();
      expect(result.status.success).toBe(true);
      expect(result.status.code).toBe(200);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.gridContents).toBeDefined();
        expect(result.data.gridCode).toBeDefined();
        expect(result.data.metadata).toBeDefined();
        expect(result.data.metadata.dimensions).toBeDefined();
        expect(result.data.metadata.dimensions.rows).toBe(10);
        expect(result.data.metadata.dimensions.columns).toBe(10);
        expect(result.data.metadata.timestamp).toBeDefined();
        expect(result.data.metadata.version).toBe('1.0.0');
        expect(result.data.metadata.biasCharacter).toBeUndefined();
        expect(result.data.metadata.biasPercentage).toBeUndefined();
      }
    });

    describe('bias validation', () => {
      it('should throw error when bias is empty string', () => {
        expect(() => service.getGridGeneratorResponse('')).toThrow(
          BiasValidationException,
        );
        expect(() => service.getGridGeneratorResponse('')).toThrow(
          BIAS_EXCEPTIONS.EMPTY,
        );
      });

      it('should throw error when bias is a capital letter', () => {
        expect(() => service.getGridGeneratorResponse('A')).toThrow(
          BiasValidationException,
        );
        expect(() => service.getGridGeneratorResponse('A')).toThrow(
          BIAS_EXCEPTIONS.CAPITAL_LETTER,
        );
      });

      it('should throw error when bias is a number', () => {
        expect(() => service.getGridGeneratorResponse('5')).toThrow(
          BiasValidationException,
        );
        expect(() => service.getGridGeneratorResponse('5')).toThrow(
          BIAS_EXCEPTIONS.NUMBER,
        );
      });

      it('should throw error when bias is a special character', () => {
        expect(() => service.getGridGeneratorResponse('@')).toThrow(
          BiasValidationException,
        );
        expect(() => service.getGridGeneratorResponse('@')).toThrow(
          BIAS_EXCEPTIONS.SPECIAL_CHARACTER,
        );
      });

      it('should throw error when bias is multi-character', () => {
        expect(() => service.getGridGeneratorResponse('xy')).toThrow(
          BiasValidationException,
        );
        expect(() => service.getGridGeneratorResponse('xy')).toThrow(
          BIAS_EXCEPTIONS.LENGTH,
        );
      });

      it('should accept valid lowercase letter bias', () => {
        const result = service.getGridGeneratorResponse('x');
        expect(result.status.success).toBe(true);
        expect(result.status.code).toBe(200);
        expect(result.data).toBeDefined();

        if (result.data) {
          expect(result.data.metadata.biasCharacter).toBe('x');
          expect(result.data.metadata.biasPercentage).toBe(20);
        }
      });

      it('should accept undefined bias', () => {
        const result = service.getGridGeneratorResponse(undefined);
        expect(result.status.success).toBe(true);
        expect(result.status.code).toBe(200);
        expect(result.data).toBeDefined();

        if (result.data) {
          expect(result.data.metadata.biasCharacter).toBeUndefined();
          expect(result.data.metadata.biasPercentage).toBeUndefined();
        }
      });
    });
  });

  describe('codeGenerator', () => {
    it('should handle single digit seconds correctly', () => {
      // Mock Date to return 5 seconds
      const mockDate = new Date();
      jest.spyOn(mockDate, 'getSeconds').mockReturnValue(5);
      const mockDateConstructor = jest.fn(
        () => mockDate,
      ) as unknown as typeof Date;
      mockDateConstructor.parse = Date.parse;
      mockDateConstructor.UTC = Date.UTC;
      mockDateConstructor.now = Date.now;
      global.Date = mockDateConstructor;

      const matrix = Array(10)
        .fill(null)
        .map(() => Array(10).fill('a'));
      matrix[0][5] = 'b'; // First character
      matrix[5][0] = 'c'; // Second character

      const result = service.codeGenerator(matrix);
      expect(typeof result).toBe('number');
      expect(result.toString().length).toBe(2);
    });

    it('should handle double digit seconds correctly', () => {
      // Mock Date to return 36 seconds
      const mockDate = new Date();
      jest.spyOn(mockDate, 'getSeconds').mockReturnValue(36);
      const mockDateConstructor = jest.fn(
        () => mockDate,
      ) as unknown as typeof Date;
      mockDateConstructor.parse = Date.parse;
      mockDateConstructor.UTC = Date.UTC;
      mockDateConstructor.now = Date.now;
      global.Date = mockDateConstructor;

      const matrix = Array(10)
        .fill(null)
        .map(() => Array(10).fill('a'));
      matrix[3][6] = 'b'; // First character (36 -> 3,6)
      matrix[6][3] = 'c'; // Second character (36 -> 6,3)

      const result = service.codeGenerator(matrix);
      expect(typeof result).toBe('number');
      expect(result.toString().length).toBe(2);
    });

    it('should handle character counts greater than 9', () => {
      const mockDate = new Date();
      jest.spyOn(mockDate, 'getSeconds').mockReturnValue(5);
      const mockDateConstructor = jest.fn(
        () => mockDate,
      ) as unknown as typeof Date;
      mockDateConstructor.parse = Date.parse;
      mockDateConstructor.UTC = Date.UTC;
      mockDateConstructor.now = Date.now;
      global.Date = mockDateConstructor;

      const matrix = Array(10)
        .fill(null)
        .map(() => Array(10).fill(ALPHABET.ALLOWED_CHARACTERS[0]));

      // Fill matrix with 14 'b's and 11 'c's
      let initialBCount = 0;
      let initialCCount = 0;
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (initialBCount < 14) {
            matrix[i][j] = 'b';
            initialBCount++;
          } else if (initialCCount < 11) {
            matrix[i][j] = 'c';
            initialCCount++;
          }
        }
      }

      // Verify we have >= 14 'b's and 11 'c's
      const allLetters = matrix.flat();
      const finalBCount = allLetters.filter((char) => char === 'b').length;
      const finalCCount = allLetters.filter((char) => char === 'c').length;
      expect(finalBCount).toBeGreaterThanOrEqual(14);
      expect(finalCCount).toBeGreaterThanOrEqual(11);

      const result = service.codeGenerator(matrix);
      expect(result).toBeGreaterThanOrEqual(41); // 14 % 10 = 4, 11 % 10 = 1
    });
  });
});
