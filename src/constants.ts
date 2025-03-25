import { ConfigService } from '@nestjs/config';

export const getGridSize = (configService: ConfigService) => ({
  MAX_ROWS: configService.get('grid.rows'),
  MAX_COLUMNS: configService.get('grid.columns'),
});

export const getBiasFactor = (configService: ConfigService) => ({
  FACTOR: configService.get('grid.biasFactor'),
});

export enum ALPHABET {
  ALLOWED_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz',
}

export enum BIAS_EXCEPTIONS {
  CAPITAL_LETTER = 'Bias cannot be a capital letter',
  NUMBER = 'Bias cannot be a number',
  SPECIAL_CHARACTER = 'Bias cannot be a special character',
  LENGTH = 'Bias cannot be more than one character',
  EMPTY = 'Bias parameter cannot be empty',
}
