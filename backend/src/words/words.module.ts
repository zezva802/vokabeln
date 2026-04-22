import { Module } from '@nestjs/common';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WordsController],
  providers: [WordsService, PrismaService],
})
export class WordsModule {}
