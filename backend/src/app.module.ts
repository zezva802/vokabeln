import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WordsModule } from './words/words.module';
import { KasusModule } from './kasus/kasus.module';
import { VerbsModule } from './verbs/verbs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WordsModule,
    KasusModule,
    VerbsModule,
  ],
})
export class AppModule {}
