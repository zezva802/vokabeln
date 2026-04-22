import { Controller, Get } from '@nestjs/common';
import { KasusService } from './kasus.service';

@Controller('kasus')
export class KasusController {
  constructor(private readonly kasusService: KasusService) {}

  @Get('question')
  getQuestion() {
    return this.kasusService.getQuestion();
  }
}
