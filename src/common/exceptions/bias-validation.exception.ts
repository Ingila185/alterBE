import { HttpException, HttpStatus } from '@nestjs/common';

export class BiasValidationException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bias Validation Error',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
