import { Injectable, Logger } from '@nestjs/common';
import { DeepSeekService } from '../deepseek/deepseek.service';

export interface ChapterSplitOptions {
  bookId: string;
  title: string;
}

export interface Chapter {
  title: string;
  content: string;
  sequenceNumber: number;
}

export interface BookInfo {
  title: string;
  author?: string;
  description?: string;
  category?: string;
  originalLexile?: number;
  recommendedAge?: string;
  tags?: string[];
  coverUrl?: string;
}

@Injectable()
export class ChapterSplitterService {
  private readonly logger = new Logger(ChapterSplitterService.name);

  constructor(private readonly deepSeekService: DeepSeekService) {}

  /**
   * 将Markdown内容分割为章节
   */
  async splitIntoChapters(
    markdownContent: string,
    options: ChapterSplitOptions,
  ): Promise<Chapter[]> {
    this.logger.log(`开始分割章节: ${options.title}`);

    try {
      // 简单的章节分割逻辑
      const chapters: Chapter[] = [];
      const lines = markdownContent.split('\n');
      let currentChapter: Chapter | null = null;
      let chapterNumber = 1;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // 检测章节标题（以#开头）
        if (trimmedLine.startsWith('# ')) {
          // 保存前一章节
          if (currentChapter) {
            chapters.push(currentChapter);
          }
          
          // 开始新章节
          currentChapter = {
            title: trimmedLine.substring(2).trim(),
            content: trimmedLine + '\n',
            sequenceNumber: chapterNumber++,
          };
        } else if (currentChapter) {
          // 添加内容到当前章节
          currentChapter.content += line + '\n';
        }
      }

      // 添加最后一个章节
      if (currentChapter) {
        chapters.push(currentChapter);
      }

      // 如果没有找到章节，创建默认章节
      if (chapters.length === 0) {
        chapters.push({
          title: 'Chapter 1',
          content: markdownContent,
          sequenceNumber: 1,
        });
      }

      this.logger.log(`章节分割完成，共 ${chapters.length} 个章节`);
      return chapters;
    } catch (error) {
      this.logger.error(`章节分割失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 从Markdown内容中提取书籍信息
   */
  async extractBookInfo(markdownContent: string, originalTitle: string): Promise<BookInfo> {
    try {
      this.logger.log(`开始从内容中提取书籍信息: ${originalTitle}`);

      // 提取前1000个字符作为样本进行分析
      const sampleContent = markdownContent.substring(0, 1000);

      const prompt = `你是一个专业的图书信息提取专家。请分析以下文本内容，提取书籍的基本信息：

文本样本："${sampleContent}"

请直接返回 JSON 格式（不要使用 markdown）：
{
  "title": "书籍标题",
  "author": "作者姓名（如果有）",
  "description": "书籍简介（50-100字）",
  "category": "书籍分类（如：小说、科普、传记等）",
  "originalLexile": 蓝斯值（如果没有则为null）,
  "recommendedAge": "推荐年龄（如：6-8岁、9-12岁等）",
  "tags": ["标签1", "标签2", "标签3"]
}

注意：如果信息不明确，请合理推测。`;

      const aiResponse = await this.deepSeekService.generateText(prompt, {
        maxTokens: 800,
        temperature: 0.3,
      });

      // 解析 AI 响应
      const bookInfo = this.parseBookInfoResponse(aiResponse, originalTitle);

      this.logger.log(`书籍信息提取完成: ${bookInfo.title} - ${bookInfo.author}`);
      return bookInfo;
    } catch (error) {
      this.logger.warn(`书籍信息提取失败，使用默认信息: ${error.message}`);

      // 返回默认信息
      return {
        title: originalTitle,
        author: '未知作者',
        description: '暂无描述',
        category: '未分类',
        tags: ['英文阅读'],
      };
    }
  }

  /**
   * 解析书籍信息响应
   */
  private parseBookInfoResponse(response: string, originalTitle: string): BookInfo {
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
      const bookInfo: BookInfo = {
        title: parsed.title || originalTitle,
        author: parsed.author || '未知作者',
        description: parsed.description || '暂无描述',
        category: parsed.category || '未分类',
        originalLexile: parsed.originalLexile || undefined,
        recommendedAge: parsed.recommendedAge || undefined,
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['英文阅读'],
      };

      return bookInfo;
    } catch (error) {
      this.logger.warn('解析书籍信息响应失败，使用默认值', error);

      // 返回默认信息
      return {
        title: originalTitle,
        author: '未知作者',
        description: '暂无描述',
        category: '未分类',
        tags: ['英文阅读'],
      };
    }
  }
}
