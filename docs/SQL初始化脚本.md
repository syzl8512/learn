# SQL 初始化脚本参考

**版本**: 1.0
**日期**: 2025-10-25
**说明**: 本文档提供直接使用 SQL 创建数据库的参考脚本 (不依赖 Prisma)

---

## 使用场景

- 需要在不支持 Prisma 的环境中初始化数据库
- 需要手动审查和修改表结构
- 需要在现有数据库中添加表

---

## 完整建表脚本

### 1. 用户相关表

```sql
-- 用户表
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    wechat_id TEXT UNIQUE,
    nickname TEXT,
    avatar TEXT,

    -- 蓝斯值相关
    lexile_score DECIMAL(10,2),
    lexile_level TEXT,
    lexile_updated_at TIMESTAMP,

    role TEXT NOT NULL DEFAULT 'student',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wechat_id ON users(wechat_id);
CREATE INDEX idx_users_lexile_score ON users(lexile_score);

-- 蓝斯值评估历史表
CREATE TABLE user_lexile_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    assessment_method TEXT NOT NULL,

    min_lexile DECIMAL(10,2),
    max_lexile DECIMAL(10,2),
    average_lexile DECIMAL(10,2) NOT NULL,
    recommended_level TEXT NOT NULL,

    input_content TEXT,
    analysis_result JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_lexile_history_user_id ON user_lexile_history(user_id, created_at);
```

### 2. 书籍和章节相关表

```sql
-- 书籍表
CREATE TABLE books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    cover_url TEXT,

    original_lexile DECIMAL(10,2),
    lexile_range TEXT,

    category TEXT,
    tags TEXT,
    recommended_age TEXT,

    status TEXT NOT NULL DEFAULT 'draft',
    published_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_original_lexile ON books(original_lexile);
CREATE INDEX idx_books_status ON books(status);

-- 章节表
CREATE TABLE chapters (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    sequence_number INTEGER NOT NULL,
    title TEXT NOT NULL,

    audio_url TEXT,
    audio_generated BOOLEAN NOT NULL DEFAULT false,
    audio_metadata JSONB,

    status TEXT NOT NULL DEFAULT 'draft',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(book_id, sequence_number)
);

CREATE INDEX idx_chapters_book_id ON chapters(book_id);

-- 章节内容表 (多版本)
CREATE TABLE chapter_contents (
    id TEXT PRIMARY KEY,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,

    version TEXT NOT NULL,
    content TEXT NOT NULL,

    word_count INTEGER,
    sentence_count INTEGER,
    estimated_lexile DECIMAL(10,2),
    estimated_reading_time INTEGER,

    processed_by TEXT,
    processed_at TIMESTAMP,
    processing_log JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(chapter_id, version)
);

CREATE INDEX idx_chapter_contents_chapter_id ON chapter_contents(chapter_id);

-- 提取的话题表
CREATE TABLE extracted_topics (
    id TEXT PRIMARY KEY,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,

    topic_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,

    keywords JSONB NOT NULL,
    related_listening_ids JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_extracted_topics_chapter_category ON extracted_topics(chapter_id, category);
```

### 3. 听力内容相关表

```sql
-- 听力内容表
CREATE TABLE listening_contents (
    id TEXT PRIMARY KEY,

    title TEXT NOT NULL,
    description TEXT,

    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    lexile_level DECIMAL(10,2),

    content_type TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,

    audio_url TEXT NOT NULL,
    transcript TEXT NOT NULL,
    translation TEXT,

    subtitles JSONB,
    keywords JSONB,

    import_batch_id TEXT,
    imported_from TEXT,
    imported_at TIMESTAMP,
    imported_by TEXT,

    status TEXT NOT NULL DEFAULT 'draft',
    published_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listening_contents_category_difficulty ON listening_contents(category, difficulty);
CREATE INDEX idx_listening_contents_import_batch_id ON listening_contents(import_batch_id);
CREATE INDEX idx_listening_contents_status ON listening_contents(status);

-- 听力学习历史表
CREATE TABLE listening_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listening_id TEXT NOT NULL REFERENCES listening_contents(id) ON DELETE CASCADE,

    listening_time_seconds INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP,

    playback_speed DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    score INTEGER,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, listening_id)
);

CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_completed_at ON listening_history(completed_at);
```

### 4. 学习相关表

```sql
-- 生词本表
CREATE TABLE vocabulary (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    word TEXT NOT NULL,
    pronunciation TEXT,
    part_of_speech TEXT,

    english_definition TEXT,
    chinese_translation TEXT NOT NULL,

    example_sentence TEXT,
    example_translation TEXT,

    synonyms JSONB,
    antonyms JSONB,

    lexile_level DECIMAL(10,2),

    source_type TEXT,
    source_chapter_id TEXT,
    source_listening_id TEXT,

    mastered BOOLEAN NOT NULL DEFAULT false,
    mastered_at TIMESTAMP,

    next_review_at TIMESTAMP,
    review_count INTEGER NOT NULL DEFAULT 0,

    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vocabulary_user_word ON vocabulary(user_id, word);
CREATE INDEX idx_vocabulary_user_mastered ON vocabulary(user_id, mastered);
CREATE INDEX idx_vocabulary_next_review_at ON vocabulary(next_review_at);

-- 阅读进度表
CREATE TABLE reading_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,

    current_position INTEGER NOT NULL,
    completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,

    total_reading_seconds INTEGER NOT NULL DEFAULT 0,

    current_version TEXT NOT NULL DEFAULT 'original',

    words_learned INTEGER NOT NULL DEFAULT 0,

    last_read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, chapter_id)
);

CREATE INDEX idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX idx_reading_progress_last_read_at ON reading_progress(last_read_at);

-- 书签表
CREATE TABLE bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,

    position INTEGER NOT NULL,
    note TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookmarks_user_chapter ON bookmarks(user_id, chapter_id);
```

### 5. 系统相关表

```sql
-- 批量导入任务表
CREATE TABLE import_batches (
    id TEXT PRIMARY KEY,

    import_type TEXT NOT NULL,

    file_name TEXT NOT NULL,
    file_url TEXT,
    file_size INTEGER,

    total_rows INTEGER NOT NULL,
    success_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    pending_count INTEGER NOT NULL DEFAULT 0,

    progress DECIMAL(5,2) NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'pending',

    errors JSONB,

    imported_by TEXT NOT NULL,

    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_import_batches_status ON import_batches(status);
CREATE INDEX idx_import_batches_imported_by ON import_batches(imported_by);
CREATE INDEX idx_import_batches_created_at ON import_batches(created_at);

-- 管理员操作日志表
CREATE TABLE admin_logs (
    id TEXT PRIMARY KEY,

    admin_id TEXT NOT NULL,
    admin_name TEXT,

    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,

    details JSONB,

    ip_address TEXT,
    user_agent TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action_resource ON admin_logs(action, resource);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

-- 系统配置表
CREATE TABLE system_configs (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 触发器和函数

### 自动更新 updated_at 字段

```sql
-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有需要的表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapter_contents_updated_at BEFORE UPDATE ON chapter_contents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listening_contents_updated_at BEFORE UPDATE ON listening_contents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listening_history_updated_at BEFORE UPDATE ON listening_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON vocabulary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_import_batches_updated_at BEFORE UPDATE ON import_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON system_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 种子数据 SQL

```sql
-- 插入系统配置
INSERT INTO system_configs (id, key, value, description) VALUES
('config_001', 'ai_model_config', '{"provider":"deepseek","model":"deepseek-chat","temperature":0.7,"maxTokens":2000}', 'AI 模型配置'),
('config_002', 'lexile_levels', '{"easy":{"min":400,"max":600,"label":"初级"},"ket":{"min":600,"max":900,"label":"KET"},"pet":{"min":900,"max":1200,"label":"PET"}}', '蓝斯值等级定义');

-- 插入测试用户
INSERT INTO users (id, email, nickname, lexile_score, lexile_level, role, created_at, updated_at) VALUES
('user_test_001', 'test@example.com', '测试用户', 750, 'KET', 'student', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入测试书籍
INSERT INTO books (id, title, author, description, original_lexile, lexile_range, category, recommended_age, status, published_at, created_at, updated_at) VALUES
('book_001', 'Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', '一个关于魔法学校的冒险故事', 880, '800-1000L', '小说', '8-12岁', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入测试章节
INSERT INTO chapters (id, book_id, sequence_number, title, status, created_at, updated_at) VALUES
('chapter_001', 'book_001', 1, 'The Boy Who Lived', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入章节内容 (原文版本)
INSERT INTO chapter_contents (id, chapter_id, version, content, word_count, sentence_count, estimated_lexile, estimated_reading_time, processed_by, processed_at, created_at, updated_at) VALUES
('content_001', 'chapter_001', 'original',
'# Chapter 1: The Boy Who Lived

Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much.',
120, 5, 880, 2, 'manual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入测试听力
INSERT INTO listening_contents (id, title, description, category, difficulty, lexile_level, content_type, duration_seconds, audio_url, transcript, translation, subtitles, keywords, status, published_at, created_at, updated_at) VALUES
('listening_001', '早上的问候', '学习日常问候语', '日常生活', '初级', 500, 'dialogue', 30,
'https://example.com/audio/greeting.mp3',
'Good morning! How are you? I''m fine, thank you!',
'早上好!你好吗?我很好,谢谢!',
'[{"startTime":0,"endTime":2,"english":"Good morning!","chinese":"早上好!"},{"startTime":2,"endTime":5,"english":"How are you?","chinese":"你好吗?"},{"startTime":5,"endTime":8,"english":"I''m fine, thank you!","chinese":"我很好,谢谢!"}]'::jsonb,
'["greeting","morning","fine"]'::jsonb,
'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

---

## 清空数据库

```sql
-- 删除所有表 (谨慎使用!)
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS system_configs CASCADE;
DROP TABLE IF EXISTS import_batches CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS reading_progress CASCADE;
DROP TABLE IF EXISTS vocabulary CASCADE;
DROP TABLE IF EXISTS listening_history CASCADE;
DROP TABLE IF EXISTS listening_contents CASCADE;
DROP TABLE IF EXISTS extracted_topics CASCADE;
DROP TABLE IF EXISTS chapter_contents CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS user_lexile_history CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 删除触发器函数
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

---

## 执行脚本

### 方式 1: 使用 psql 命令

```bash
# 执行建表脚本
psql -U postgres -d english_reading -f create_tables.sql

# 执行种子数据脚本
psql -U postgres -d english_reading -f seed_data.sql
```

### 方式 2: 使用 pgAdmin

1. 打开 pgAdmin
2. 连接到数据库
3. 右键点击数据库 → Query Tool
4. 粘贴 SQL 脚本
5. 点击 Execute (F5)

### 方式 3: 使用 Docker

```bash
# 将 SQL 文件挂载到容器中执行
docker run --rm \
  -v $(pwd)/create_tables.sql:/sql/create_tables.sql \
  postgres:16 \
  psql -h host.docker.internal -U postgres -d english_reading -f /sql/create_tables.sql
```

---

## 验证数据库

```sql
-- 查看所有表
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 查看表结构
\d users

-- 查看索引
SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- 统计表行数
SELECT
  schemaname,
  tablename,
  n_tup_ins as inserted,
  n_tup_upd as updated,
  n_tup_del as deleted
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

---

**注意**:
- 推荐使用 Prisma 进行数据库管理,此 SQL 脚本仅作参考
- 生产环境请使用 Prisma migrate 管理数据库版本
- 手动执行 SQL 时请务必备份数据

**相关文档**:
- [Prisma Schema 文档](./Prisma-Schema.md)
- [数据库迁移指南](./数据库迁移指南.md)

---

**文档维护者**: 后端开发团队
**最后更新**: 2025-10-25
**版本**: 1.0
