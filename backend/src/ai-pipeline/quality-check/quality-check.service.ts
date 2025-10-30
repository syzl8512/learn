import { Injectable, Logger } from '@nestjs/common';

export interface QualityCheckOptions {
  content: string;
  chapterTitle: string;
  bookId: string;
}

export interface QualityCheckResult {
  passed: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

@Injectable()
export class QualityCheckService {
  private readonly logger = new Logger(QualityCheckService.name);

  /**
   * 检查内容质量
   */
  async checkContent(options: QualityCheckOptions): Promise<QualityCheckResult> {
    this.logger.log(`开始质量检查: ${options.chapterTitle}`);

    try {
      const { content, chapterTitle } = options;
      const issues: string[] = [];
      const suggestions: string[] = [];
      let score = 100;

      // 基本质量检查
      if (!content || content.trim().length === 0) {
        issues.push('内容为空');
        score -= 50;
      }

      if (content.length < 100) {
        issues.push('内容过短');
        score -= 20;
        suggestions.push('建议增加更多内容');
      }

      if (!chapterTitle || chapterTitle.trim().length === 0) {
        issues.push('章节标题为空');
        score -= 10;
      }

      // 检查是否有基本的英文内容
      const englishWords = content.match(/\b[a-zA-Z]+\b/g);
      if (!englishWords || englishWords.length < 10) {
        issues.push('英文内容不足');
        score -= 30;
        suggestions.push('建议增加更多英文内容');
      }

      // 检查格式问题
      if (content.includes('  ')) {
        issues.push('存在多余空格');
        score -= 5;
      }

      if (content.includes('\n\n\n')) {
        issues.push('存在多余空行');
        score -= 5;
      }

      const passed = score >= 60;
      
      this.logger.log(`质量检查完成，得分: ${score}, 通过: ${passed}`);

      return {
        passed,
        score,
        issues,
        suggestions,
      };
    } catch (error) {
      this.logger.error(`质量检查失败: ${error.message}`, error.stack);
      return {
        passed: false,
        score: 0,
        issues: ['质量检查过程出错'],
        suggestions: ['请检查内容格式'],
      };
    }
  }
}
