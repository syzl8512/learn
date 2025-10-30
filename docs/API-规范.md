# API 规范文档

**版本**: 1.0
**日期**: 2025-10-25
**框架**: NestJS 10.x + Swagger/OpenAPI
**环境**: PostgreSQL 16 + Redis + DeepSeek API

---

## 📋 目录

1. [认证接口](#认证接口)
2. [用户接口](#用户接口)
3. [书籍接口](#书籍接口)
4. [章节接口](#章节接口)
5. [蓝斯值接口](#蓝斯值接口)
6. [听力内容接口](#听力内容接口)
7. [词汇接口](#词汇接口)
8. [学习进度接口](#学习进度接口)
9. [后台管理接口](#后台管理接口)
10. [错误处理](#错误处理)

---

## 认证接口

### 1. 微信登录 (Get Access Token)

**请求**:
```http
POST /api/auth/wechat-login
Content-Type: application/json

{
  "code": "string",              // 微信授权code
  "rawData": "string",           // 微信用户原始数据
  "signature": "string"          // 数据签名
}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token",
    "expiresIn": 604800,
    "user": {
      "id": "user_123",
      "nickName": "用户昵称",
      "avatar": "https://...",
      "lexileScore": 750,
      "lexileLevel": "KET",
      "createdAt": "2025-10-25T10:00:00Z"
    }
  },
  "message": "登录成功"
}
```

**错误处理**:
```json
{
  "code": 401,
  "message": "微信授权失败",
  "error": "WECHAT_AUTH_FAILED"
}
```

---

### 2. 刷新Token

**请求**:
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "string"
}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "accessToken": "new_jwt_token",
    "expiresIn": 604800
  }
}
```

---

### 3. 登出

**请求**:
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "message": "登出成功"
}
```

---

## 用户接口

### 1. 获取用户信息

**请求**:
```http
GET /api/users/me
Authorization: Bearer {accessToken}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "id": "user_123",
    "nickName": "用户昵称",
    "avatar": "https://...",
    "email": "user@example.com",
    "lexileScore": 750,
    "lexileLevel": "KET",
    "assessmentMethod": "manual",
    "createdAt": "2025-10-25T10:00:00Z"
  }
}
```

---

### 2. 更新用户蓝斯值

**请求**:
```http
PATCH /api/users/me/lexile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "lexileScore": 800,              // 蓝斯值 (float)
  "lexileLevel": "PET",            // 初级/KET/PET/自定义
  "assessmentMethod": "manual"     // manual/ai/uploaded_words
}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "lexileScore": 800,
    "lexileLevel": "PET",
    "assessmentMethod": "manual",
    "updatedAt": "2025-10-25T10:30:00Z"
  }
}
```

---

## 书籍接口

### 1. 列表书籍

**请求**:
```http
GET /api/books?page=1&limit=20&search=harry&sortBy=createdAt&order=desc
Authorization: Bearer {accessToken}
```

**查询参数**:
- `page`: number (默认1)
- `limit`: number (默认20, 最大100)
- `search`: string (按书名/作者搜索)
- `sortBy`: string (createdAt/title/publishedAt)
- `order`: asc|desc

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "book_001",
        "title": "Harry Potter",
        "author": "J.K. Rowling",
        "cover": "https://...",
        "description": "魔法学校冒险故事",
        "originalLexile": 800,
        "chapters": [
          {
            "id": "ch_001",
            "title": "Chapter 1",
            "sequence": 1
          }
        ],
        "createdAt": "2025-10-25T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

### 2. 获取书籍详情

**请求**:
```http
GET /api/books/{bookId}
Authorization: Bearer {accessToken}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "id": "book_001",
    "title": "Harry Potter",
    "author": "J.K. Rowling",
    "cover": "https://...",
    "description": "魔法学校冒险故事",
    "originalLexile": 800,
    "chapters": [
      {
        "id": "ch_001",
        "title": "Chapter 1",
        "sequence": 1,
        "estimatedLexile": 750,
        "adaptedVersions": ["easy", "ket", "pet", "custom"]
      }
    ],
    "topics": ["日常生活", "魔法与冒险"],
    "createdAt": "2025-10-25T10:00:00Z"
  }
}
```

---

### 3. 上传PDF & 创建书籍

**请求**:
```http
POST /api/books/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [PDF文件]
title: "Harry Potter"
author: "J.K. Rowling"
description: "魔法学校冒险故事"
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "id": "book_001",
    "title": "Harry Potter",
    "status": "processing",
    "message": "PDF正在转换为Markdown，预计5分钟完成"
  }
}
```

**异步完成后**:
- WebSocket 通知: `book:ch_001:adapted`
- 查询书籍详情时会看到新增的chapters

---

## 蓝斯值接口

### 1. 快速蓝斯值选择

**请求**:
```http
POST /api/lexile/quick-select
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "quickLevel": "KET"  // 初级/KET/PET
}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "lexileScore": 750,
    "lexileRange": [600, 900],
    "lexileLevel": "KET",
    "message": "已设置为 KET 等级 (600-900L)"
  }
}
```

---

### 2. AI判定蓝斯值 (基于单词)

**请求**:
```http
POST /api/lexile/ai-assessment
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "words": ["apple", "dog", "computer", "mechanism", "ephemeral"],
  "languageLevel": "beginner"  // optional: beginner/intermediate/advanced
}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "minLexile": 650,
    "maxLexile": 850,
    "averageLexile": 750,
    "recommendedLevel": "KET (600-900L)",
    "assessment": {
      "easyWords": 2,
      "mediumWords": 2,
      "hardWords": 1
    },
    "message": "基于已掌握单词，推荐 KET 等级"
  }
}
```

---

### 3. 获取蓝斯值评估历史

**请求**:
```http
GET /api/lexile/assessments?limit=10
Authorization: Bearer {accessToken}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": [
    {
      "id": "assess_001",
      "method": "ai",
      "minLexile": 650,
      "maxLexile": 850,
      "recommendedLevel": "KET",
      "createdAt": "2025-10-25T10:00:00Z"
    }
  ]
}
```

---

## 章节接口

### 1. 获取章节内容 (含多版本)

**请求**:
```http
GET /api/chapters/{chapterId}?version=ket
Authorization: Bearer {accessToken}
```

**查询参数**:
- `version`: original|easy|ket|pet|custom (默认根据用户lexileLevel选择)

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "id": "ch_001",
    "title": "Chapter 1",
    "bookId": "book_001",
    "sequence": 1,
    "currentVersion": "ket",
    "availableVersions": ["original", "easy", "ket", "pet"],
    "content": "The boy walked into the castle...",
    "contentMetadata": {
      "wordCount": 1250,
      "sentenceCount": 35,
      "estimatedLexile": 750,
      "estimatedReadingTime": "5 minutes"
    },
    "audioUrl": "https://oss.../ch_001_ket.mp3",
    "topics": ["魔法", "冒险"],
    "createdAt": "2025-10-25T10:00:00Z"
  }
}
```

---

### 2. 切换章节版本

**请求**:
```http
PATCH /api/chapters/{chapterId}/switch-version
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "version": "easy"  // original|easy|ket|pet|custom
}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "id": "ch_001",
    "currentVersion": "easy",
    "content": "The boy went to the magic house..."
  }
}
```

---

### 3. 查询单词释义

**请求**:
```http
GET /api/chapters/{chapterId}/word-lookup?word=ephemeral
Authorization: Bearer {accessToken}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "word": "ephemeral",
    "pronunciation": "ɪˈfɛm(ə)rəl",
    "partOfSpeech": "adjective",
    "englishDefinition": "lasting for a very short time",
    "chineseTranslation": "短暂的；昙花一现的",
    "examples": [
      {
        "sentence": "The beauty of cherry blossoms is ephemeral.",
        "translation": "樱花的美丽是短暂的。"
      }
    ],
    "synonyms": ["transient", "fleeting", "momentary"],
    "lexile": 1250
  }
}
```

---

### 4. 保存学习进度

**请求**:
```http
POST /api/chapters/{chapterId}/progress
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "lastReadPosition": 1250,        // 读到的字符位置
  "readingTimeSeconds": 300,       // 本次阅读时长
  "wordsLearned": 5,               // 本次学到的词数
  "currentVersion": "ket"
}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "chapterId": "ch_001",
    "lastReadPosition": 1250,
    "lastReadAt": "2025-10-25T10:30:00Z",
    "totalReadingTime": 1800,
    "totalWordsLearned": 12
  }
}
```

---

## 听力内容接口

### 1. 列表听力内容

**请求**:
```http
GET /api/listening?topic=日常生活&level=KET&page=1&limit=20
Authorization: Bearer {accessToken}
```

**查询参数**:
- `topic`: string (日常生活|科技创新|历史文化|自然科学|社会文化|哲学思辨)
- `level`: string (初级|KET|PET|自定义)
- `page`: number
- `limit`: number
- `sortBy`: string (createdAt/duration/difficulty)

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "listening_001",
        "title": "早上的问候",
        "topic": "日常生活",
        "level": "初级",
        "duration": 120,
        "contentType": "dialogue",
        "audioUrl": "https://oss.../listening_001.mp3",
        "transcript": "Good morning, how are you?",
        "translation": "早上好，你好吗？",
        "thumbnail": "https://...",
        "createdAt": "2025-10-25T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20
    }
  }
}
```

---

### 2. 获取听力详情

**请求**:
```http
GET /api/listening/{listeningId}
Authorization: Bearer {accessToken}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "id": "listening_001",
    "title": "早上的问候",
    "topic": "日常生活",
    "level": "初级",
    "duration": 120,
    "contentType": "dialogue",
    "audioUrl": "https://oss.../listening_001.mp3",
    "transcript": "Good morning, how are you? I'm fine, thank you!",
    "translation": "早上好，你好吗？我很好，谢谢！",
    "sentences": [
      {
        "id": "sent_001",
        "startTime": 0,
        "endTime": 3,
        "english": "Good morning, how are you?",
        "chinese": "早上好，你好吗？"
      },
      {
        "id": "sent_002",
        "startTime": 3,
        "endTime": 6,
        "english": "I'm fine, thank you!",
        "chinese": "我很好，谢谢！"
      }
    ],
    "keywords": ["greeting", "morning", "morning"],
    "listeningHistory": {
      "completed": false,
      "listenCount": 2,
      "lastListenAt": "2025-10-25T10:00:00Z"
    }
  }
}
```

---

### 3. 批量导入听力内容 (Excel/CSV)

**请求**:
```http
POST /api/listening/batch-import
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [Excel/CSV文件]
skipValidation: false  // optional, 跳过某些验证规则
```

**Excel 字段要求**:
```
话题 | 难度 | 标题 | 时长(秒) | 音频URL | 文本内容 | 中文翻译 | 内容类型
```

**响应** (202 Accepted - 异步处理):
```json
{
  "code": 0,
  "data": {
    "importId": "import_batch_001",
    "totalRows": 150,
    "status": "processing",
    "message": "正在处理，预计2分钟完成",
    "progressUrl": "/api/listening/batch-import/import_batch_001/progress"
  }
}
```

---

### 4. 查询批导入进度

**请求**:
```http
GET /api/listening/batch-import/{importId}/progress
Authorization: Bearer {accessToken}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "importId": "import_batch_001",
    "status": "processing",
    "totalRows": 150,
    "successCount": 120,
    "failureCount": 5,
    "pendingCount": 25,
    "progress": 80,
    "errors": [
      {
        "rowNumber": 10,
        "error": "音频URL无效",
        "title": "听力标题"
      }
    ],
    "completedAt": null
  }
}
```

---

### 5. 保存听力历史

**请求**:
```http
POST /api/listening/{listeningId}/history
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "listeningTimeSeconds": 120,  // 本次听力时长
  "completed": true,            // 是否完成
  "playbackSpeed": 1.0          // 播放速度
}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "listeningId": "listening_001",
    "listenCount": 3,
    "totalListeningTime": 360,
    "completed": true,
    "completedAt": "2025-10-25T10:30:00Z"
  }
}
```

---

## 词汇接口

### 1. 添加生词

**请求**:
```http
POST /api/vocabulary
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "word": "ephemeral",
  "meaning": "lasting for a very short time",
  "chineseTranslation": "短暂的",
  "pronunciation": "ɪˈfɛm(ə)rəl",
  "lexile": 1250,
  "sourceChapterId": "ch_001",  // optional
  "sourceListeningId": "listening_001"  // optional
}
```

**响应** (201 Created):
```json
{
  "code": 0,
  "data": {
    "id": "vocab_001",
    "word": "ephemeral",
    "meaning": "lasting for a very short time",
    "chineseTranslation": "短暂的",
    "mastered": false,
    "addedAt": "2025-10-25T10:00:00Z"
  }
}
```

---

### 2. 获取生词本

**请求**:
```http
GET /api/vocabulary?page=1&limit=20&sortBy=addedAt&order=desc&mastered=false
Authorization: Bearer {accessToken}
```

**查询参数**:
- `page`: number
- `limit`: number
- `sortBy`: addedAt|word|lexile
- `order`: asc|desc
- `mastered`: boolean (只显示未掌握的词)

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "vocab_001",
        "word": "ephemeral",
        "meaning": "lasting for a very short time",
        "chineseTranslation": "短暂的",
        "pronunciation": "ɪˈfɛm(ə)rəl",
        "lexile": 1250,
        "mastered": false,
        "addedAt": "2025-10-25T10:00:00Z",
        "nextReviewAt": "2025-10-28T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 20
    },
    "statistics": {
      "totalWords": 120,
      "masteredWords": 45,
      "newWords": 75
    }
  }
}
```

---

### 3. 标记词汇为已掌握

**请求**:
```http
PATCH /api/vocabulary/{vocabId}/master
Authorization: Bearer {accessToken}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "id": "vocab_001",
    "mastered": true,
    "masteredAt": "2025-10-25T10:30:00Z"
  }
}
```

---

### 4. 导出生词本 (Anki/CSV)

**请求**:
```http
GET /api/vocabulary/export?format=anki&mastered=false
Authorization: Bearer {accessToken}
```

**查询参数**:
- `format`: anki|csv|json
- `mastered`: boolean (可选)

**响应**:
- `format=anki`: .apkg 文件下载
- `format=csv`: CSV 文件下载
- `format=json`: JSON 格式返回

---

## 学习进度接口

### 1. 获取学习仪表板

**请求**:
```http
GET /api/dashboard
Authorization: Bearer {accessToken}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "statistics": {
      "totalReadingTime": 3600,        // 总阅读时长 (秒)
      "weekReadingTime": 900,          // 本周阅读时长
      "booksRead": 5,                  // 已读书籍数
      "chaptersCompleted": 25,         // 已完成章节数
      "wordsLearned": 120,             // 掌握词数
      "newWordsThisWeek": 30,          // 本周新词数
      "listeningCompleted": 15         // 已完成听力数
    },
    "weeklyHeatmap": [
      {
        "date": "2025-10-20",
        "count": 2,
        "level": "low"
      },
      {
        "date": "2025-10-21",
        "count": 5,
        "level": "high"
      }
    ],
    "recentActivity": [
      {
        "type": "read_chapter",
        "title": "Chapter 1",
        "timestamp": "2025-10-25T10:00:00Z"
      },
      {
        "type": "learn_word",
        "word": "ephemeral",
        "timestamp": "2025-10-25T09:30:00Z"
      }
    ],
    "achievements": [
      {
        "id": "ach_001",
        "title": "初学者",
        "description": "完成第一本书",
        "unlockedAt": "2025-10-25T10:00:00Z"
      }
    ]
  }
}
```

---

### 2. 获取学习统计 (日/周/月)

**请求**:
```http
GET /api/statistics?period=week&metric=reading_time
Authorization: Bearer {accessToken}
```

**查询参数**:
- `period`: day|week|month|year
- `metric`: reading_time|vocabulary|listening

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "period": "week",
    "metric": "reading_time",
    "data": [
      {
        "date": "2025-10-20",
        "value": 600,
        "unit": "seconds"
      },
      {
        "date": "2025-10-21",
        "value": 1200,
        "unit": "seconds"
      }
    ],
    "total": 4800,
    "average": 685.7
  }
}
```

---

## 后台管理接口

### 1. 审核已适配章节

**请求**:
```http
GET /api/admin/chapters/review?status=pending&page=1
Authorization: Bearer {accessToken}
X-Admin-Role: content_reviewer
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "ch_001",
        "bookTitle": "Harry Potter",
        "title": "Chapter 1",
        "status": "pending",
        "adaptedVersions": ["easy", "ket", "pet"],
        "submittedAt": "2025-10-25T10:00:00Z",
        "adaptedBy": "AI"
      }
    ]
  }
}
```

---

### 2. 批准/拒绝章节

**请求**:
```http
PATCH /api/admin/chapters/{chapterId}/review
Authorization: Bearer {accessToken}
X-Admin-Role: content_reviewer
Content-Type: application/json

{
  "status": "approved",  // approved|rejected
  "comment": "质量很好",
  "versions": ["easy", "ket", "pet"]  // 批准的版本
}
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "id": "ch_001",
    "status": "approved",
    "reviewedAt": "2025-10-25T10:30:00Z",
    "reviewedBy": "admin_123"
  }
}
```

---

### 3. 批导入监控

**请求**:
```http
GET /api/admin/listening/imports?status=completed&page=1
Authorization: Bearer {accessToken}
X-Admin-Role: admin
```

**响应** (200 OK):
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "importId": "import_batch_001",
        "status": "completed",
        "totalRows": 150,
        "successCount": 145,
        "failureCount": 5,
        "importedAt": "2025-10-25T09:00:00Z",
        "importedBy": "user_123"
      }
    ]
  }
}
```

---

## 错误处理

### 统一错误响应格式

```json
{
  "code": 400,
  "message": "请求参数错误",
  "error": "VALIDATION_ERROR",
  "timestamp": "2025-10-25T10:00:00Z",
  "details": [
    {
      "field": "lexileScore",
      "message": "蓝斯值必须在 400-2000 之间"
    }
  ]
}
```

### 常见错误码

| 错误码 | 含义 | 处理方案 |
|--------|------|---------|
| 400 | 请求参数错误 | 检查请求体/查询参数 |
| 401 | 未授权 (无token或token过期) | 重新登录/刷新token |
| 403 | 禁止访问 (权限不足) | 检查用户角色 |
| 404 | 资源不存在 | 检查ID是否正确 |
| 409 | 冲突 (如重复导入) | 检查唯一性约束 |
| 422 | 业务逻辑错误 | 按具体错误信息处理 |
| 429 | 请求过于频繁 | 降低请求频率 |
| 500 | 服务器错误 | 联系技术支持 |
| 503 | 服务暂时不可用 | 稍后重试 |

---

## Swagger UI

启动后访问: `http://localhost:3000/api`

---

**版本历史**:
- v1.0 (2025-10-25): 初始版本，包含所有核心接口

**维护者**: 后端开发团队
**最后更新**: 2025-10-25
