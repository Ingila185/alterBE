import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getGridSize,
  getBiasFactor,
  ALPHABET,
  BIAS_EXCEPTIONS,
} from './constants';
import { BiasValidationException } from './common/exceptions/bias-validation.exception';
import { GridGeneratorResponse } from './interfaces/api-response.interface';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  private validateBias(bias: string | undefined): void {
    if (bias === undefined) return;

    if (bias === '') {
      throw new BiasValidationException(BIAS_EXCEPTIONS.EMPTY);
    }

    if (/[A-Z]/.test(bias)) {
      throw new BiasValidationException(BIAS_EXCEPTIONS.CAPITAL_LETTER);
    }
    if (/[0-9]/.test(bias)) {
      throw new BiasValidationException(BIAS_EXCEPTIONS.NUMBER);
    }
    if (/[^a-z]/.test(bias)) {
      throw new BiasValidationException(BIAS_EXCEPTIONS.SPECIAL_CHARACTER);
    }

    if (bias.length > 1) {
      throw new BiasValidationException(BIAS_EXCEPTIONS.LENGTH);
    }
  }

  getGridGeneratorResponse(bias?: string): GridGeneratorResponse {
    this.validateBias(bias);
    const gridSize = getGridSize(this.configService);
    const biasFactor = getBiasFactor(this.configService);
    const matrix = Array(gridSize.MAX_ROWS)
      .fill(null)
      .map(() => Array(gridSize.MAX_COLUMNS).fill(''));

    // Fill matrix with random letters
    for (let i = 0; i < gridSize.MAX_ROWS; i++) {
      for (let j = 0; j < gridSize.MAX_COLUMNS; j++) {
        const randomIndex = Math.floor(
          Math.random() * ALPHABET.ALLOWED_CHARACTERS.length,
        );
        matrix[i][j] = ALPHABET.ALLOWED_CHARACTERS[randomIndex];
      }
    }

    // Apply bias if provided
    if (bias) {
      const biasCount = Math.floor(
        gridSize.MAX_ROWS * gridSize.MAX_COLUMNS * biasFactor.FACTOR,
      );
      for (let i = 0; i < biasCount; i++) {
        const randomRow = Math.floor(Math.random() * gridSize.MAX_ROWS);
        const randomCol = Math.floor(Math.random() * gridSize.MAX_COLUMNS);
        matrix[randomRow][randomCol] = bias;
      }
    }

    const gridCode = this.codeGenerator(matrix);

    return {
      status: {
        code: 200,
        message: 'Grid generated successfully',
        success: true,
      },
      data: {
        gridContents: matrix,
        gridCode,
        metadata: {
          dimensions: {
            rows: gridSize.MAX_ROWS,
            columns: gridSize.MAX_COLUMNS,
          },
          biasCharacter: bias,
          biasPercentage: bias ? biasFactor.FACTOR * 100 : undefined,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      },
    };
  }

  codeGenerator(inputMatrix: string[][]): number {
    const currentSeconds = new Date().getSeconds();
    const firstCharPosition = Math.floor(currentSeconds / 10);
    const secondCharPosition = currentSeconds % 10;

    const firstChar = inputMatrix[firstCharPosition][secondCharPosition];
    const secondChar = inputMatrix[secondCharPosition][firstCharPosition];

    const firstCharCount = inputMatrix
      .flat()
      .filter((char) => char === firstChar).length;
    const secondCharCount = inputMatrix
      .flat()
      .filter((char) => char === secondChar).length;

    return (firstCharCount % 10) * 10 + (secondCharCount % 10);
  }
}
