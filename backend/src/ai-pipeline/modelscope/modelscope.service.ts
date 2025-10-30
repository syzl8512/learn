import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DeepSeekService } from '../deepseek/deepseek.service';

@Injectable()
export class ModelScopeService {
  private readonly logger = new Logger(ModelScopeService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly deepSeekService: DeepSeekService;

  constructor(
    private configService: ConfigService,
    deepSeekService: DeepSeekService,
  ) {
    this.apiKey = this.configService.get<string>('MODELSCOPE_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('MODELSCOPE_API_URL') || '';
    this.deepSeekService = deepSeekService;

    if (!this.apiKey || !this.apiUrl) {
      this.logger.warn(
        'ModelScope API key or URL is not configured. Will use DeepSeek as fallback.',
      );
    }
  }

  async generateText(prompt: string, model: string = 'qwen-max'): Promise<string> {
    this.logger.log(`Calling ModelScope API with model: ${model}`);

    // 如果没有配置 ModelScope API，直接使用 DeepSeek
    if (!this.apiKey || !this.apiUrl) {
      this.logger.log('ModelScope API not configured, using DeepSeek as fallback');
      return this.deepSeekService.generateText(prompt);
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model,
          input: {
            messages: [{ role: 'user', content: prompt }],
          },
          parameters: {
            result_format: 'message',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'X-DashScope-SSE': 'enable', // Enable SSE for streaming, though we're not consuming it as a stream here
          },
        },
      );

      const content = response.data?.output?.choices?.[0]?.message?.content;
      if (!content) {
        this.logger.error(
          `ModelScope API response missing content: ${JSON.stringify(response.data)}`,
        );
        throw new InternalServerErrorException('ModelScope API response missing content.');
      }
      this.logger.log(
        `ModelScope API response received (partial): ${content.substring(0, 100)}...`,
      );
      return content;
    } catch (error) {
      this.logger.error(`Error calling ModelScope API: ${error.message}`, error.stack);

      // 如果 ModelScope API 失败，降级到 DeepSeek
      this.logger.log('ModelScope API failed, falling back to DeepSeek');
      try {
        return await this.deepSeekService.generateText(prompt);
      } catch (deepSeekError) {
        this.logger.error('Both ModelScope and DeepSeek failed', deepSeekError);
        throw new InternalServerErrorException(`All AI services failed: ${error.message}`);
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      // 检查 ModelScope API
      if (this.apiKey && this.apiUrl) {
        await this.generateText('Hello', 'qwen-turbo'); // Use a cheaper model for health check
        return true;
      } else {
        // 如果没有配置 ModelScope，检查 DeepSeek
        return await this.deepSeekService.checkHealth();
      }
    } catch (error) {
      this.logger.error(`ModelScope health check failed: ${error.message}`);
      // 尝试 DeepSeek 作为备选
      try {
        return await this.deepSeekService.checkHealth();
      } catch (deepSeekError) {
        this.logger.error(`DeepSeek health check also failed: ${deepSeekError.message}`);
        return false;
      }
    }
  }

  async assessLexile(params: {
    knownWords: string[];
    unknownWords: string[];
    readingSpeed: number;
  }): Promise<{
    lexile: number;
    confidence: number;
    level: string;
    recommendation: string;
  }> {
    this.logger.log('Assessing Lexile using ModelScope/DeepSeek');

    const prompt = `
请根据以下信息评估学生的英语阅读水平（蓝斯值Lexile）：

已知词汇：${params.knownWords.join(', ')}
未知词汇：${params.unknownWords.join(', ')}
阅读速度：${params.readingSpeed} 词/分钟

请返回JSON格式的评估结果：
{
  "lexile": 数值,
  "confidence": 0.0-1.0,
  "level": "初级/KET/PET/自定义",
  "recommendation": "个性化建议"
}
    `;

    try {
      const result = await this.generateText(prompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error('Failed to assess lexile with ModelScope, using fallback', error);
    }

    // Fallback assessment
    const knownCount = params.knownWords.length;
    const unknownCount = params.unknownWords.length;
    const totalWords = knownCount + unknownCount;
    const knownRatio = totalWords > 0 ? knownCount / totalWords : 0;

    let lexile = 0;
    let level = '初级';

    if (knownRatio > 0.9) {
      lexile = 1200;
      level = 'PET';
    } else if (knownRatio > 0.7) {
      lexile = 800;
      level = 'KET';
    } else if (knownRatio > 0.5) {
      lexile = 600;
      level = '初级';
    } else {
      lexile = 400;
      level = '初级';
    }

    return {
      lexile,
      confidence: 0.8,
      level,
      recommendation: `基于词汇掌握率${(knownRatio * 100).toFixed(1)}%，推荐${level}级别的阅读材料`,
    };
  }
}
