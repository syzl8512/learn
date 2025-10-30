import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { VocabularyStatsService } from './services/vocabulary-stats.service';
import { ReadingStatsService } from './services/reading-stats.service';
import { BookmarkStatsService } from './services/bookmark-stats.service';
import { HeatmapStatsService } from './services/heatmap-stats.service';

@Module({
  imports: [PrismaModule],
  controllers: [StatsController],
  providers: [
    StatsService,
    VocabularyStatsService,
    ReadingStatsService,
    BookmarkStatsService,
    HeatmapStatsService,
  ],
  exports: [StatsService],
})
export class StatsModule {}
