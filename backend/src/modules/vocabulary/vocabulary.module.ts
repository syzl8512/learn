import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { VocabularyExportService } from './vocabulary-export.service';
import { DictionaryService } from './dictionary.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [VocabularyController],
  providers: [
    VocabularyService,
    VocabularyExportService,
    DictionaryService,
  ],
  exports: [
    VocabularyService,
    VocabularyExportService,
    DictionaryService,
  ],
})
export class VocabularyModule {}
