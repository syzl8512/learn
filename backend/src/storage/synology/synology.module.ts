import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SynologyService } from './synology.service';

@Module({
  imports: [ConfigModule],
  providers: [SynologyService],
  exports: [SynologyService],
})
export class SynologyModule {}
