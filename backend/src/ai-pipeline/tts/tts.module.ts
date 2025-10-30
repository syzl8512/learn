import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TTSService } from './tts.service';
import { CosyVoiceService } from './cosyvoice.service';
import { StorageModule } from '../../storage/storage.module';

@Module({
  imports: [ConfigModule, StorageModule],
  providers: [TTSService, CosyVoiceService],
  exports: [TTSService, CosyVoiceService],
})
export class TTSModule {}
