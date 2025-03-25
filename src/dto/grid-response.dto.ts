import { ApiProperty } from '@nestjs/swagger';

export class GridDimensionsDto {
  @ApiProperty({
    description: 'Number of rows in the grid',
    example: 10,
  })
  rows: number;

  @ApiProperty({
    description: 'Number of columns in the grid',
    example: 10,
  })
  columns: number;
}

export class GridMetadataDto {
  @ApiProperty({
    description: 'Grid dimensions',
    type: GridDimensionsDto,
  })
  dimensions: GridDimensionsDto;

  @ApiProperty({
    description: 'Character used for bias (if any)',
    example: 'x',
    required: false,
  })
  biasCharacter?: string;

  @ApiProperty({
    description: 'Percentage of bias applied (if any)',
    example: 20,
    required: false,
  })
  biasPercentage?: number;

  @ApiProperty({
    description: 'Timestamp of grid generation',
    example: '2024-03-21T12:34:56.789Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'API version',
    example: '1.0.0',
  })
  version: string;
}

export class GridDataDto {
  @ApiProperty({
    description: '2D array of grid contents',
    example: [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ],
  })
  gridContents: string[][];

  @ApiProperty({
    description: 'Generated grid code',
    example: 42,
  })
  gridCode: number;

  @ApiProperty({
    description: 'Grid metadata',
    type: GridMetadataDto,
  })
  metadata: GridMetadataDto;
}

export class GridResponseDto {
  @ApiProperty({
    description: 'Response status',
    example: {
      code: 200,
      message: 'Grid generated successfully',
      success: true,
    },
  })
  status: {
    code: number;
    message: string;
    success: boolean;
    error?: string;
  };

  @ApiProperty({
    description: 'Response data',
    type: GridDataDto,
  })
  data: GridDataDto | null;
}
