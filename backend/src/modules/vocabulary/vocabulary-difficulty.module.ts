import { Module } from '@nestjs/common';
import { VocabularyDifficultyService } from './vocabulary-difficulty.service';
import { DifficultyAnalyzerService } from './difficulty/difficulty-analyzer.service';
import { HighlightEngineService } from './difficulty/highlight-engine.service';
import { WordCacheService } from './difficulty/word-cache.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [
    VocabularyDifficultyService,
    DifficultyAnalyzerService,
    HighlightEngineService,
    WordCacheService,
  ],
  exports: [VocabularyDifficultyService],
})
export class VocabularyDifficultyModule {}
