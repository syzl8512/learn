# 词汇管理和学习进度追踪功能迁移

## 概述
本次迁移为英语分级阅读平台添加了完整的词汇管理和学习进度追踪功能。

## 新增表和字段

### 用户相关表
- `User` 表已包含蓝斯值相关字段（已在Schema中定义）
- `UserLexileHistory` 表用于记录蓝斯值评估历史

### 词汇管理表
- `Vocabulary` 表：完整的生词本功能
  - 基本信息：单词、音标、词性、释义
  - 学习相关：掌握状态、复习计划、遗忘曲线
  - 来源追踪：章节来源、听力来源
  - 高级功能：同义词、反义词、蓝斯值水平

### 进度管理表
- `ReadingProgress` 表：阅读进度追踪
  - 进度信息：当前位置、完成百分比
  - 学习数据：阅读时长、学到的单词数
  - 版本支持：不同难度版本的阅读进度

- `Bookmark` 表：书签管理
  - 位置标记和备注功能

### 听力内容表
- `ListeningContent` 表：听力内容管理
- `ListeningHistory` 表：听力学习历史

### 管理表
- `ImportBatch` 表：批量导入任务管理
- `AdminLog` 表：管理员操作日志
- `SystemConfig` 表：系统配置

## 索引优化
- 为常用查询字段添加了索引
- 复合索引用于多条件查询
- 支持高效的搜索和筛选操作

## 数据关系
- 用户与词汇：一对多关系
- 用户与阅读进度：一对多关系
- 用户与书签：一对多关系
- 章节与进度：一对多关系
- 章节与书签：一对多关系

## API端点映射
新增的API端点将对应以下数据库操作：

### 词汇管理API (10个端点)
- POST /api/vocabulary - 添加单词
- GET /api/vocabulary - 列表查询（支持搜索筛选）
- GET /api/vocabulary/:id - 获取详情
- PATCH /api/vocabulary/:id - 更新单词
- DELETE /api/vocabulary/:id - 删除单词
- GET /api/vocabulary/review - 获取复习列表
- POST /api/vocabulary/:id/review - 标记复习
- GET /api/vocabulary/export/csv - CSV导出
- GET /api/vocabulary/export/anki - Anki导出
- GET /api/vocabulary/stats - 词汇统计

### 学习进度API (6个端点)
- POST /api/progress/chapters/:id - 保存进度
- GET /api/progress/chapters/:id - 获取章节进度
- GET /api/progress - 获取所有进度
- GET /api/progress/stats - 学习统计
- POST /api/progress/bookmarks/:id - 创建书签
- DELETE /api/progress/bookmarks/:id - 删除书签

### 统计分析API (8个端点)
- GET /api/stats/dashboard - 仪表板统计
- GET /api/stats/detailed-report - 详细报告
- GET /api/stats/vocabulary - 词汇统计
- GET /api/stats/reading - 阅读统计
- GET /api/stats/heatmap - 热力图数据
- GET /api/stats/recent-vocabulary - 最近词汇
- GET /api/stats/recent-reading - 最近阅读
- GET /api/stats/bookmarks - 书签统计

## 特性亮点

### 智能复习系统
- 基于艾宾浩斯遗忘曲线的复习计划
- 自动计算下次复习时间：1天→3天→7天→15天→30天→60天
- 支持手动标记复习完成

### 多维度筛选搜索
- 单词搜索：支持英文单词和中文翻译
- 词性筛选：动词、名词、形容词等
- 掌握状态：已掌握/未掌握
- 日期范围：按创建时间筛选
- 来源类型：章节/听力

### 数据导出功能
- CSV格式：完整的生词本信息
- Anki格式：直接导入Anki学习软件
- 支持筛选条件导出

### 学习热力图
- 最近30天的学习活动可视化
- 每日新增词汇和阅读时长
- 仪表板展示学习趋势

## 数据完整性
- 外键约束确保数据一致性
- 级联删除处理相关数据
- 必要字段设置为非空
- 默认值处理

## 性能考虑
- 合理的索引设计
- 分页查询避免大量数据加载
- JSON字段使用PostgreSQL的JSON类型
- 查询优化和N+1问题预防

## 安全性
- 用户级别的数据隔离
- 参数验证和类型检查
- SQL注入防护（Prisma ORM）
- 敏感信息保护

## 迁移状态
✅ 已完成 - Schema设计完整
✅ 已完成 - 数据库结构同步
✅ 已完成 - Prisma客户端生成
📋 待完成 - 测试数据初始化
📋 待完成 - 功能测试验证