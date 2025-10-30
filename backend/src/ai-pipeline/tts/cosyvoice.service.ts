import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { StorageService } from '../../storage/storage.service';

export interface CosyVoiceConfig {
  apiKey: string;
  baseUrl: string;
  modelId: string;
  timeout: number;
}

export interface CosyVoiceOptions {
  voice?: string;
  emotion?: string;
  speed?: number;
  language?: 'zh' | 'en';
}

@Injectable()
export class CosyVoiceService {
  private readonly logger = new Logger(CosyVoiceService.name);
  private readonly config: CosyVoiceConfig;

  constructor(
    private configService: ConfigService,
    private storageService: StorageService,
  ) {
    this.config = {
      apiKey: this.configService.get<string>('MODELSCOPE_API_KEY') || '',
      baseUrl: this.configService.get<string>('MODELSCOPE_API_URL', 'https://api.modelscope.cn'),
      modelId: 'iic/CosyVoice-300M',
      timeout: this.configService.get<number>('COSYVOICE_TIMEOUT', 60000),
    };

    this.logger.log(`CosyVoice 服务初始化: ${this.config.baseUrl}`);
  }

  /**
   * 生成语音
   */
  async generateSpeech(
    text: string,
    options: CosyVoiceOptions = {},
  ): Promise<{
    success: boolean;
    audioUrl?: string;
    error?: string;
  }> {
    try {
      const { voice = 'en_female_1', emotion = 'neutral', speed = 1.0, language = 'en' } = options;

      this.logger.log(`开始生成语音: ${text.substring(0, 50)}...`);

      // 调用魔搭社区 CosyVoice API
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/models/${this.config.modelId}/inference`,
        {
          input: {
            text: text,
            voice: voice,
            emotion: emotion,
            speed: speed,
            language: language,
          },
          parameters: {
            output_format: 'mp3',
            sample_rate: 22050,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.config.timeout,
        },
      );

      if (response.status === 200 && response.data.output) {
        // 获取音频数据
        const audioData = response.data.output.audio;
        const audioBuffer = Buffer.from(audioData, 'base64');

        // 生成文件名
        const fileName = `cosyvoice_${Date.now()}.mp3`;

        // 存储音频文件
        const storageResult = await this.storageService.storeAudioFile(fileName, audioBuffer, {
          immediate: true,
          cache: true,
        });

        if (storageResult.success) {
          this.logger.log(`CosyVoice 语音生成成功: ${fileName}`);
          return {
            success: true,
            audioUrl: storageResult.remoteUrl || storageResult.cacheUrl,
          };
        } else {
          return {
            success: false,
            error: storageResult.error || '音频文件存储失败',
          };
        }
      } else {
        return {
          success: false,
          error: 'CosyVoice API 响应异常',
        };
      }
    } catch (error) {
      this.logger.error('CosyVoice 生成失败', error);

      // 如果是网络错误，返回降级方案
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return {
          success: false,
          error: '网络连接失败，请稍后重试',
        };
      }

      return {
        success: false,
        error: error.message || '语音生成失败',
      };
    }
  }

  /**
   * 获取可用语音列表
   */
  getAvailableVoices(): Array<{
    id: string;
    name: string;
    language: string;
    emotion: string;
    description: string;
  }> {
    return [
      // 英文语音
      {
        id: 'en_female_1',
        name: 'English Female 1',
        language: 'en',
        emotion: 'neutral',
        description: '美式英语女声，自然流畅',
      },
      {
        id: 'en_female_2',
        name: 'English Female 2',
        language: 'en',
        emotion: 'happy',
        description: '美式英语女声，愉快活泼',
      },
      {
        id: 'en_male_1',
        name: 'English Male 1',
        language: 'en',
        emotion: 'neutral',
        description: '美式英语男声，沉稳自然',
      },
      {
        id: 'en_male_2',
        name: 'English Male 2',
        language: 'en',
        emotion: 'serious',
        description: '美式英语男声，严肃正式',
      },

      // 中文语音
      {
        id: 'zh_female_1',
        name: '中文女声 1',
        language: 'zh',
        emotion: 'neutral',
        description: '普通话女声，自然清晰',
      },
      {
        id: 'zh_female_2',
        name: '中文女声 2',
        language: 'zh',
        emotion: 'happy',
        description: '普通话女声，活泼愉快',
      },
      {
        id: 'zh_male_1',
        name: '中文男声 1',
        language: 'zh',
        emotion: 'neutral',
        description: '普通话男声，沉稳自然',
      },
      {
        id: 'zh_male_2',
        name: '中文男声 2',
        language: 'zh',
        emotion: 'serious',
        description: '普通话男声，严肃正式',
      },
    ];
  }

  /**
   * 获取可用情感列表
   */
  getAvailableEmotions(): Array<{ id: string; name: string; description: string }> {
    return [
      { id: 'neutral', name: '中性', description: '平静、自然的情感' },
      { id: 'happy', name: '开心', description: '愉快、积极的情感' },
      { id: 'sad', name: '悲伤', description: '低沉、忧郁的情感' },
      { id: 'angry', name: '愤怒', description: '激动、愤怒的情感' },
      { id: 'serious', name: '严肃', description: '正式、严肃的情感' },
      { id: 'excited', name: '兴奋', description: '激动、兴奋的情感' },
    ];
  }

  /**
   * 健康检查
   */
  async checkHealth(): Promise<boolean> {
    try {
      // 测试 API 连接
      const response = await axios.get(
        `${this.config.baseUrl}/api/v1/models/${this.config.modelId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          timeout: 10000,
        },
      );
      return response.status === 200;
    } catch (error) {
      this.logger.error('CosyVoice 健康检查失败', error);
      return false;
    }
  }

  /**
   * 获取配置信息（用于调试）
   */
  getConfig(): Partial<CosyVoiceConfig> {
    return {
      baseUrl: this.config.baseUrl,
      modelId: this.config.modelId,
      timeout: this.config.timeout,
      // 不返回 API Key
    };
  }
}
