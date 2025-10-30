import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { VocabularyExportService } from './vocabulary-export.service';
import { DictionaryService } from './dictionary.service';
import { VocabularyDifficultyService } from './vocabulary-difficulty.service';
import { DifficultyAnalyzerService } from './difficulty/difficulty-analyzer.service';
import { HighlightEngineService } from './difficulty/highlight-engine.service';
import { WordCacheService } from './difficulty/word-cache.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [VocabularyController],
  providers: [
    VocabularyService,
    VocabularyExportService,
    DictionaryService,
    VocabularyDifficultyService,
    DifficultyAnalyzerService,
    HighlightEngineService,
    WordCacheService,
  ],
  exports: [
    VocabularyService,
    VocabularyExportService,
    DictionaryService,
    VocabularyDifficultyService,
  ],
})
export class VocabularyModule {}
