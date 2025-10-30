import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BookController } from './book.controller';
import { BookChaptersController } from './book-chapters.controller';
import { ChapterSplittingController } from './controllers/chapter-splitting.controller';
import { BookService } from './book.service';
import { BookInfoService } from './services/book-info.service';
import { ChapterSplittingService } from './services/chapter-splitting.service';
import { ChapterModule } from '../chapter/chapter.module';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ChapterSplitterModule } from '../../ai-pipeline/chapter-splitter/chapter-splitter.module';
import { ChapterSplittingProcessor } from '../../queue/chapter-splitting.queue';

@Module({
  imports: [
    PrismaModule,
    ChapterModule,
    ChapterSplitterModule,
    BullModule.registerQueue({
      name: 'pdf-processing',
    }),
    BullModule.registerQueue({
      name: 'chapter-splitting',
    }),
  ],
  controllers: [BookController, BookChaptersController, ChapterSplittingController],
  providers: [BookService, BookInfoService, ChapterSplittingService, ChapterSplittingProcessor],
  exports: [BookService, BookInfoService, ChapterSplittingService],
})
export class BookModule {}
