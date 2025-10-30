import { Module } from '@nestjs/common';
import { ChapterSplitterService } from './chapter-splitter.service';
import { DeepSeekModule } from '../deepseek/deepseek.module';

@Module({
  imports: [DeepSeekModule],
  providers: [ChapterSplitterService],
  exports: [ChapterSplitterService],
})
export class ChapterSplitterModule {}
