import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * 词义查询结果接口
 */
export interface WordDefinition {
  word: string;
  pronunciation?: string;
  partOfSpeech?: string;
  englishDefinition?: string;
  chineseTranslation: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  synonyms?: string[];
  antonyms?: string[];
  lexileLevel?: number;
}

/**
 * 词典服务
 * 支持多种词典API：有道、百度翻译等
 * 实现缓存机制以减少API调用
 */
@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);
  private readonly cache = new Map<string, WordDefinition>();
  private readonly cacheExpireMs = 7 * 24 * 60 * 60 * 1000; // 缓存 7 天

  constructor(private readonly configService: ConfigService) {}

  /**
   * 查询单词释义（带缓存）
   */
  async lookupWord(word: string): Promise<WordDefinition> {
    const normalizedWord = word.toLowerCase().trim();

    // 检查缓存
    const cached = this.cache.get(normalizedWord);
    if (cached) {
      this.logger.log(`从缓存中获取单词释义: ${normalizedWord}`);
      return cached;
    }

    // 调用词典API查询
    this.logger.log(`调用词典API查询: ${normalizedWord}`);
    const definition = await this.fetchFromDictionary(normalizedWord);

    // 存入缓存
    this.cache.set(normalizedWord, definition);

    // 设置缓存过期（简单实现）
    setTimeout(() => {
      this.cache.delete(normalizedWord);
      this.logger.debug(`缓存过期并清除: ${normalizedWord}`);
    }, this.cacheExpireMs);

    return definition;
  }

  /**
   * 从词典API获取单词释义
   *
   * 优先级：
   * 1. 有道词典API
   * 2. 百度翻译API
   * 3. 本地词库（简单翻译）
   */
  private async fetchFromDictionary(word: string): Promise<WordDefinition> {
    try {
      // 尝试使用有道词典API
      const youdaoAppKey = this.configService.get<string>('YOUDAO_APP_KEY');
      const youdaoAppSecret = this.configService.get<string>('YOUDAO_APP_SECRET');

      if (youdaoAppKey && youdaoAppSecret) {
        return await this.fetchFromYoudao(word, youdaoAppKey, youdaoAppSecret);
      }

      // 如果没有配置有道，尝试百度翻译
      const baiduAppId = this.configService.get<string>('BAIDU_TRANSLATE_APP_ID');
      const baiduAppKey = this.configService.get<string>('BAIDU_TRANSLATE_APP_KEY');

      if (baiduAppId && baiduAppKey) {
        return await this.fetchFromBaidu(word, baiduAppId, baiduAppKey);
      }

      // 如果都没有配置，返回基础翻译（使用本地词库或简单处理）
      this.logger.warn('未配置词典API，返回基础翻译');
      return this.getBasicTranslation(word);
    } catch (error) {
      this.logger.error(`查询单词失败: ${error.message}`, error.stack);

      // 降级处理：返回基础信息
      return this.getBasicTranslation(word);
    }
  }

  /**
   * 使用有道词典API查询
   */
  private async fetchFromYoudao(
    word: string,
    appKey: string,
    appSecret: string,
  ): Promise<WordDefinition> {
    const salt = Date.now().toString();
    const sign = this.generateYoudaoSign(appKey, word, salt, appSecret);

    const response = await axios.get('https://openapi.youdao.com/api', {
      params: {
        q: word,
        from: 'en',
        to: 'zh-CHS',
        appKey,
        salt,
        sign,
        signType: 'v3',
      },
      timeout: 5000,
    });

    if (response.data.errorCode !== '0') {
      throw new Error(`有道API错误: ${response.data.errorCode}`);
    }

    const data = response.data;
    const basic = data.basic || {};
    const webTranslation = data.web?.[0]?.value || [];

    return {
      word,
      pronunciation: basic.phonetic ? `/${basic.phonetic}/` : undefined,
      partOfSpeech: undefined, // 有道不直接提供词性
      englishDefinition: basic['us-phonetic'] || basic['uk-phonetic'] || undefined,
      chineseTranslation: data.translation?.[0] || webTranslation[0] || word,
      exampleSentence: data.web?.[1]?.key || undefined,
      exampleTranslation: data.web?.[1]?.value?.[0] || undefined,
      synonyms: undefined,
      antonyms: undefined,
    };
  }

  /**
   * 使用百度翻译API查询
   */
  private async fetchFromBaidu(
    word: string,
    appId: string,
    appKey: string,
  ): Promise<WordDefinition> {
    const salt = Date.now().toString();
    const sign = this.generateBaiduSign(appId, word, salt, appKey);

    const response = await axios.get('https://fanyi-api.baidu.com/api/trans/vip/translate', {
      params: {
        q: word,
        from: 'en',
        to: 'zh',
        appid: appId,
        salt,
        sign,
      },
      timeout: 5000,
    });

    if (response.data.error_code) {
      throw new Error(`百度翻译API错误: ${response.data.error_code}`);
    }

    const translation = response.data.trans_result?.[0]?.dst || word;

    return {
      word,
      pronunciation: undefined,
      partOfSpeech: undefined,
      englishDefinition: undefined,
      chineseTranslation: translation,
      exampleSentence: undefined,
      exampleTranslation: undefined,
      synonyms: undefined,
      antonyms: undefined,
    };
  }

  /**
   * 基础翻译（降级方案）
   */
  private getBasicTranslation(word: string): WordDefinition {
    return {
      word,
      pronunciation: undefined,
      partOfSpeech: undefined,
      englishDefinition: undefined,
      chineseTranslation: `【待翻译】${word}`,
      exampleSentence: undefined,
      exampleTranslation: undefined,
      synonyms: undefined,
      antonyms: undefined,
    };
  }

  /**
   * 生成有道API签名
   */
  private generateYoudaoSign(
    appKey: string,
    query: string,
    salt: string,
    appSecret: string,
  ): string {
    const crypto = require('crypto');
    const str = appKey + query + salt + appSecret;
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * 生成百度翻译API签名
   */
  private generateBaiduSign(appId: string, query: string, salt: string, appKey: string): string {
    const crypto = require('crypto');
    const str = appId + query + salt + appKey;
    return crypto.createHash('md5').update(str).digest('hex');
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.cache.clear();
    this.logger.log('词典缓存已清空');
  }

  /**
   * 获取缓存大小
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}
