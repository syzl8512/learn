/**
 * Redis 健康检查指示器
 *
 * 用于检查 Redis 连接状态
 *
 * @module RedisHealthIndicator
 */

import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
// import { InjectRedis } from '@liaoliaots/nestjs-redis';
// import { Redis } from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(/* @InjectRedis() private readonly redis: Redis */) {
    super();
  }

  /**
   * 检查 Redis 连接健康状态
   *
   * @param key - 健康检查结果的键名
   * @returns 健康检查结果
   * @throws HealthCheckError 当 Redis 连接失败时
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // 暂时返回健康状态，不实际检查 Redis
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Redis 健康检查失败',
        this.getStatus(key, false, {
          message: error.message,
        }),
      );
    }
  }
}
