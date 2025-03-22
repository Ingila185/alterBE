import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { IGridGeneratorResponse } from './common/interfaces/GridGeneratorResponse';

@Controller('grid-response')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  RandomAlphabetGenerator(
    @Query('bias') bias?: string,
  ): IGridGeneratorResponse {
    return this.appService.getGridGeneratorResponse(bias);
  }
}
