import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout: number;
}

export interface LexileAssessmentRequest {
  text: string;
  knownWords?: string[];
  unknownWords?: string[];
  language?: 'zh' | 'en';
}

export interface LexileAssessmentResult {
  lexile: number;
  confidence: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'proficient';
  recommendation: string;
  reasoning: string;
}

@Injectable()
export class DeepSeekService {
  private readonly logger = new Logger(DeepSeekService.name);
  private readonly config: DeepSeekConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get<string>('DEEPSEEK_API_KEY') || '',
      baseUrl: this.configService.get<string>('DEEPSEEK_API_URL', 'https://api.deepseek.com'),
      model: this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat'),
      timeout: this.configService.get<number>('DEEPSEEK_TIMEOUT', 60000),
    };

    this.logger.log(`DeepSeek 服务初始化: ${this.config.baseUrl}`);
  }

  /**
   * 生成文本
   */
  async generateText(
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    } = {},
  ): Promise<string> {
    try {
      const { maxTokens = 1000, temperature = 0.7, model = this.config.model } = options;

      this.logger.log(`调用 DeepSeek API: ${prompt.substring(0, 50)}...`);

      const response = await axios.post(
        `${this.config.baseUrl}/v1/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: maxTokens,
          temperature: temperature,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.config.timeout,
        },
      );

      if (response.status === 200 && response.data.choices?.[0]?.message?.content) {
        const content = response.data.choices[0].message.content;
        this.logger.log(`DeepSeek API 响应成功: ${content.substring(0, 100)}...`);
        return content;
      } else {
        throw new Error('DeepSeek API 响应格式异常');
      }
    } catch (error) {
      this.logger.error('DeepSeek API 调用失败', error);
      throw new Error(`DeepSeek API 调用失败: ${error.message}`);
    }
  }

  /**
   * Lexile 阅读水平评估
   */
  async assessLexileLevel(request: LexileAssessmentRequest): Promise<LexileAssessmentResult> {
    try {
      const { text, knownWords = [], unknownWords = [], language = 'en' } = request;

      let prompt: string;

      if (knownWords.length > 0 || unknownWords.length > 0) {
        // 基于词汇知识的评估
        prompt = `你是一个专业的 Lexile 阅读水平评估专家。

基于用户的词汇知识：
- 已掌握词汇: ${knownWords.join(', ')}
- 未掌握词汇: ${unknownWords.join(', ')}

请评估用户的 Lexile 阅读水平（200-1700L）。

请直接返回 JSON 格式（不要使用 markdown）：
{
  "lexile": <数字>,
  "confidence": <0-1之间的数字>,
  "level": "beginner|intermediate|advanced|proficient",
  "recommendation": "<中文建议>",
  "reasoning": "<评估理由>"
}`;
      } else {
        // 基于文本内容的评估
        prompt = `请评估以下${language === 'en' ? '英文' : '中文'}文本的 Lexile 阅读难度：

文本: "${text}"

请直接返回 JSON 格式：
{
  "lexile": <200-1700之间的数字>,
  "confidence": <0-1之间的数字>,
  "level": "beginner|intermediate|advanced|proficient",
  "recommendation": "<中文建议>",
  "reasoning": "<评估理由>"
}`;
      }

      const aiResponse = await this.generateText(prompt, {
        maxTokens: 500,
        temperature: 0.7,
      });

      // 解析 AI 响应
      const result = this.parseLexileResponse(aiResponse);

      this.logger.log(`Lexile 评估完成: ${result.lexile}L (${result.level})`);
      return result;
    } catch (error) {
      this.logger.error('Lexile 评估失败', error);
      throw new Error(`Lexile 评估失败: ${error.message}`);
    }
  }

  /**
   * 解析 Lexile 评估响应
   */
  private parseLexileResponse(response: string): LexileAssessmentResult {
    try {
      // 清理响应文本
      let jsonText = response.trim();

      // 移除 markdown 代码块
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // 解析 JSON
      const parsed = JSON.parse(jsonText);

      // 验证和标准化结果
      const result: LexileAssessmentResult = {
        lexile: Math.max(200, Math.min(1700, parseInt(parsed.lexile) || 700)),
        confidence: Math.max(0, Math.min(1, parseFloat(parsed.confidence) || 0.8)),
        level: this.normalizeLevel(parsed.level),
        recommendation: parsed.recommendation || '建议继续阅读适合当前水平的书籍',
        reasoning: parsed.reasoning || '基于词汇和语法复杂度评估',
      };

      return result;
    } catch (error) {
      this.logger.warn('解析 Lexile 响应失败，使用默认值', error);

      // 返回默认结果
      return {
        lexile: 700,
        confidence: 0.5,
        level: 'intermediate',
        recommendation: '建议继续阅读适合当前水平的书籍',
        reasoning: 'AI 响应解析失败，使用默认评估',
      };
    }
  }

  /**
   * 标准化等级
   */
  private normalizeLevel(level: string): 'beginner' | 'intermediate' | 'advanced' | 'proficient' {
    const normalized = level?.toLowerCase() || 'intermediate';

    if (normalized.includes('beginner') || normalized.includes('初级')) {
      return 'beginner';
    } else if (normalized.includes('advanced') || normalized.includes('高级')) {
      return 'advanced';
    } else if (normalized.includes('proficient') || normalized.includes('专家')) {
      return 'proficient';
    } else {
      return 'intermediate';
    }
  }

  /**
   * 健康检查
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.generateText('Hello', {
        maxTokens: 10,
        temperature: 0.1,
      });
      return response.length > 0;
    } catch (error) {
      this.logger.error('DeepSeek 健康检查失败', error);
      return false;
    }
  }

  /**
   * 获取配置信息（用于调试）
   */
  getConfig(): Partial<DeepSeekConfig> {
    return {
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      timeout: this.config.timeout,
      // 不返回 API Key
    };
  }
}
