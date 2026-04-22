import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { VerbsService } from './verbs.service';

@Controller('verbs')
export class VerbsController {
  constructor(private readonly verbsService: VerbsService) {}

  @Get()
  findAll() {
    return this.verbsService.findAll();
  }

  @Post('import')
  bulkImport(@Body() body: { lines: string[] }) {
    return this.verbsService.bulkImport(body.lines);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.verbsService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.verbsService.removeAll();
  }
}
