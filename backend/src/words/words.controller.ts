import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { WordsService } from './words.service';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get()
  findAll() {
    return this.wordsService.findAll();
  }

  @Post()
  create(@Body() body: { german: string; article?: string; translation: string; type?: string; lesson?: number }) {
    return this.wordsService.create(body);
  }

  @Post('import')
  bulkImport(@Body() body: { lines: string[] }) {
    return this.wordsService.bulkImport(body.lines);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wordsService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.wordsService.removeAll();
  }
}
