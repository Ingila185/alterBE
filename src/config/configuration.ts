interface GridConfig {
  rows: number;
  columns: number;
  biasFactor: number;
}

interface CorsConfig {
  origin: string;
  methods: string[];
  credentials: boolean;
}

interface AppConfig {
  port: number;
  cors: CorsConfig;
  grid: GridConfig;
}

export default (): AppConfig => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    methods: ['GET'],
    credentials: true,
  },
  grid: {
    rows: process.env.GRID_ROWS ? parseInt(process.env.GRID_ROWS, 10) : 10,
    columns: process.env.GRID_COLUMNS
      ? parseInt(process.env.GRID_COLUMNS, 10)
      : 10,
    biasFactor: process.env.BIAS_FACTOR
      ? parseFloat(process.env.BIAS_FACTOR)
      : 0.2,
  },
});
