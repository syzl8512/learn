import { ApiProperty } from '@nestjs/swagger';

export class ReadingStatsDto {
  @ApiProperty({ description: '总阅读时间（分钟）', example: 1200 })
  totalReadingTime: number;

  @ApiProperty({ description: '总阅读单词数', example: 50000 })
  totalWordsRead: number;

  @ApiProperty({ description: '平均阅读速度（词/分钟）', example: 200 })
  averageReadingSpeed: number;

  @ApiProperty({ description: '完成的书籍数量', example: 3 })
  booksCompleted: number;

  @ApiProperty({ description: '阅读的章节数', example: 15 })
  chaptersRead: number;

  @ApiProperty({ description: '学习的词汇数', example: 150 })
  vocabularyLearned: number;

  @ApiProperty({ description: '连续阅读天数', example: 7 })
  readingStreak: number;

  @ApiProperty({ description: '最后阅读日期', example: '2025-10-28T10:00:00Z' })
  lastReadingDate: Date;
}

export class ReadingProgressDto {
  @ApiProperty({ description: '日期', example: '2025-10-28' })
  date: string;

  @ApiProperty({ description: '阅读时间（分钟）', example: 45 })
  readingTime: number;

  @ApiProperty({ description: '阅读单词数', example: 2000 })
  wordsRead: number;

  @ApiProperty({ description: '完成章节数', example: 1 })
  chaptersCompleted: number;

  @ApiProperty({ description: '新增词汇数', example: 5 })
  vocabularyAdded: number;
}

export class VocabularyStatsDto {
  @ApiProperty({ description: '总词汇数', example: 150 })
  totalVocabulary: number;

  @ApiProperty({ description: '已掌握词汇数', example: 80 })
  masteredVocabulary: number;

  @ApiProperty({ description: '学习中词汇数', example: 50 })
  learningVocabulary: number;

  @ApiProperty({ description: '新词汇数', example: 20 })
  newVocabulary: number;

  @ApiProperty({ description: '复习次数', example: 300 })
  reviewCount: number;

  @ApiProperty({ description: '准确率', example: 85.5 })
  accuracyRate: number;

  @ApiProperty({ 
    description: '难度分布',
    example: { easy: 80, intermediate: 50, advanced: 15, expert: 5 }
  })
  difficultyDistribution: {
    easy: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
}

export class LearningInsightsDto {
  @ApiProperty({ 
    description: '学习优势',
    example: ['保持良好的阅读习惯', '词汇掌握准确率较高']
  })
  strengths: string[];

  @ApiProperty({ 
    description: '学习弱点',
    example: ['阅读速度有待提升']
  })
  weaknesses: string[];

  @ApiProperty({ 
    description: '学习建议',
    example: ['建议每天保持至少15分钟的阅读时间', '建议增加词汇复习频率']
  })
  recommendations: string[];

  @ApiProperty({ 
    description: '下一步目标',
    example: ['目标：连续阅读10天', '目标：词汇准确率达到90%']
  })
  nextGoals: string[];

  @ApiProperty({ 
    description: '进步趋势',
    enum: ['improving', 'stable', 'declining'],
    example: 'improving'
  })
  progressTrend: 'improving' | 'stable' | 'declining';
}

export class WeeklyReportDto {
  @ApiProperty({ description: '周数', example: '2025-10-21 至 2025-10-28' })
  week: string;

  @ApiProperty({ description: '周阅读时间（分钟）', example: 300 })
  readingTime: number;

  @ApiProperty({ description: '周阅读单词数', example: 12000 })
  wordsRead: number;

  @ApiProperty({ description: '周学习词汇数', example: 25 })
  vocabularyLearned: number;

  @ApiProperty({ description: '书籍进度', example: 0.5 })
  booksProgress: number;

  @ApiProperty({ 
    description: '成就',
    example: ['阅读达人', '词汇收集家']
  })
  achievements: string[];

  @ApiProperty({ description: '学习洞察', type: LearningInsightsDto })
  insights: LearningInsightsDto;
}

export class MonthlyReportDto {
  @ApiProperty({ description: '月份', example: '2025-10-01 至 2025-10-31' })
  month: string;

  @ApiProperty({ description: '月总阅读时间（分钟）', example: 1200 })
  totalReadingTime: number;

  @ApiProperty({ description: '月总阅读单词数', example: 50000 })
  totalWordsRead: number;

  @ApiProperty({ description: '词汇进步', example: 80 })
  vocabularyProgress: number;

  @ApiProperty({ description: '完成书籍数', example: 2 })
  booksCompleted: number;

  @ApiProperty({ description: '阅读连续天数', example: 15 })
  readingStreak: number;

  @ApiProperty({ 
    description: '热门分类',
    example: ['小说', '科技', '历史']
  })
  topCategories: string[];

  @ApiProperty({ description: '学习洞察', type: LearningInsightsDto })
  insights: LearningInsightsDto;
}

export class DashboardSummaryDto {
  @ApiProperty({ description: '总阅读时间（分钟）', example: 1200 })
  totalReadingTime: number;

  @ApiProperty({ description: '总阅读单词数', example: 50000 })
  totalWordsRead: number;

  @ApiProperty({ description: '学习词汇数', example: 150 })
  vocabularyLearned: number;

  @ApiProperty({ description: '连续阅读天数', example: 7 })
  readingStreak: number;

  @ApiProperty({ description: '完成书籍数', example: 3 })
  booksCompleted: number;

  @ApiProperty({ description: '平均阅读速度（词/分钟）', example: 200 })
  averageReadingSpeed: number;

  @ApiProperty({ description: '准确率', example: 85.5 })
  accuracyRate: number;

  @ApiProperty({ 
    description: '进步趋势',
    enum: ['improving', 'stable', 'declining'],
    example: 'improving'
  })
  progressTrend: 'improving' | 'stable' | 'declining';
}

export class DashboardDto {
  @ApiProperty({ description: '阅读统计', type: ReadingStatsDto })
  readingStats: ReadingStatsDto;

  @ApiProperty({ description: '词汇统计', type: VocabularyStatsDto })
  vocabularyStats: VocabularyStatsDto;

  @ApiProperty({ description: '阅读进度', type: [ReadingProgressDto] })
  readingProgress: ReadingProgressDto[];

  @ApiProperty({ description: '学习洞察', type: LearningInsightsDto })
  insights: LearningInsightsDto;

  @ApiProperty({ description: '仪表板摘要', type: DashboardSummaryDto })
  summary: DashboardSummaryDto;
}
