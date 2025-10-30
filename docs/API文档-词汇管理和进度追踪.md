# 词汇管理和学习进度追踪 API 文档

## 概述

本文档描述了英语分级阅读平台的词汇管理和学习进度追踪功能的完整API接口。这些接口支持生词本管理、学习进度跟踪、数据导出和统计分析等功能。

## 认证

所有API都需要JWT认证，请求头需要包含：
```
Authorization: Bearer <your-jwt-token>
```

## 词汇管理 API (Vocabulary Management)

### 1. 添加生词
```http
POST /api/vocabulary
Content-Type: application/json

{
  "word": "abandon",
  "pronunciation": "/əˈbændən/",
  "partOfSpeech": "verb",
  "englishDefinition": "to give up completely",
  "chineseTranslation": "放弃，抛弃",
  "exampleSentence": "We had to abandon the car and walk.",
  "exampleTranslation": "我们不得不弃车步行。",
  "synonyms": ["desert", "forsake"],
  "antonyms": ["keep", "maintain"],
  "lexileLevel": 800,
  "sourceType": "chapter",
  "sourceChapterId": "chapter-123",
  "notes": "常用动词"
}
```

**响应示例：**
```json
{
  "id": "vocab-123",
  "userId": "user-456",
  "word": "abandon",
  "pronunciation": "/əˈbændən/",
  "partOfSpeech": "verb",
  "englishDefinition": "to give up completely",
  "chineseTranslation": "放弃，抛弃",
  "exampleSentence": "We had to abandon the car and walk.",
  "exampleTranslation": "我们不得不弃车步行。",
  "synonyms": ["desert", "forsake"],
  "antonyms": ["keep", "maintain"],
  "lexileLevel": 800,
  "sourceType": "chapter",
  "sourceChapterId": "chapter-123",
  "notes": "常用动词",
  "mastered": false,
  "reviewCount": 0,
  "nextReviewAt": "2025-10-27T10:00:00.000Z",
  "createdAt": "2025-10-26T10:00:00.000Z",
  "updatedAt": "2025-10-26T10:00:00.000Z"
}
```

### 2. 获取生词列表（支持搜索筛选）
```http
GET /api/vocabulary?search=abandon&partOfSpeech=verb&mastered=false&page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

**查询参数：**
- `search`: 搜索关键词（匹配单词或中文翻译）
- `partOfSpeech`: 词性筛选（noun, verb, adjective, adverb, etc.）
- `sourceType`: 来源类型（chapter, listening）
- `mastered`: 掌握状态筛选（true, false）
- `startDate`: 开始日期（ISO 8601格式）
- `endDate`: 结束日期（ISO 8601格式）
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20，最大100）
- `sortBy`: 排序字段（createdAt, updatedAt, word, masteredAt, nextReviewAt, reviewCount）
- `sortOrder`: 排序方向（asc, desc）

**响应示例：**
```json
{
  "data": [
    {
      "id": "vocab-123",
      "word": "abandon",
      "chineseTranslation": "放弃，抛弃",
      "partOfSpeech": "verb",
      "mastered": false,
      "reviewCount": 0,
      "nextReviewAt": "2025-10-27T10:00:00.000Z",
      "createdAt": "2025-10-26T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 3. 获取生词详情
```http
GET /api/vocabulary/{id}
```

### 4. 更新生词
```http
PATCH /api/vocabulary/{id}
Content-Type: application/json

{
  "chineseTranslation": "放弃，抛弃；遗弃",
  "mastered": true,
  "notes": "已经掌握的常用动词"
}
```

### 5. 删除生词
```http
DELETE /api/vocabulary/{id}
```

### 6. 获取复习列表
```http
GET /api/vocabulary/review?limit=10
```

返回需要复习的生词（基于艾宾浩斯遗忘曲线）

### 7. 标记复习完成
```http
POST /api/vocabulary/{id}/review
```

### 8. 获取词汇统计
```http
GET /api/vocabulary/stats
```

**响应示例：**
```json
{
  "total": 100,
  "mastered": 60,
  "unmastered": 40,
  "masteryRate": "60.00",
  "byPartOfSpeech": [
    { "partOfSpeech": "noun", "count": 50 },
    { "partOfSpeech": "verb", "count": 30 },
    { "partOfSpeech": "adjective", "count": 20 }
  ],
  "bySourceType": [
    { "sourceType": "chapter", "count": 70 },
    { "sourceType": "listening", "count": 30 }
  ],
  "dailyStats": {
    "2025-10-26": 5,
    "2025-10-25": 3,
    "2025-10-24": 8
  }
}
```

### 9. 导出CSV格式
```http
GET /api/vocabulary/export/csv?mastered=false&startDate=2025-10-01
```

返回CSV文件，包含完整的生词本信息，支持筛选条件。

### 10. 导出Anki格式
```http
GET /api/vocabulary/export/anki?sourceType=chapter
```

返回Anki格式的文本文件，可直接导入Anki学习软件。

**Anki格式说明：**
- 字段分隔：制表符
- 字段顺序：单词 | 释义 | 例句 | 音标 | 备注
- 自动转义特殊字符

## 学习进度管理 API (Progress Management)

### 1. 保存章节阅读进度
```http
POST /api/progress/chapters/{chapterId}
Content-Type: application/json

{
  "currentPosition": 1500,
  "completionPercentage": 25.5,
  "totalReadingSeconds": 600,
  "currentVersion": "easy",
  "wordsLearned": 8
}
```

### 2. 获取章节阅读进度
```http
GET /api/progress/chapters/{chapterId}
```

**响应示例：**
```json
{
  "id": "progress-123",
  "userId": "user-456",
  "chapterId": "chapter-789",
  "currentPosition": 1500,
  "completionPercentage": 25.5,
  "totalReadingSeconds": 600,
  "currentVersion": "easy",
  "wordsLearned": 8,
  "lastReadAt": "2025-10-26T15:30:00.000Z",
  "chapter": {
    "id": "chapter-789",
    "title": "第一章：初遇",
    "sequenceNumber": 1,
    "book": {
      "id": "book-456",
      "title": "神奇树屋"
    }
  }
}
```

### 3. 获取所有阅读进度
```http
GET /api/progress?limit=10
```

### 4. 创建书签
```http
POST /api/progress/bookmarks/{chapterId}
Content-Type: application/json

{
  "position": 1500,
  "note": "重要段落，描述了主角的初次相遇"
}
```

### 5. 删除书签
```http
DELETE /api/progress/bookmarks/{bookmarkId}
```

### 6. 获取书签列表
```http
GET /api/progress/bookmarks?chapterId=chapter-123
```

## 统计分析 API (Statistics & Analytics)

### 1. 获取学习仪表板
```http
GET /api/stats/dashboard
```

**响应示例：**
```json
{
  "vocabulary": {
    "total": 150,
    "mastered": 90,
    "unmastered": 60,
    "needsReview": 15,
    "masteryRate": "60.00",
    "byPartOfSpeech": [
      { "partOfSpeech": "noun", "count": 75 },
      { "partOfSpeech": "verb", "count": 45 },
      { "partOfSpeech": "adjective", "count": 30 }
    ]
  },
  "reading": {
    "totalProgress": 25,
    "totalReadingMinutes": 180,
    "totalReadingHours": "3.00",
    "completedChapters": 15,
    "weeklyStats": [
      { "week": "2025-10-20", "totalMinutes": 45 },
      { "week": "2025-10-27", "totalMinutes": 60 }
    ]
  },
  "bookmarks": {
    "total": 35,
    "recentCount": 8,
    "topBooks": [
      {
        "chapterId": "chapter-1",
        "chapterTitle": "第一章",
        "bookTitle": "神奇树屋",
        "count": 5
      }
    ]
  },
  "heatmap": [
    {
      "date": "2025-10-26",
      "vocabularyCount": 5,
      "readingMinutes": 30
    },
    {
      "date": "2025-10-25",
      "vocabularyCount": 3,
      "readingMinutes": 45
    }
  ],
  "recentVocabulary": [
    {
      "word": "adventure",
      "partOfSpeech": "noun",
      "date": "2025-10-26"
    }
  ],
  "recentReading": [
    {
      "chapterTitle": "第一章：初遇",
      "bookTitle": "神奇树屋",
      "completionPercentage": 25.5,
      "readingMinutes": 20,
      "date": "2025-10-26"
    }
  ]
}
```

### 2. 获取详细学习报告
```http
GET /api/stats/detailed-report?startDate=2025-10-01&endDate=2025-10-31
```

### 3. 获取学习热力图
```http
GET /api/stats/heatmap
```

返回最近30天的学习活动热力图数据。

### 4. 获取最近新增词汇
```http
GET /api/stats/recent-vocabulary
```

### 5. 获取最近阅读记录
```http
GET /api/stats/recent-reading
```

## 错误处理

### 常见错误码

| 状态码 | 错误类型 | 说明 |
|--------|----------|------|
| 400 | Bad Request | 请求参数错误，如单词已存在 |
| 401 | Unauthorized | 未提供有效JWT token |
| 404 | Not Found | 请求的资源不存在 |
| 422 | Unprocessable Entity | 参数验证失败 |
| 500 | Internal Server Error | 服务器内部错误 |

### 错误响应格式
```json
{
  "statusCode": 400,
  "message": "该单词已存在于生词本中",
  "error": "Bad Request",
  "timestamp": "2025-10-26T10:00:00.000Z",
  "path": "/api/vocabulary"
}
```

## 使用示例

### 完整的生词学习流程

```javascript
// 1. 添加新单词
const response = await fetch('/api/vocabulary', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    word: 'magnificent',
    chineseTranslation: '壮丽的，宏伟的',
    englishDefinition: 'extremely beautiful or impressive',
    partOfSpeech: 'adjective',
    exampleSentence: 'The view from the mountain was magnificent.',
    exampleTranslation: '从山上看到的景色非常壮观。'
  })
});

const newVocab = await response.json();

// 2. 查看生词列表
const listResponse = await fetch('/api/vocabulary?page=1&limit=20', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const vocabList = await listResponse.json();

// 3. 标记复习
await fetch(`/api/vocabulary/${newVocab.id}/review`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

// 4. 标记为已掌握
await fetch(`/api/vocabulary/${newVocab.id}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    mastered: true,
    notes: '已经熟练掌握'
  })
});
```

### 阅读进度记录流程

```javascript
// 1. 保存阅读进度
const progressResponse = await fetch('/api/progress/chapters/chapter-123', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    currentPosition: 2500,
    completionPercentage: 45.0,
    totalReadingSeconds: 900,
    currentVersion: 'easy',
    wordsLearned: 12
  })
});

// 2. 添加书签
await fetch('/api/progress/bookmarks/chapter-123', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    position: 1800,
    note: '重要对话，描述了角色的内心想法'
  })
});
```

### 数据导出流程

```javascript
// 导出CSV格式
const csvResponse = await fetch('/api/vocabulary/export/csv?mastered=false', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const blob = await csvResponse.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `vocabulary_${new Date().toISOString().split('T')[0]}.csv`;
a.click();

// 导出Anki格式
const ankiResponse = await fetch('/api/vocabulary/export/anki', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

// 类似的下载流程...
```

### 学习统计查看

```javascript
// 获取仪表板统计
const dashboardResponse = await fetch('/api/stats/dashboard', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const stats = await dashboardResponse.json();

console.log(`总共学习了 ${stats.vocabulary.total} 个单词`);
console.log(`掌握率: ${stats.vocabulary.masteryRate}%`);
console.log(`总阅读时间: ${stats.reading.totalReadingMinutes} 分钟`);

// 获取热力图数据
const heatmapResponse = await fetch('/api/stats/heatmap', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const heatmapData = await heatmapResponse.json();

// 绘制热力图
heatmapData.forEach(day => {
  console.log(`${day.date}: 新增${day.vocabularyCount}词，阅读${day.readingMinutes}分钟`);
});
```

## 性能优化建议

1. **分页查询**: 使用 `page` 和 `limit` 参数避免一次性加载大量数据
2. **筛选条件**: 使用适当的筛选条件减少数据传输量
3. **缓存策略**: 对不常变化的数据（如统计信息）进行客户端缓存
4. **批量操作**: 避免频繁的单条数据操作
5. **字段选择**: 通过查询参数只请求需要的字段（如果API支持）

## 版本信息

- **当前版本**: v1.0.0
- **API基础路径**: `/api`
- **最后更新**: 2025-10-26

## 支持与反馈

如有问题或建议，请联系开发团队或查看项目文档：
- 项目地址: `/docs/API-规范.md`
- 技术讨论: `/discuss/` 目录下的相关文档
- 问题反馈: GitHub Issues