import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { StorageService } from '../../storage/storage.service';
import { CosyVoiceService } from './cosyvoice.service';

export interface TTSConfig {
  apiUrl: string;
  model: string;
  voice: string;
  timeout: number;
}

export interface TTSResult {
  success: boolean;
  audioUrl?: string;
  subtitleUrl?: string;
  error?: string;
}

export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

@Injectable()
export class TTSService {
  private readonly logger = new Logger(TTSService.name);
  private readonly config: TTSConfig;

  constructor(
    private configService: ConfigService,
    private storageService: StorageService,
    private cosyVoiceService: CosyVoiceService,
  ) {
    this.config = {
      apiUrl: this.configService.get<string>('KOKORO_API_URL', 'http://localhost:8880'),
      model: this.configService.get<string>('KOKORO_MODEL', 'kokoro'),
      voice: this.configService.get<string>('KOKORO_VOICE', 'af_bella'),
      timeout: this.configService.get<number>('KOKORO_TIMEOUT', 60000),
    };

    this.logger.log(`TTS 服务初始化: ${this.config.apiUrl}`);
  }

  /**
   * 生成语音
   */
  async generateSpeech(
    text: string,
    options: {
      voice?: string;
      speed?: number;
      withSubtitle?: boolean;
      emotion?: string;
      language?: 'zh' | 'en';
    } = {},
  ): Promise<TTSResult> {
    try {
      const voice = options.voice || this.config.voice;
      const speed = options.speed || 1.0;
      const withSubtitle = options.withSubtitle !== false;
      const emotion = options.emotion || 'neutral';
      const language = options.language || 'en';

      this.logger.log(`开始生成语音: ${text.substring(0, 50)}...`);

      // 优先使用 CosyVoice
      const cosyVoiceResult = await this.cosyVoiceService.generateSpeech(text, {
        voice,
        emotion,
        speed,
        language,
      });

      if (cosyVoiceResult.success) {
        this.logger.log('CosyVoice 生成成功');
        return {
          success: true,
          audioUrl: cosyVoiceResult.audioUrl,
        };
      } else {
        this.logger.warn('CosyVoice 生成失败，尝试降级方案', cosyVoiceResult.error);

        // 降级到 Kokoro-FastAPI
        if (withSubtitle) {
          return await this.generateSpeechWithSubtitle(text, voice, speed);
        } else {
          return await this.generateSpeechOnly(text, voice, speed);
        }
      }
    } catch (error) {
      this.logger.error('生成语音失败', error);
      return {
        success: false,
        error: error.message || '语音生成失败',
      };
    }
  }

  /**
   * 仅生成语音（无字幕）
   */
  private async generateSpeechOnly(text: string, voice: string, speed: number): Promise<TTSResult> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.config.apiUrl}/v1/audio/speech`,
        {
          model: this.config.model,
          input: text,
          voice: voice,
          response_format: 'mp3',
          speed: speed,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: this.config.timeout,
        },
      );

      if (response.status === 200) {
        const audioBuffer = Buffer.from(response.data);
        const fileName = this.generateFileName('audio', 'mp3');

        // 存储音频文件
        const storageResult = await this.storageService.storeAudioFile(fileName, audioBuffer, {
          immediate: true,
          cache: true,
        });

        if (storageResult.success) {
          this.logger.log(`语音生成成功: ${fileName}`);
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
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      this.logger.error('语音生成异常', error);
      return {
        success: false,
        error: error.message || '语音生成失败',
      };
    }
  }

  /**
   * 生成语音和字幕
   */
  private async generateSpeechWithSubtitle(
    text: string,
    voice: string,
    speed: number,
  ): Promise<TTSResult> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.config.apiUrl}/dev/captioned_speech`,
        {
          model: this.config.model,
          input: text,
          voice: voice,
          speed: speed,
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: this.config.timeout,
        },
      );

      if (response.status === 200) {
        const result = response.data;

        // 处理音频文件
        let audioUrl: string | undefined;
        if (result.audio) {
          const audioBuffer = Buffer.from(result.audio, 'base64');
          const audioFileName = this.generateFileName('audio', 'mp3');

          const audioStorageResult = await this.storageService.storeAudioFile(
            audioFileName,
            audioBuffer,
            { immediate: true, cache: true },
          );

          if (audioStorageResult.success) {
            audioUrl = audioStorageResult.remoteUrl || audioStorageResult.cacheUrl;
          }
        }

        // 处理字幕文件
        let subtitleUrl: string | undefined;
        if (result.subtitles) {
          const subtitleContent = this.formatSubtitles(result.subtitles);
          const subtitleBuffer = Buffer.from(subtitleContent, 'utf-8');
          const subtitleFileName = this.generateFileName('subtitle', 'srt');

          const subtitleStorageResult = await this.storageService.storeAudioFile(
            subtitleFileName,
            subtitleBuffer,
            { immediate: true, cache: true },
          );

          if (subtitleStorageResult.success) {
            subtitleUrl = subtitleStorageResult.remoteUrl || subtitleStorageResult.cacheUrl;
          }
        }

        this.logger.log(`语音和字幕生成成功`);
        return {
          success: true,
          audioUrl,
          subtitleUrl,
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      this.logger.error('语音和字幕生成异常', error);
      return {
        success: false,
        error: error.message || '语音和字幕生成失败',
      };
    }
  }

  /**
   * 格式化字幕为 SRT 格式
   */
  private formatSubtitles(subtitles: SubtitleSegment[]): string {
    return subtitles
      .map((segment, index) => {
        const startTime = this.formatTime(segment.start);
        const endTime = this.formatTime(segment.end);
        return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`;
      })
      .join('\n');
  }

  /**
   * 格式化时间（秒转换为 SRT 时间格式）
   */
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds
      .toString()
      .padStart(3, '0')}`;
  }

  /**
   * 生成文件名
   */
  private generateFileName(type: string, extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}_${timestamp}_${random}.${extension}`;
  }

  /**
   * 获取可用的语音列表
   */
  async getAvailableVoices(): Promise<
    Array<{ id: string; name: string; language: string; emotion: string; description: string }>
  > {
    // 优先返回 CosyVoice 的语音列表
    const cosyVoiceVoices = this.cosyVoiceService.getAvailableVoices();

    // 添加 Kokoro-FastAPI 的语音作为备选
    const kokoroVoices = [
      {
        id: 'af_bella',
        name: 'Kokoro Bella',
        language: 'en',
        emotion: 'neutral',
        description: 'Kokoro 女性，美式英语',
      },
      {
        id: 'af_sarah',
        name: 'Kokoro Sarah',
        language: 'en',
        emotion: 'neutral',
        description: 'Kokoro 女性，美式英语',
      },
      {
        id: 'af_emma',
        name: 'Kokoro Emma',
        language: 'en',
        emotion: 'neutral',
        description: 'Kokoro 女性，英式英语',
      },
      {
        id: 'af_grace',
        name: 'Kokoro Grace',
        language: 'en',
        emotion: 'neutral',
        description: 'Kokoro 女性，英式英语',
      },
    ];

    return [...cosyVoiceVoices, ...kokoroVoices];
  }

  /**
   * 健康检查
   */
  async checkHealth(): Promise<boolean> {
    try {
      // 检查 CosyVoice 服务
      const cosyVoiceHealthy = await this.cosyVoiceService.checkHealth();
      if (cosyVoiceHealthy) {
        return true;
      }

      // 检查 Kokoro-FastAPI 服务
      const response = await axios.get(`${this.config.apiUrl}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      this.logger.error('TTS 服务健康检查失败', error);
      return false;
    }
  }

  /**
   * 获取配置信息（用于调试）
   */
  getConfig(): Partial<TTSConfig> {
    return {
      apiUrl: this.config.apiUrl,
      model: this.config.model,
      voice: this.config.voice,
      timeout: this.config.timeout,
    };
  }
}
