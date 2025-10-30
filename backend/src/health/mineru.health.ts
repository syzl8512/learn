import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { MinerUService } from '../ai-pipeline/minerU/minerU.service';

/**
 * MinerU 服务健康检查
 */
@Injectable()
export class MinerUHealthIndicator extends HealthIndicator {
  constructor(private readonly minerUService: MinerUService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const health = await this.minerUService.checkHealth();

    const result = this.getStatus(key, health.healthy, {
      ...health,
      details: health.details,
    });

    if (!health.healthy) {
      throw new HealthCheckError('MinerU check failed', result);
    }

    return result;
  }
}
