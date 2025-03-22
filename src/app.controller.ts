import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IGridGeneratorResponse } from './common/interfaces/GridGeneratorResponse';

@Controller('grid-response')

export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  RandomAlphabetGenerator(): IGridGeneratorResponse {
    return this.appService.getGridGeneratorResponse();
  }
}
