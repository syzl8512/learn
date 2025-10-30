import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SynologyModule } from './synology/synology.module';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule, SynologyModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
