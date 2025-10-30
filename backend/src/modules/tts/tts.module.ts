import { Module } from '@nestjs/common';
import { TTSController } from './tts.controller';
import { TTSModule as AITTSModule } from '../../ai-pipeline/tts/tts.module';

@Module({
  imports: [AITTSModule],
  controllers: [TTSController],
})
export class TtsModule {}
