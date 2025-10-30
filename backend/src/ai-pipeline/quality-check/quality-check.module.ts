import { Module } from '@nestjs/common';
import { QualityCheckService } from './quality-check.service';

@Module({
  providers: [QualityCheckService],
  exports: [QualityCheckService],
})
export class QualityCheckModule {}
