import {
  Controller,
  Get,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  GridGeneratorResponse,
  ErrorResponse,
} from './interfaces/api-response.interface';
import { BiasValidationException } from './common/exceptions/bias-validation.exception';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('grid')
  async getGrid(@Query('bias') bias?: string): Promise<GridGeneratorResponse> {
    try {
      return this.appService.getGridGeneratorResponse(bias);
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
