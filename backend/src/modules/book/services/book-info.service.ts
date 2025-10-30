import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

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
export class BookInfoService {
  private readonly logger = new Logger(BookInfoService.name);

  /**
   * 根据书名获取书籍信息
   */
  async getBookInfo(title: string): Promise<BookInfo> {
    try {
      this.logger.log(`正在获取书籍信息: ${title}`);

      // 尝试多个数据源
      const sources = [
        () => this.getFromGoogleBooks(title),
        () => this.getFromOpenLibrary(title),
        () => this.getFromGoodreads(title),
      ];

      for (const source of sources) {
        try {
          const info = await source();
          if (info && info.title) {
            this.logger.log(`成功获取书籍信息: ${info.title}`);
            return info;
          }
        } catch (error) {
          this.logger.warn(`数据源获取失败: ${error.message}`);
        }
      }

      // 如果所有数据源都失败，返回基本信息
      return {
        title,
        author: '未知作者',
        description: '暂无描述',
        category: '未分类',
      };
    } catch (error) {
      this.logger.error(`获取书籍信息失败: ${error.message}`);
      return {
        title,
        author: '未知作者',
        description: '暂无描述',
        category: '未分类',
      };
    }
  }

  /**
   * 从 Google Books API 获取信息
   */
  private async getFromGoogleBooks(title: string): Promise<BookInfo | null> {
    try {
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: `intitle:${title}`,
          maxResults: 1,
        },
        timeout: 10000,
      });

      const items = response.data.items;
      if (!items || items.length === 0) {
        return null;
      }

      const book = items[0].volumeInfo;
      return {
        title: book.title || title,
        author: book.authors?.[0],
        description: book.description,
        category: book.categories?.[0],
        originalLexile: this.extractLexileFromDescription(book.description),
        recommendedAge: this.getRecommendedAge(book.maturityRating),
        tags: book.categories || [],
        coverUrl: book.imageLinks?.thumbnail,
      };
    } catch (error) {
      this.logger.warn(`Google Books API 失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 从 Open Library API 获取信息
   */
  private async getFromOpenLibrary(title: string): Promise<BookInfo | null> {
    try {
      const response = await axios.get('https://openlibrary.org/search.json', {
        params: {
          title: title,
          limit: 1,
        },
        timeout: 10000,
      });

      const docs = response.data.docs;
      if (!docs || docs.length === 0) {
        return null;
      }

      const book = docs[0];
      return {
        title: book.title || title,
        author: book.author_name?.[0],
        description: book.first_sentence?.[0],
        category: book.subject?.[0],
        originalLexile: this.extractLexileFromDescription(book.first_sentence?.[0]),
        tags: book.subject || [],
      };
    } catch (error) {
      this.logger.warn(`Open Library API 失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 从 Goodreads API 获取信息（需要 API 密钥）
   */
  private async getFromGoodreads(title: string): Promise<BookInfo | null> {
    // 这里需要 Goodreads API 密钥
    // 暂时返回 null，可以后续添加
    return null;
  }

  /**
   * 从描述中提取蓝思值
   */
  private extractLexileFromDescription(description?: string): number | undefined {
    if (!description) return undefined;

    const lexileMatch = description.match(/(\d+)\s*L/i);
    if (lexileMatch) {
      return parseInt(lexileMatch[1]);
    }

    // 尝试其他格式
    const lexileMatch2 = description.match(/lexile[:\s]*(\d+)/i);
    if (lexileMatch2) {
      return parseInt(lexileMatch2[1]);
    }

    return undefined;
  }

  /**
   * 根据成熟度评级获取推荐年龄
   */
  private getRecommendedAge(maturityRating?: string): string | undefined {
    if (!maturityRating) return undefined;

    const ageMap: { [key: string]: string } = {
      'NOT_MATURE': '0-12岁',
      'MATURE': '13-17岁',
      'ADULT': '18岁以上',
    };

    return ageMap[maturityRating];
  }

  /**
   * 根据蓝思值获取难度等级
   */
  getDifficultyFromLexile(lexile?: number): string {
    if (!lexile) return '初级';

    if (lexile < 300) return '初级';
    if (lexile < 500) return 'KET';
    if (lexile < 800) return 'PET';
    if (lexile < 1200) return 'Advanced';
    return 'Expert';
  }

  /**
   * 根据分类获取标签
   */
  getTagsFromCategory(category?: string): string[] {
    if (!category) return [];

    const categoryMap: { [key: string]: string[] } = {
      'Fiction': ['小说', '文学'],
      'Nonfiction': ['非小说', '纪实'],
      'Science Fiction': ['科幻', '未来'],
      'Fantasy': ['奇幻', '魔法'],
      'Mystery': ['悬疑', '推理'],
      'Romance': ['爱情', '浪漫'],
      'Biography': ['传记', '人物'],
      'History': ['历史', '过去'],
      'Science': ['科学', '知识'],
      'Technology': ['技术', '科技'],
    };

    return categoryMap[category] || [category];
  }
}
