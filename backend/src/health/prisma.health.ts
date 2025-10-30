/**
 * Prisma 健康检查指示器
 *
 * 用于检查 PostgreSQL 数据库连接状态
 *
 * @module PrismaHealthIndicator
 */

import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  /**
   * 检查 Prisma/PostgreSQL 连接健康状态
   *
   * @param key - 健康检查结果的键名
   * @returns 健康检查结果
   * @throws HealthCheckError 当数据库连接失败时
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // 执行简单查询测试连接
      await this.prismaService.$queryRaw`SELECT 1`;

      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Prisma 健康检查失败',
        this.getStatus(key, false, {
          message: error.message,
        }),
      );
    }
  }
}
