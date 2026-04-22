import { Module } from '@nestjs/common';
import { KasusController } from './kasus.controller';
import { KasusService } from './kasus.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [KasusController],
  providers: [KasusService, PrismaService],
})
export class KasusModule {}
