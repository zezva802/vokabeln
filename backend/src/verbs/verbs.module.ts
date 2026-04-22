import { Module } from '@nestjs/common';
import { VerbsController } from './verbs.controller';
import { VerbsService } from './verbs.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [VerbsController],
  providers: [VerbsService, PrismaService],
})
export class VerbsModule {}
