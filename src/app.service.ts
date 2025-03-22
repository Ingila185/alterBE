import { Injectable } from '@nestjs/common';
import { IGridGeneratorResponse } from './common/interfaces/GridGeneratorResponse';
import { ALPHABET, BAIS_FACTOR, GRIDSIZE } from './constants';

@Injectable()
export class AppService {
  getGridGeneratorResponse(bias?: string): IGridGeneratorResponse {
    const alphabet = ALPHABET.ALLOWED_CHARACTERS;
    const matrix: string[][] = [];
    const totalCells = GRIDSIZE.MAX_ROWS * GRIDSIZE.MAX_COLUMNS;
    const biasCount = Math.floor(totalCells * BAIS_FACTOR.FACTOR); // 20% of total cells

    // Create array of all possible positions
    const positions = Array.from({ length: totalCells }, (_, i) => i);

    // Randomly select positions for bias character
    const biasPositions = new Set<number>();
    if (bias) {
      for (let i = 0; i < biasCount; i++) {
        const randomIndex = Math.floor(Math.random() * positions.length);
        biasPositions.add(positions[randomIndex]);
        positions.splice(randomIndex, 1);
      }
    }

    // Fill the matrix
    for (let i = 0; i < GRIDSIZE.MAX_ROWS; i++) {
      const row: string[] = [];
      for (let j = 0; j < GRIDSIZE.MAX_COLUMNS; j++) {
        const position = i * GRIDSIZE.MAX_COLUMNS + j;
        if (bias && biasPositions.has(position)) {
          row.push(bias);
        } else {
          const randomIndex = Math.floor(Math.random() * alphabet.length);
          row.push(alphabet[randomIndex]);
        }
      }
      matrix.push(row);
    }

    const response: IGridGeneratorResponse = {
      gridContents: matrix,
      gridCode: this.codeGenerator(matrix),
    };

    return response;
  }

  codeGenerator(inputMatrix: string[][]): any {
    const now = new Date();
    const seconds = now.getSeconds();
    let firstChar: string;
    let secondChar: string;

    if (seconds > 9) {
      // For double digit seconds (e.g., 36)
      firstChar = inputMatrix[Math.floor(seconds / 10)][seconds % 10];
      secondChar = inputMatrix[seconds % 10][Math.floor(seconds / 10)];
    } else {
      // For single digit seconds (e.g., 5)
      firstChar = inputMatrix[0][seconds];
      secondChar = inputMatrix[seconds][0];
    }

    // Count occurrences of both characters
    let firstCharCount = 0;
    let secondCharCount = 0;

    for (let i = 0; i < GRIDSIZE.MAX_ROWS; i++) {
      for (let j = 0; j < GRIDSIZE.MAX_COLUMNS; j++) {
        if (inputMatrix[i][j] === firstChar) {
          firstCharCount++;
        }
        if (inputMatrix[i][j] === secondChar) {
          secondCharCount++;
        }
      }
    }

    // Handle counts > 9 with modulus
    firstCharCount = firstCharCount % 10;
    secondCharCount = secondCharCount % 10;

    // Combine the counts into a single number
    return Number(`${firstCharCount}${secondCharCount}`);
  }
}
