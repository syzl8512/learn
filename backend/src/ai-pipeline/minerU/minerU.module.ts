import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinerUService } from './minerU.service';

@Module({
  imports: [ConfigModule],
  providers: [MinerUService],
  exports: [MinerUService],
})
export class MinerUModule {}
