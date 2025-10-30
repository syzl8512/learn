import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../config/prisma.module';
import { PdfProcessingProcessor } from './pdf-processing.queue';
import { MinerUModule } from '../ai-pipeline/minerU/minerU.module';
import { ChapterSplitterModule } from '../ai-pipeline/chapter-splitter/chapter-splitter.module';
import { QualityCheckModule } from '../ai-pipeline/quality-check/quality-check.module';
import { StorageModule } from '../ai-pipeline/storage/storage.module';

@Module({
  imports: [
    // Bull 根配置
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6380),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100, // 保留最近 100 个完成的任务
          removeOnFail: 200, // 保留最近 200 个失败的任务
        },
      }),
      inject: [ConfigService],
    }),

    // 注册 PDF 处理队列
    BullModule.registerQueue({
      name: 'pdf-processing',
    }),

    // 依赖的模块
    PrismaModule,
    MinerUModule,
    ChapterSplitterModule,
    QualityCheckModule,
    StorageModule,
  ],
  providers: [PdfProcessingProcessor],
  exports: [BullModule],
})
export class QueueModule {}
