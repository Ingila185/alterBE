import { IsOptional, IsString, Matches, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GridRequestDto {
  @ApiPropertyOptional({
    description: 'Single lowercase letter to bias the grid generation',
    example: 'x',
    minLength: 1,
    maxLength: 1,
  })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  @Matches(/^[a-z]$/, {
    message: 'Bias must be a single lowercase letter',
  })
  bias?: string;
}
