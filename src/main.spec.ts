import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

describe('Main (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configService = moduleFixture.get<ConfigService>(ConfigService);

    // Enable CORS using config, just like in main.ts
    app.enableCors(configService.get('cors'));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should have port configuration', () => {
    const port = configService.get('port');
    expect(port).toBeDefined();
    expect(typeof port).toBe('number');
    expect(port).toBe(3000); // Default port from .env
  });

  it('/grid (GET) should return 200', () => {
    return request(app.getHttpServer())
      .get('/grid')
      .expect(200)
      .expect((res) => {
        expect(res.body.status.success).toBe(true);
        expect(res.body.data).toBeDefined();
      });
  });

  it('/grid?bias=x (GET) should return 200', () => {
    return request(app.getHttpServer())
      .get('/grid?bias=x')
      .expect(200)
      .expect((res) => {
        expect(res.body.status.success).toBe(true);
        expect(res.body.data.metadata.biasCharacter).toBe('x');
      });
  });

  it('/grid?bias=@ (GET) should return 400', () => {
    return request(app.getHttpServer())
      .get('/grid?bias=@')
      .expect(400)
      .expect((res) => {
        expect(res.body.status.success).toBe(false);
        expect(res.body.data).toBeNull();
      });
  });
});
