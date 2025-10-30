export interface HeatmapData {
  date: string;
  count: number;
  minutes: number;
}

export interface VocabularyStats {
  total: number;
  mastered: number;
  unmastered: number;
  needsReview: number;
  masteryRate: string;
  byPartOfSpeech: Array<{
    partOfSpeech: string | null;
    count: number;
  }>;
}

export interface ReadingStats {
  totalProgress: number;
  totalReadingMinutes: number;
  totalReadingHours: string;
  completedChapters: number;
  weeklyStats: Array<{
    week: string;
    minutes: number;
  }>;
}

export interface BookmarkStats {
  total: number;
  recent: number;
  byBook: Array<{
    bookId: string;
    bookTitle: string;
    count: number;
  }>;
}

export interface DashboardStats {
  vocabulary: VocabularyStats;
  reading: ReadingStats;
  bookmarks: BookmarkStats;
  recentVocabulary: Array<{
    id: string;
    word: string;
    createdAt: Date;
  }>;
  recentReading: Array<{
    id: string;
    bookTitle: string;
    chapterTitle: string;
    updatedAt: Date;
  }>;
  heatmap: HeatmapData[];
  lastUpdated: string;
}