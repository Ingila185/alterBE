import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('Configuration', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              grid: {
                MAX_ROWS: 10,
                MAX_COLUMNS: 10,
                BIAS_FACTOR: 0.2,
              },
              cors: {
                origin: '*',
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                credentials: true,
              },
              port: 3000,
            }),
          ],
        }),
        AppModule,
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(configService).toBeDefined();
  });

  it('should have grid size configuration', () => {
    const maxRows = configService.get<number>('grid.MAX_ROWS');
    const maxColumns = configService.get<number>('grid.MAX_COLUMNS');

    expect(maxRows).toBeDefined();
    expect(maxColumns).toBeDefined();
    expect(maxRows).toBe(10);
    expect(maxColumns).toBe(10);
  });

  it('should have bias factor configuration', () => {
    const biasFactor = configService.get<number>('grid.BIAS_FACTOR');

    expect(biasFactor).toBeDefined();
    expect(biasFactor).toBe(0.2);
  });

  it('should have CORS configuration', () => {
    const corsConfig = configService.get('cors');

    expect(corsConfig).toBeDefined();
    expect(corsConfig.origin).toBe('*');
    expect(corsConfig.methods).toBe('GET,HEAD,PUT,PATCH,POST,DELETE');
    expect(corsConfig.credentials).toBe(true);
  });

  it('should have port configuration', () => {
    const port = configService.get<number>('port');

    expect(port).toBeDefined();
    expect(typeof port).toBe('number');
    expect(port).toBe(3000);
  });
});
