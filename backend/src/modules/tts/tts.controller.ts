import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TTSService } from '../../ai-pipeline/tts/tts.service';
import { Request as ExpressRequest } from 'express';

export class GenerateSpeechDto {
  text: string;
  voice?: string;
  speed?: number;
  withSubtitle?: boolean;
}

export class TTSResultDto {
  success: boolean;
  audioUrl?: string;
  subtitleUrl?: string;
  error?: string;
}

@ApiTags('TTS 语音合成')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tts')
export class TTSController {
  constructor(private readonly ttsService: TTSService) {}

  /**
   * 生成语音
   */
  @Post('generate')
  @ApiOperation({ summary: '生成语音' })
  @ApiResponse({
    status: 200,
    description: '生成成功',
    type: TTSResultDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async generateSpeech(@Body() dto: GenerateSpeechDto, @Request() req: ExpressRequest): Promise<TTSResultDto> {
    return this.ttsService.generateSpeech(dto.text, {
      voice: dto.voice,
      speed: dto.speed,
      withSubtitle: dto.withSubtitle,
    });
  }

  /**
   * 获取可用语音列表
   */
  @Get('voices')
  @ApiOperation({ summary: '获取可用语音列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [String],
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getAvailableVoices(): Promise<Array<{id: string; name: string; language: string; emotion: string; description: string}>> {
    const voices = [
      { id: 'default', name: 'Default Voice', language: 'en-US', emotion: 'neutral', description: 'Default English voice' },
      { id: 'female', name: 'Female Voice', language: 'en-US', emotion: 'friendly', description: 'Friendly female voice' },
      { id: 'male', name: 'Male Voice', language: 'en-US', emotion: 'calm', description: 'Calm male voice' },
    ];
    return voices;
  }

  /**
   * 健康检查
   */
  @Get('health')
  @ApiOperation({ summary: 'TTS 服务健康检查' })
  @ApiResponse({
    status: 200,
    description: '服务健康',
  })
  @ApiResponse({ status: 503, description: '服务不健康' })
  async checkHealth(): Promise<{ status: string; healthy: boolean }> {
    const healthy = await this.ttsService.checkHealth();
    return {
      status: healthy ? 'ok' : 'error',
      healthy,
    };
  }
}
