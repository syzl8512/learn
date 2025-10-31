// 词典管理相关类型定义
export interface Word {
  id: string;
  headWord: string;
  wordRank: number;
  examType: string;
  content: WordContent;
  createdAt: Date;
  updatedAt: Date;
}

export interface WordContent {
  word: {
    usphone: string;
    ukphone: string;
    trans: Translation[];
    sentence: Sentence;
    syno: Synonyms;
    phrase: Phrases;
    relWord: RelatedWords;
    exam: string[];
  };
}

export interface Translation {
  [key: string]: string[];
}

export interface Sentence {
  sent: string;
  orig: string;
  trans: string;
}

export interface Synonyms {
  [key: string]: {
    pos: string;
    tran: string;
    hwds: {
      hwd: string;
    }[];
  }[];
}

export interface Phrases {
  [key: string]: {
    pContent: string;
    pCn: string;
  }[];
}

export interface RelatedWords {
  [key: string]: {
    relWords: {
      desc: string;
      words: {
        hwd: string;
      }[];
    }[];
  }[];
}

export interface DictionarySearchOptions {
  keyword?: string;
  examType?: string;
  difficulty?: string;
  sortBy?: 'wordRank' | 'headWord' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DictionaryStats {
  totalWords: number;
  cet4Count: number;
  cet6Count: number;
  toeflCount: number;
  ieltsCount: number;
  greCount: number;
  recentAdded: number;
  todayUpdated: number;
}

export interface TranslationRequest {
  text: string;
  sourceLang?: 'en' | 'zh';
  targetLang?: 'zh' | 'en';
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  pronunciation?: string;
  definitions?: string[];
  examples?: string[];
}

export interface VocabularyBatch {
  id: string;
  name: string;
  description: string;
  examType: string;
  wordCount: number;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface WordImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  failedCount?: number;
  errors?: string[];
}