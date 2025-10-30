# Prisma 数据库迁移文档

**版本**: 1.0
**日期**: 2025-10-25
**数据库**: PostgreSQL 16
**ORM**: Prisma 5.x

---

## 📋 目录

1. [数据库概览](#数据库概览)
2. [完整 Schema](#完整-schema)
3. [表结构详解](#表结构详解)
4. [关系说明](#关系说明)
5. [索引优化](#索引优化)
6. [迁移步骤](#迁移步骤)
7. [种子数据](#种子数据)

---

## 数据库概览

### 表分类

```
用户相关 (2表):
├─ User (用户表)
└─ UserLexileHistory (蓝斯值评估历史)

书籍相关 (4表):
├─ Book (书籍表)
├─ Chapter (章节表)
├─ ChapterContent (章节内容-多版本)
└─ ExtractedTopic (提取的话题)

听力相关 (2表):
├─ ListeningContent (听力内容)
└─ ListeningHistory (听力学习历史)

学习相关 (3表):
├─ Vocabulary (生词本)
├─ ReadingProgress (阅读进度)
└─ Bookmark (书签)

系统相关 (3表):
├─ ImportBatch (批量导入任务)
├─ AdminLog (管理员操作日志)
└─ SystemConfig (系统配置)
```

### ER 图概览

```
User 1──┬─→ N UserLexileHistory (蓝斯值历史)
        ├─→ N Vocabulary (生词本)
        ├─→ N ReadingProgress (阅读进度)
        ├─→ N ListeningHistory (听力历史)
        └─→ N Bookmark (书签)

Book 1──→ N Chapter (章节)

Chapter 1──┬─→ N ChapterContent (多版本内容)
           ├─→ N ReadingProgress (阅读进度)
           ├─→ N Bookmark (书签)
           └─→ N ExtractedTopic (提取话题)

ListeningContent 1──→ N ListeningHistory (听力历史)
```

---

## 完整 Schema

完整的 Prisma Schema 已保存在:
- **文件路径**: `/backend/prisma/schema.prisma`
- **总表数**: 14 张表
- **总字段数**: 约 200+ 字段

详见文件: `backend/prisma/schema.prisma`

---

## 表结构详解

### 1. User (用户表)

**用途**: 存储用户基本信息和蓝斯值数据

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 用户唯一ID | PK, CUID |
| email | String? | 邮箱 | UNIQUE |
| wechatId | String? | 微信 openid | UNIQUE |
| nickname | String? | 昵称 | - |
| avatar | String? | 头像URL | - |
| **lexileScore** | Float? | 当前蓝斯值 | 400-2000 |
| **lexileLevel** | String? | 难度档次 | 初级/KET/PET/自定义 |
| lexileUpdatedAt | DateTime? | 蓝斯值更新时间 | - |
| role | String | 角色 | Default: "student" |
| createdAt | DateTime | 创建时间 | Auto |
| updatedAt | DateTime | 更新时间 | Auto |

**索引**:
- `email` (UNIQUE)
- `wechatId` (UNIQUE)
- `lexileScore` (用于书籍推荐查询)

**关系**:
- 1:N → Vocabulary (生词本)
- 1:N → ReadingProgress (阅读进度)
- 1:N → ListeningHistory (听力历史)
- 1:N → UserLexileHistory (蓝斯值历史)
- 1:N → Bookmark (书签)

---

### 2. UserLexileHistory (蓝斯值评估历史)

**用途**: 记录用户的蓝斯值评估历史

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 记录ID | PK, CUID |
| userId | String | 用户ID | FK → User |
| assessmentMethod | String | 评估方式 | quick_select/manual/ai_assessment |
| minLexile | Float? | 最小蓝斯值 | - |
| maxLexile | Float? | 最大蓝斯值 | - |
| averageLexile | Float | 平均蓝斯值 | - |
| recommendedLevel | String | 推荐等级 | 初级/KET/PET/自定义 |
| inputContent | String? | 输入内容 (AI评估时) | TEXT |
| analysisResult | Json? | AI分析结果 | JSON |
| createdAt | DateTime | 创建时间 | Auto |

**索引**:
- `[userId, createdAt]` (查询用户历史)

**评估方式说明**:
- `quick_select`: 用户快速选择 (初级/KET/PET)
- `manual`: 用户手动输入精确蓝斯值
- `ai_assessment`: AI 根据用户上传的单词判定

---

### 3. Book (书籍表)

**用途**: 存储书籍基本信息

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 书籍ID | PK, CUID |
| title | String | 标题 | - |
| author | String? | 作者 | - |
| description | String? | 描述 | TEXT |
| coverUrl | String? | 封面URL | - |
| originalLexile | Float? | 原书蓝斯值 | - |
| lexileRange | String? | 蓝斯值范围 | 如 "800-1000L" |
| category | String? | 分类 | 小说/科普/传记等 |
| tags | String? | 标签 | JSON数组字符串 |
| recommendedAge | String? | 推荐年龄 | 如 "8-10岁" |
| status | String | 状态 | draft/processing/published/archived |
| publishedAt | DateTime? | 发布时间 | - |
| createdAt | DateTime | 创建时间 | Auto |
| updatedAt | DateTime | 更新时间 | Auto |

**索引**:
- `title` (搜索优化)
- `originalLexile` (难度筛选)
- `status` (状态查询)

**关系**:
- 1:N → Chapter (章节)

---

### 4. Chapter (章节表)

**用途**: 存储章节基本信息

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 章节ID | PK, CUID |
| bookId | String | 所属书籍 | FK → Book |
| sequenceNumber | Int | 章节序号 | - |
| title | String | 章节标题 | - |
| audioUrl | String? | TTS音频URL | - |
| audioGenerated | Boolean | 音频是否已生成 | Default: false |
| audioMetadata | Json? | 音频元数据 | JSON |
| status | String | 状态 | draft/processing/published |
| createdAt | DateTime | 创建时间 | Auto |
| updatedAt | DateTime | 更新时间 | Auto |

**索引**:
- `[bookId, sequenceNumber]` (UNIQUE - 确保同一本书章节序号唯一)
- `bookId` (查询书籍的所有章节)

**关系**:
- N:1 → Book (所属书籍)
- 1:N → ChapterContent (多版本内容)
- 1:N → ReadingProgress (阅读进度)
- 1:N → Bookmark (书签)
- 1:N → ExtractedTopic (提取的话题)

---

### 5. ChapterContent (章节内容表 - 多版本)

**用途**: 存储章节的多个难度版本内容

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 内容ID | PK, CUID |
| chapterId | String | 所属章节 | FK → Chapter |
| version | String | 版本类型 | original/easy/ket/pet/custom |
| content | String | 章节内容 (Markdown) | TEXT |
| wordCount | Int? | 字数 | - |
| sentenceCount | Int? | 句子数 | - |
| estimatedLexile | Float? | 估算蓝斯值 | - |
| estimatedReadingTime | Int? | 预估阅读时间 (分钟) | - |
| processedBy | String? | 处理方式 | manual/ai |
| processedAt | DateTime? | 处理时间 | - |
| processingLog | Json? | 处理日志 | JSON |
| createdAt | DateTime | 创建时间 | Auto |
| updatedAt | DateTime | 更新时间 | Auto |

**索引**:
- `[chapterId, version]` (UNIQUE - 确保同一章节每个版本唯一)
- `chapterId` (查询章节的所有版本)

**版本说明**:
- `original`: 原文 (未改写)
- `easy`: 初级版 (400-600L, 6-8岁)
- `ket`: KET版 (600-900L, 8-10岁)
- `pet`: PET版 (900-1200L, 10-12岁)
- `custom`: 自定义版本 (按用户精确蓝斯值动态生成)

---

### 6. ExtractedTopic (提取的话题表)

**用途**: 从章节内容中自动提取的话题

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 话题ID | PK, CUID |
| chapterId | String | 所属章节 | FK → Chapter |
| topicName | String | 话题名称 | - |
| description | String? | 话题描述 | TEXT |
| category | String | 话题分类 | 6大分类之一 |
| keywords | Json | 关键词列表 | JSON数组 |
| relatedListeningIds | Json? | 相关听力ID | JSON数组 |
| createdAt | DateTime | 创建时间 | Auto |

**索引**:
- `[chapterId, category]` (查询章节特定分类的话题)

**话题分类 (6大类)**:
1. 日常生活
2. 科技创新
3. 历史文化
4. 自然科学
5. 社会文化
6. 哲学思辨

---

### 7. ListeningContent (听力内容表)

**用途**: 存储听力训练材料

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 听力ID | PK, CUID |
| title | String | 标题 | - |
| description | String? | 描述 | TEXT |
| category | String | 话题分类 | 6大分类之一 |
| difficulty | String | 难度 | 初级/KET/PET/Advanced/Expert |
| lexileLevel | Float? | 蓝斯值水平 | - |
| contentType | String | 内容类型 | dialogue/narrative/discussion/interview |
| durationSeconds | Int | 音频时长 (秒) | - |
| audioUrl | String | 音频URL | - |
| transcript | String | 英文文本 | TEXT |
| translation | String? | 中文翻译 | TEXT |
| subtitles | Json? | 字幕数据 | JSON数组 |
| keywords | Json? | 关键词 | JSON数组 |
| **importBatchId** | String? | 导入批次ID | - |
| **importedFrom** | String? | 导入来源 | excel/csv/manual |
| **importedAt** | DateTime? | 导入时间 | - |
| **importedBy** | String? | 导入者ID | - |
| status | String | 状态 | draft/published/archived |
| publishedAt | DateTime? | 发布时间 | - |
| createdAt | DateTime | 创建时间 | Auto |
| updatedAt | DateTime | 更新时间 | Auto |

**索引**:
- `[category, difficulty]` (按分类和难度筛选)
- `importBatchId` (查询批量导入的记录)
- `status` (状态查询)

**字幕数据格式 (JSON)**:
```json
[
  {
    "startTime": 0,
    "endTime": 3,
    "english": "Good morning, how are you?",
    "chinese": "早上好,你好吗?"
  },
  {
    "startTime": 3,
    "endTime": 6,
    "english": "I'm fine, thank you!",
    "chinese": "我很好,谢谢!"
  }
]
```

---

### 8. ListeningHistory (听力学习历史)

**用途**: 记录用户的听力学习历史

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 记录ID | PK, CUID |
| userId | String | 用户ID | FK → User |
| listeningId | String | 听力ID | FK → ListeningContent |
| listeningTimeSeconds | Int | 听力时长 (秒) | - |
| completed | Boolean | 是否完成 | Default: false |
| completedAt | DateTime? | 完成时间 | - |
| playbackSpeed | Float | 播放速度 | Default: 1.0 |
| score | Int? | 成绩分数 | - |
| createdAt | DateTime | 创建时间 | Auto |
| updatedAt | DateTime | 更新时间 | Auto |

**索引**:
- `[userId, listeningId]` (UNIQUE - 确保用户对同一听力只有一条记录)
- `userId` (查询用户历史)
- `completedAt` (统计完成情况)

---

### 9. Vocabulary (生词本表)

**用途**: 存储用户收藏的生词

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 词汇ID | PK, CUID |
| userId | String | 用户ID | FK → User |
| word | String | 单词 | - |
| pronunciation | String? | 音标 | - |
| partOfSpeech | String? | 词性 | noun/verb/adjective等 |
| englishDefinition | String? | 英文释义 | TEXT |
| chineseTranslation | String | 中文翻译 | TEXT |
| exampleSentence | String? | 例句 | TEXT |
| exampleTranslation | String? | 例句翻译 | TEXT |
| synonyms | Json? | 同义词 | JSON数组 |
| antonyms | Json? | 反义词 | JSON数组 |
| lexileLevel | Float? | 单词蓝斯值 | - |
| sourceType | String? | 来源类型 | chapter/listening |
| sourceChapterId | String? | 来源章节ID | - |
| sourceListeningId | String? | 来源听力ID | - |
| mastered | Boolean | 是否已掌握 | Default: false |
| masteredAt | DateTime? | 掌握时间 | - |
| nextReviewAt | DateTime? | 下次复习时间 | - |
| reviewCount | Int | 复习次数 | Default: 0 |
| notes | String? | 用户笔记 | TEXT |
| createdAt | DateTime | 创建时间 | Auto |
| updatedAt | DateTime | 更新时间 | Auto |

**索引**:
- `[userId, word]` (查询用户特定单词)
- `[userId, mastered]` (筛选已掌握/未掌握)
- `nextReviewAt` (复习提醒)

---

### 10. ReadingProgress (阅读进度表)

**用途**: 记录用户的阅读进度

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 进度ID | PK, CUID |
| userId | String | 用户ID | FK → User |
| chapterId | String | 章节ID | FK → Chapter |
| currentPosition | Int | 当前位置 (字符偏移) | - |
| completionPercentage | Float | 完成百分比 | 0-100 |
| totalReadingSeconds | Int | 总阅读时长 (秒) | Default: 0 |
| currentVersion | String | 当前版本 | Default: "original" |
| wordsLearned | Int | 学到的单词数 | Default: 0 |
| lastReadAt | DateTime | 最后阅读时间 | Auto |
| createdAt | DateTime | 创建时间 | Auto |
| updatedAt | DateTime | 更新时间 | Auto |

**索引**:
- `[userId, chapterId]` (UNIQUE - 确保用户对同一章节只有一条进度)
- `userId` (查询用户进度)
- `lastReadAt` (最近阅读排序)

---

### 11. Bookmark (书签表)

**用途**: 存储用户的书签

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 书签ID | PK, CUID |
| userId | String | 用户ID | FK → User |
| chapterId | String | 章节ID | FK → Chapter |
| position | Int | 书签位置 (字符偏移) | - |
| note | String? | 书签备注 | TEXT |
| createdAt | DateTime | 创建时间 | Auto |

**索引**:
- `[userId, chapterId]` (查询用户在特定章节的书签)

---

### 12. ImportBatch (批量导入任务表)

**用途**: 记录批量导入任务的状态

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 任务ID | PK, CUID |
| importType | String | 导入类型 | listening/vocabulary/books |
| fileName | String | 文件名 | - |
| fileUrl | String? | 文件URL | - |
| fileSize | Int? | 文件大小 (字节) | - |
| totalRows | Int | 总行数 | - |
| successCount | Int | 成功数 | Default: 0 |
| failureCount | Int | 失败数 | Default: 0 |
| pendingCount | Int | 待处理数 | Default: 0 |
| progress | Float | 进度百分比 | 0-100 |
| status | String | 状态 | pending/processing/completed/failed |
| errors | Json? | 错误列表 | JSON数组 |
| importedBy | String | 导入者ID | - |
| startedAt | DateTime? | 开始时间 | - |
| completedAt | DateTime? | 完成时间 | - |
| createdAt | DateTime | 创建时间 | Auto |
| updatedAt | DateTime | 更新时间 | Auto |

**索引**:
- `status` (按状态查询)
- `importedBy` (查询导入者的任务)
- `createdAt` (时间排序)

---

### 13. AdminLog (管理员操作日志表)

**用途**: 记录管理员的所有操作

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 日志ID | PK, CUID |
| adminId | String | 管理员ID | - |
| adminName | String? | 管理员名称 | - |
| action | String | 操作类型 | create/update/delete/approve/reject等 |
| resource | String | 资源类型 | book/chapter/listening/user等 |
| resourceId | String? | 资源ID | - |
| details | Json? | 操作详情 | JSON |
| ipAddress | String? | IP地址 | - |
| userAgent | String? | User Agent | - |
| createdAt | DateTime | 操作时间 | Auto |

**索引**:
- `adminId` (查询管理员操作)
- `[action, resource]` (按操作类型查询)
- `createdAt` (时间排序)

---

### 14. SystemConfig (系统配置表)

**用途**: 存储系统配置

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | String | 配置ID | PK, CUID |
| key | String | 配置键 | UNIQUE |
| value | Json | 配置值 | JSON |
| description | String? | 配置说明 | TEXT |
| updatedAt | DateTime | 更新时间 | Auto |

**配置示例**:
```json
{
  "key": "ai_model_config",
  "value": {
    "provider": "deepseek",
    "model": "deepseek-chat",
    "apiKey": "sk-xxx",
    "temperature": 0.7,
    "maxTokens": 2000
  },
  "description": "AI 模型配置"
}
```

---

## 关系说明

### 用户相关关系

```prisma
User {
  vocabulary[]         // 1:N → Vocabulary
  readingProgress[]    // 1:N → ReadingProgress
  listeningHistory[]   // 1:N → ListeningHistory
  lexileAssessments[]  // 1:N → UserLexileHistory
  bookmarks[]          // 1:N → Bookmark
}
```

### 书籍相关关系

```prisma
Book {
  chapters[]  // 1:N → Chapter
}

Chapter {
  book             // N:1 → Book (onDelete: Cascade)
  chapterContents[] // 1:N → ChapterContent
  readingProgress[] // 1:N → ReadingProgress
  bookmarks[]      // 1:N → Bookmark
  extractedTopics[] // 1:N → ExtractedTopic
}

ChapterContent {
  chapter  // N:1 → Chapter (onDelete: Cascade)
}

ExtractedTopic {
  chapter  // N:1 → Chapter (onDelete: Cascade)
}
```

### 听力相关关系

```prisma
ListeningContent {
  listeningHistory[]  // 1:N → ListeningHistory
}

ListeningHistory {
  user      // N:1 → User (onDelete: Cascade)
  listening  // N:1 → ListeningContent (onDelete: Cascade)
}
```

### 级联删除策略

| 父表 | 子表 | 删除策略 |
|------|------|---------|
| User | Vocabulary, ReadingProgress, ListeningHistory, UserLexileHistory, Bookmark | Cascade (删除用户时删除所有学习数据) |
| Book | Chapter | Cascade (删除书籍时删除所有章节) |
| Chapter | ChapterContent, ReadingProgress, Bookmark, ExtractedTopic | Cascade (删除章节时删除所有内容) |
| ListeningContent | ListeningHistory | Cascade (删除听力时删除学习记录) |

---

## 索引优化

### 主要索引说明

**用户表索引**:
```prisma
@@index([email])        // 登录查询
@@index([wechatId])     // 微信登录
@@index([lexileScore])  // 书籍推荐查询
```

**书籍表索引**:
```prisma
@@index([title])         // 搜索优化
@@index([originalLexile]) // 难度筛选
@@index([status])        // 状态查询
```

**章节表索引**:
```prisma
@@unique([bookId, sequenceNumber])  // 确保章节序号唯一
@@index([bookId])                  // 查询书籍的所有章节
```

**章节内容表索引**:
```prisma
@@unique([chapterId, version])  // 确保版本唯一
@@index([chapterId])           // 查询章节的所有版本
```

**听力内容表索引**:
```prisma
@@index([category, difficulty])  // 分类筛选
@@index([importBatchId])        // 批量导入查询
@@index([status])               // 状态查询
```

**生词本表索引**:
```prisma
@@index([userId, word])      // 查询用户特定单词
@@index([userId, mastered])  // 筛选已掌握/未掌握
@@index([nextReviewAt])      // 复习提醒
```

**阅读进度表索引**:
```prisma
@@unique([userId, chapterId])  // 确保用户对同一章节只有一条进度
@@index([userId])             // 查询用户进度
@@index([lastReadAt])         // 最近阅读排序
```

**听力历史表索引**:
```prisma
@@unique([userId, listeningId])  // 确保用户对同一听力只有一条记录
@@index([userId])               // 查询用户历史
@@index([completedAt])          // 统计完成情况
```

---

## 迁移步骤

### 前提条件

确保已安装:
- Node.js 20+
- PostgreSQL 16
- npm 或 pnpm

### 步骤 1: 初始化 Prisma

```bash
cd /Users/zhangliang/Desktop/英语分级阅读/backend
npm install prisma @prisma/client --save-dev
npx prisma init
```

### 步骤 2: 配置数据库连接

编辑 `.env` 文件:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/english_reading?schema=public"
```

### 步骤 3: 复制 Schema 文件

将 `backend/prisma/schema.prisma` 文件确认无误。

### 步骤 4: 生成迁移文件

```bash
npx prisma migrate dev --name init
```

这将:
1. 创建迁移文件 (在 `prisma/migrations/` 目录)
2. 执行迁移 (创建所有表)
3. 生成 Prisma Client

### 步骤 5: 验证迁移

```bash
# 查看数据库状态
npx prisma migrate status

# 查看生成的表
npx prisma studio
```

### 步骤 6: 生成 Prisma Client

```bash
npx prisma generate
```

---

## 种子数据

### 创建种子脚本

创建文件: `backend/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. 创建系统配置
  await prisma.systemConfig.upsert({
    where: { key: 'ai_model_config' },
    update: {},
    create: {
      key: 'ai_model_config',
      value: {
        provider: 'deepseek',
        model: 'deepseek-chat',
        temperature: 0.7,
        maxTokens: 2000,
      },
      description: 'AI 模型配置',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'lexile_levels' },
    update: {},
    create: {
      key: 'lexile_levels',
      value: {
        easy: { min: 400, max: 600, label: '初级' },
        ket: { min: 600, max: 900, label: 'KET' },
        pet: { min: 900, max: 1200, label: 'PET' },
      },
      description: '蓝斯值等级定义',
    },
  });

  // 2. 创建测试用户
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      nickname: '测试用户',
      lexileScore: 750,
      lexileLevel: 'KET',
      role: 'student',
    },
  });

  console.log('测试用户已创建:', testUser.id);

  // 3. 创建测试书籍
  const testBook = await prisma.book.create({
    data: {
      title: 'Harry Potter and the Philosopher\'s Stone',
      author: 'J.K. Rowling',
      description: '一个关于魔法学校的冒险故事',
      originalLexile: 880,
      lexileRange: '800-1000L',
      category: '小说',
      recommendedAge: '8-12岁',
      status: 'published',
      publishedAt: new Date(),
    },
  });

  console.log('测试书籍已创建:', testBook.id);

  // 4. 创建测试章节
  const testChapter = await prisma.chapter.create({
    data: {
      bookId: testBook.id,
      sequenceNumber: 1,
      title: 'The Boy Who Lived',
      status: 'published',
    },
  });

  console.log('测试章节已创建:', testChapter.id);

  // 5. 创建章节内容 (原文版本)
  await prisma.chapterContent.create({
    data: {
      chapterId: testChapter.id,
      version: 'original',
      content: `
# Chapter 1: The Boy Who Lived

Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.

Mr. Dursley was the director of a firm called Grunnings, which made drills. He was a big, beefy man with hardly any neck, although he did have a very large mustache. Mrs. Dursley was thin and blonde and had nearly twice the usual amount of neck, which came in very useful as she spent so much of her time craning over garden fences, spying on the neighbors.
      `.trim(),
      wordCount: 120,
      sentenceCount: 5,
      estimatedLexile: 880,
      estimatedReadingTime: 2,
      processedBy: 'manual',
      processedAt: new Date(),
    },
  });

  console.log('章节内容已创建 (原文版本)');

  // 6. 创建测试听力内容
  const testListening = await prisma.listeningContent.create({
    data: {
      title: '早上的问候',
      description: '学习日常问候语',
      category: '日常生活',
      difficulty: '初级',
      lexileLevel: 500,
      contentType: 'dialogue',
      durationSeconds: 30,
      audioUrl: 'https://example.com/audio/greeting.mp3',
      transcript: 'Good morning! How are you? I\'m fine, thank you!',
      translation: '早上好!你好吗?我很好,谢谢!',
      subtitles: [
        {
          startTime: 0,
          endTime: 2,
          english: 'Good morning!',
          chinese: '早上好!',
        },
        {
          startTime: 2,
          endTime: 5,
          english: 'How are you?',
          chinese: '你好吗?',
        },
        {
          startTime: 5,
          endTime: 8,
          english: 'I\'m fine, thank you!',
          chinese: '我很好,谢谢!',
        },
      ],
      keywords: ['greeting', 'morning', 'fine'],
      status: 'published',
      publishedAt: new Date(),
    },
  });

  console.log('测试听力内容已创建:', testListening.id);

  console.log('\n✅ 种子数据创建完成!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 执行种子脚本

在 `package.json` 中添加:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

执行:
```bash
npx prisma db seed
```

---

## 常用 Prisma 命令

```bash
# 创建新迁移
npx prisma migrate dev --name <migration_name>

# 重置数据库 (删除所有数据)
npx prisma migrate reset

# 查看迁移状态
npx prisma migrate status

# 部署迁移到生产环境
npx prisma migrate deploy

# 生成 Prisma Client
npx prisma generate

# 打开 Prisma Studio (数据库管理界面)
npx prisma studio

# 格式化 schema 文件
npx prisma format

# 验证 schema 文件
npx prisma validate

# 查看数据库差异
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma
```

---

## 下一步

1. **执行迁移**: 按照上述步骤执行数据库迁移
2. **运行种子数据**: 创建测试数据
3. **验证数据库**: 使用 Prisma Studio 查看表结构
4. **开始开发**: 在 NestJS 中集成 Prisma Client

**相关文档**:
- [API 规范](./API-规范.md)
- [环境配置](./环境配置.md)
- [项目初始化清单](./项目初始化清单.md)

---

**文档维护者**: 后端开发团队
**最后更新**: 2025-10-25
**版本**: 1.0
