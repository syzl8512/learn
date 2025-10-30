/**
 * 健康检查控制器
 *
 * 提供系统健康状态检查端点,用于:
 * - Docker 容器健康检查
 * - 负载均衡器健康探测
 * - 监控系统状态检查
 *
 * @module HealthController
 */

import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaHealthIndicator } from './prisma.health';
import { RedisHealthIndicator } from './redis.health';
import { MinerUHealthIndicator } from './mineru.health';
import { SynologyHealthIndicator } from './synology.health';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private redisHealth: RedisHealthIndicator,
    private minerUHealth: MinerUHealthIndicator,
    private synologyHealth: SynologyHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  /**
   * 基础健康检查
   *
   * 仅检查 API 服务是否响应,不检查依赖服务
   * 适用于 Docker HEALTHCHECK 和快速探测
   *
   * @returns 健康状态
   */
  @Get()
  @ApiOperation({ summary: '基础健康检查' })
  @ApiResponse({
    status: 200,
    description: '服务健康',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-10-26T10:00:00.000Z',
        uptime: 3600,
      },
    },
  })
  @ApiResponse({ status: 503, description: '服务不健康' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * 完整健康检查
   *
   * 检查所有关键依赖服务:
   * - 数据库 (PostgreSQL via Prisma)
   * - 缓存 (Redis)
   * - 内存使用
   * - 磁盘空间
   *
   * @returns 详细健康状态
   */
  @Get('detailed')
  @HealthCheck()
  @ApiOperation({ summary: '详细健康检查' })
  @ApiResponse({
    status: 200,
    description: '所有服务健康',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
          storage: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          redis: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
          storage: { status: 'up' },
        },
      },
    },
  })
  @ApiResponse({ status: 503, description: '部分或全部服务不健康' })
  async checkDetailed() {
    return this.health.check([
      // 数据库健康检查
      () => this.prismaHealth.isHealthy('database'),

      // Redis 健康检查
      () => this.redisHealth.isHealthy('redis'),

      // MinerU PDF 转换服务健康检查
      () => this.minerUHealth.isHealthy('mineru'),

      // 群晖存储服务健康检查
      () => this.synologyHealth.isHealthy('synology'),

      // 内存使用检查 (堆内存 < 512MB)
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),

      // 内存使用检查 (RSS < 1GB)
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),

      // 磁盘空间检查 (剩余空间 > 10%)
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }

  /**
   * 就绪检查 (Readiness Probe)
   *
   * 检查服务是否准备好接收流量
   * 用于 Kubernetes/Docker Swarm 的就绪探测
   *
   * @returns 就绪状态
   */
  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: '就绪检查' })
  @ApiResponse({ status: 200, description: '服务已就绪' })
  @ApiResponse({ status: 503, description: '服务未就绪' })
  async checkReadiness() {
    return this.health.check([
      // 必须检查数据库和 Redis
      () => this.prismaHealth.isHealthy('database'),
      () => this.redisHealth.isHealthy('redis'),
    ]);
  }

  /**
   * 存活检查 (Liveness Probe)
   *
   * 检查服务进程是否存活
   * 用于 Kubernetes/Docker Swarm 的存活探测
   *
   * @returns 存活状态
   */
  @Get('live')
  @ApiOperation({ summary: '存活检查' })
  @ApiResponse({
    status: 200,
    description: '服务存活',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-10-26T10:00:00.000Z',
      },
    },
  })
  checkLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
