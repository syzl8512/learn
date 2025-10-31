import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';
import { PrismaModule } from './common/prisma/prisma.module';

// 业务模块
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { BookModule } from './modules/book/book.module';
import { ChapterModule } from './modules/chapter/chapter.module';
import { TtsModule } from './modules/tts/tts.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { ProgressModule } from './modules/progress/progress.module';
// import { ListeningModule } from './modules/listening/listening.module'; // Temporarily disabled

// AI 服务模块
import { ModelScopeModule } from './ai-pipeline/modelscope/modelscope.module';
import { TTSModule } from './ai-pipeline/tts/tts.module';

// 存储模块
import { StorageModule } from './storage/storage.module';

// 健康检查模块
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [() => ({
        jwt: {
          secret: process.env.JWT_SECRET || 'default-secret-key',
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
          refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
          refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
        },
      })],
    }),

    // 限流模块
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'),
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      },
    ]),

    // 日志模块
    WinstonModule.forRoot(winstonConfig),

    // Prisma 数据库
    PrismaModule,

    // 业务模块
    AuthModule,
    UserModule,
    BookModule,
    ChapterModule,
      TtsModule,
    VocabularyModule,
    ProgressModule,
      // ListeningModule, // Temporarily disabled

    // AI 服务模块
    ModelScopeModule,
    TTSModule,

    // 存储模块
    StorageModule,

    // 健康检查模块
    HealthModule,
  ],
})
export class AppModule {}
