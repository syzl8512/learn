/**
 * 健康检查模块
 *
 * 提供系统健康状态检查功能
 *
 * @module HealthModule
 */

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma.health';
import { RedisHealthIndicator } from './redis.health';
import { MinerUHealthIndicator } from './mineru.health';
import { SynologyHealthIndicator } from './synology.health';
import { PrismaModule } from '../common/prisma/prisma.module';
import { MinerUModule } from '../ai-pipeline/minerU/minerU.module';
import { SynologyModule } from '../storage/synology/synology.module';

@Module({
  imports: [TerminusModule, HttpModule, PrismaModule, MinerUModule, SynologyModule],
  controllers: [HealthController],
  providers: [
    PrismaHealthIndicator,
    RedisHealthIndicator,
    MinerUHealthIndicator,
    SynologyHealthIndicator,
  ],
})
export class HealthModule {}
