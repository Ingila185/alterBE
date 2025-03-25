import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { BIAS_EXCEPTIONS } from '../src/constants';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /grid', () => {
    it('should generate a grid without bias', () => {
      return request(app.getHttpServer())
        .get('/grid')
        .expect(200)
        .expect((res) => {
          expect(res.body.status.success).toBe(true);
          expect(res.body.status.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.gridContents).toBeDefined();
          expect(res.body.data.gridCode).toBeDefined();
          expect(res.body.data.metadata).toBeDefined();
          expect(res.body.data.metadata.dimensions).toBeDefined();
          expect(res.body.data.metadata.dimensions.rows).toBe(10);
          expect(res.body.data.metadata.dimensions.columns).toBe(10);
          expect(res.body.data.metadata.timestamp).toBeDefined();
          expect(res.body.data.metadata.version).toBe('1.0.0');
          expect(res.body.data.metadata.biasCharacter).toBeUndefined();
          expect(res.body.data.metadata.biasPercentage).toBeUndefined();
        });
    });

    it('should generate a grid with valid bias', () => {
      return request(app.getHttpServer())
        .get('/grid?bias=x')
        .expect(200)
        .expect((res) => {
          expect(res.body.status.success).toBe(true);
          expect(res.body.status.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.metadata.biasCharacter).toBe('x');
          expect(res.body.data.metadata.biasPercentage).toBe(20);

          // Check if bias character appears approximately 20% of the time
          const allLetters = res.body.data.gridContents.flat();
          const biasCount = allLetters.filter(
            (letter) => letter === 'x',
          ).length;
          const totalCells = 100; // 10x10 grid
          const expectedBiasCount = Math.floor(totalCells * 0.2);

          expect(biasCount).toBeGreaterThanOrEqual(expectedBiasCount - 5);
          expect(biasCount).toBeLessThanOrEqual(expectedBiasCount + 5);
        });
    });

    it('should return error for empty bias parameter', () => {
      return request(app.getHttpServer())
        .get('/grid?bias=')
        .expect(400)
        .expect((res) => {
          expect(res.body.status.success).toBe(false);
          expect(res.body.status.code).toBe(400);
          expect(res.body.status.error).toBe('BiasValidationException');
          expect(res.body.status.message).toBe(BIAS_EXCEPTIONS.EMPTY);
          expect(res.body.data).toBeNull();
        });
    });

    it('should return error for capital letter bias', () => {
      return request(app.getHttpServer())
        .get('/grid?bias=A')
        .expect(400)
        .expect((res) => {
          expect(res.body.status.success).toBe(false);
          expect(res.body.status.code).toBe(400);
          expect(res.body.status.error).toBe('BiasValidationException');
          expect(res.body.status.message).toBe(BIAS_EXCEPTIONS.CAPITAL_LETTER);
          expect(res.body.data).toBeNull();
        });
    });

    it('should return error for numeric bias', () => {
      return request(app.getHttpServer())
        .get('/grid?bias=5')
        .expect(400)
        .expect((res) => {
          expect(res.body.status.success).toBe(false);
          expect(res.body.status.code).toBe(400);
          expect(res.body.status.error).toBe('BiasValidationException');
          expect(res.body.status.message).toBe(BIAS_EXCEPTIONS.NUMBER);
          expect(res.body.data).toBeNull();
        });
    });

    it('should return error for special character bias', () => {
      return request(app.getHttpServer())
        .get('/grid?bias=@')
        .expect(400)
        .expect((res) => {
          expect(res.body.status.success).toBe(false);
          expect(res.body.status.code).toBe(400);
          expect(res.body.status.error).toBe('BiasValidationException');
          expect(res.body.status.message).toBe(
            BIAS_EXCEPTIONS.SPECIAL_CHARACTER,
          );
          expect(res.body.data).toBeNull();
        });
    });

    it('should return error for multi-character bias', () => {
      return request(app.getHttpServer())
        .get('/grid?bias=xy')
        .expect(400)
        .expect((res) => {
          expect(res.body.status.success).toBe(false);
          expect(res.body.status.code).toBe(400);
          expect(res.body.status.error).toBe('BiasValidationException');
          expect(res.body.status.message).toBe(BIAS_EXCEPTIONS.LENGTH);
          expect(res.body.data).toBeNull();
        });
    });

    it('should contain only lowercase letters in the grid', () => {
      return request(app.getHttpServer())
        .get('/grid')
        .expect(200)
        .expect((res) => {
          const allLetters = res.body.data.gridContents.flat().join('');
          expect(allLetters).toMatch(/^[a-z]+$/);
        });
    });
  });
});
