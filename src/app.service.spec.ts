import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { IGridGeneratorResponse } from './common/interfaces/GridGeneratorResponse';
import { GRIDSIZE } from './constants';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getGridGeneratorResponse', () => {
    it('should generate a grid with correct dimensions', () => {
      const result = service.getGridGeneratorResponse();
      expect(result.gridContents.length).toBe(GRIDSIZE.MAX_ROWS);
      expect(result.gridContents[0].length).toBe(GRIDSIZE.MAX_COLUMNS);
    });

    it('should generate a grid with only lowercase letters', () => {
      const result = service.getGridGeneratorResponse();
      const allLetters = result.gridContents.flat().join('');
      expect(allLetters).toMatch(/^[a-z]+$/);
    });

    it('should include bias character in approximately 20% of positions when bias is provided', () => {
      const bias = 'x';
      const result = service.getGridGeneratorResponse(bias);
      const totalCells = GRIDSIZE.MAX_ROWS * GRIDSIZE.MAX_COLUMNS;
      const expectedBiasCount = Math.floor(totalCells * 0.2);

      const actualBiasCount = result.gridContents
        .flat()
        .filter((char) => char === bias).length;

      // Allow for some variance due to randomness
      expect(actualBiasCount).toBeGreaterThanOrEqual(expectedBiasCount - 2);
    });

    it('should return both gridContents and gridCode', () => {
      const result = service.getGridGeneratorResponse();
      expect(result).toHaveProperty('gridContents');
      expect(result).toHaveProperty('gridCode');
      expect(typeof result.gridCode).toBe('number');
    });
  });

  describe('codeGenerator', () => {
    it('should handle single digit seconds correctly', () => {
      // Mock Date to return 5 seconds
      jest.spyOn(Date.prototype, 'getSeconds').mockReturnValue(5);

      const testMatrix = Array(GRIDSIZE.MAX_ROWS)
        .fill(null)
        .map(() => Array(GRIDSIZE.MAX_COLUMNS).fill('a'));

      // Set specific characters at positions [0][5] and [5][0]
      testMatrix[0][5] = 'x';
      testMatrix[5][0] = 'y';

      const result = service.codeGenerator(testMatrix);
      expect(typeof result).toBe('number');
      expect(result.toString().length).toBe(2);
    });

    it('should handle double digit seconds correctly', () => {
      // Mock Date to return 36 seconds
      jest.spyOn(Date.prototype, 'getSeconds').mockReturnValue(36);

      const testMatrix = Array(GRIDSIZE.MAX_ROWS)
        .fill(null)
        .map(() => Array(GRIDSIZE.MAX_COLUMNS).fill('a'));

      // Set specific characters at positions [3][6] and [6][3]
      testMatrix[3][6] = 'x';
      testMatrix[6][3] = 'y';

      const result = service.codeGenerator(testMatrix);
      expect(typeof result).toBe('number');
      expect(result.toString().length).toBe(2);
    });
  });
});
