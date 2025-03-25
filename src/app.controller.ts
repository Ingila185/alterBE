import {
  Controller,
  Get,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import {
  GridGeneratorResponse,
  ErrorResponse,
} from './interfaces/api-response.interface';
import { BiasValidationException } from './common/exceptions/bias-validation.exception';
import { GridRequestDto } from './dto/grid-request.dto';
import { GridResponseDto } from './dto/grid-response.dto';

@ApiTags('Grid Generator')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('grid')
  @ApiOperation({ summary: 'Generate a random alphabet grid' })
  @ApiResponse({
    status: 200,
    description: 'Grid generated successfully',
    type: GridResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid bias parameter',
    type: GridResponseDto,
  })
  async getGrid(@Query() query: GridRequestDto): Promise<GridResponseDto> {
    try {
      return await this.appService.getGridGeneratorResponse(query.bias);
    } catch (error) {
      if (error instanceof BiasValidationException) {
        throw new HttpException(
          {
            status: {
              code: HttpStatus.BAD_REQUEST,
              message: error.message,
              success: false,
              error: error.name,
            },
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // For any other unexpected errors
      throw new HttpException(
        {
          status: {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'An unexpected error occurred',
            success: false,
            error: 'InternalServerError',
          },
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
