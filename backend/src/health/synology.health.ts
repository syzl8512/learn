import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { SynologyService } from '../storage/synology/synology.service';

@Injectable()
export class SynologyHealthIndicator extends HealthIndicator {
  constructor(private readonly synologyService: SynologyService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = await this.synologyService.checkHealth();

      if (isHealthy) {
        return this.getStatus(key, true, {
          message: '群晖 WebDAV 服务正常',
          config: this.synologyService.getConfig(),
        });
      } else {
        throw new HealthCheckError(
          '群晖 WebDAV 服务异常',
          this.getStatus(key, false, {
            message: '群晖 WebDAV 服务连接失败',
            config: this.synologyService.getConfig(),
          }),
        );
      }
    } catch (error) {
      throw new HealthCheckError(
        '群晖 WebDAV 服务检查失败',
        this.getStatus(key, false, {
          message: error.message,
          config: this.synologyService.getConfig(),
        }),
      );
    }
  }
}
