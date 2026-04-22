import { Controller, Get, Post, Body } from '@nestjs/common';
import { SentencesService } from './sentences.service';

@Controller('sentences')
export class SentencesController {
  constructor(private readonly sentencesService: SentencesService) {}

  @Get('question')
  getQuestion() {
    return this.sentencesService.getQuestion();
  }

  @Post('check')
  check(@Body() body: { userAnswer: string; acceptedVariations: string[] }) {
    return this.sentencesService.check(body.userAnswer, body.acceptedVariations);
  }
}
