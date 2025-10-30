import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ReadingStatsService } from './services/reading-stats.service';
import { VocabularyStatsService } from './services/vocabulary-stats.service';
import { ReadingProgressService } from './services/reading-progress.service';
import { InsightsService } from './services/insights.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    ReadingStatsService,
    VocabularyStatsService,
    ReadingProgressService,
    InsightsService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
