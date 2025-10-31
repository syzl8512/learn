# 智慧儿童英文辅助阅读平台 - 前端用户端

## 项目概述

这是一个为6-12岁儿童设计的智慧英文辅助阅读平台前端应用，使用Vue 3 + TypeScript + Element Plus构建。平台提供听力训练、分级阅读、生词管理等功能，帮助孩子循序渐进地提升英语能力。

## 技术栈

- **框架**: Vue 3.5.13 + TypeScript 5.7.2
- **构建工具**: Vite 6.0.3
- **路由**: Vue Router 4.5.0
- **状态管理**: Pinia 2.3.0
- **UI框架**: Element Plus 2.11.5
- **HTTP客户端**: Axios 1.7.9
- **样式**: SCSS + CSS变量
- **代码检查**: ESLint 9.17.0
- **图标**: @element-plus/icons-vue

## 项目结构

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 公共组件
│   │   └── LayoutView.vue  # 主布局组件
│   ├── views/             # 页面组件
│   │   ├── HomeView.vue       # 首页
│   │   ├── ListeningView.vue  # 听力页面
│   │   ├── ReadingView.vue    # 阅读页面
│   │   └── VocabularyView.vue # 生词管理页面
│   ├── router/            # 路由配置
│   │   └── index.ts           # 路由定义
│   ├── stores/            # Pinia状态管理
│   │   ├── app.ts             # 应用状态
│   │   ├── user.ts            # 用户状态
│   │   ├── book.ts            # 书籍状态
│   │   ├── vocabulary.ts      # 生词状态
│   │   └── listening.ts       # 听力状态
│   ├── services/          # API服务
│   │   ├── api.ts             # Axios基础配置
│   │   ├── auth.ts            # 认证服务
│   │   ├── book.ts            # 书籍服务
│   │   ├── vocabulary.ts      # 生词服务
│   │   └── listening.ts       # 听力服务
│   ├── types/             # TypeScript类型定义
│   │   ├── user.ts            # 用户类型
│   │   ├── book.ts            # 书籍类型
│   │   ├── vocabulary.ts      # 生词类型
│   │   └── listening.ts       # 听力类型
│   ├── styles/            # 样式文件
│   │   ├── variables.scss     # SCSS变量
│   │   └── main.scss          # 主样式文件
│   ├── utils/             # 工具函数
│   ├── assets/            # 静态资源
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── package.json           # 项目配置
├── vite.config.ts         # Vite配置
├── tsconfig.json          # TypeScript配置
├── eslint.config.js       # ESLint配置
├── env.d.ts              # 环境类型定义
└── README.md             # 项目说明
```

## 功能模块

### 1. 首页 (HomeView)
- 平台介绍和功能概览
- 四大板块快速入口
- 推荐内容展示
- 响应式设计

### 2. 听力训练 (ListeningView)
- 听力内容列表展示
- 分类和难度筛选
- 搜索功能
- 分页功能
- 播放功能预留接口

### 3. 分级阅读 (ReadingView)
- 书籍列表展示
- 分类和蓝斯值筛选
- 搜索功能
- 分页功能
- 书籍详情展示

### 4. 生词管理 (VocabularyView)
- 生词列表管理
- 统计信息展示
- 分类和难度筛选
- 添加生词功能
- 复习和删除功能

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问地址: http://localhost:5173

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

### 代码检查
```bash
npm run lint
```

### 类型检查
```bash
npm run type-check
```

## 开发配置

### Vite配置 (vite.config.ts)
- 开发服务器端口: 5173
- API代理: http://localhost:3000 (后端服务)
- SCSS预处理配置
- 路径别名: @/ → src/

### TypeScript配置
- 严格模式开启
- 完整类型检查
- Vue 3组件类型支持

### ESLint配置
- Vue 3 + TypeScript最佳实践
- 自动修复功能
- 代码风格统一

## API集成

### 后端API地址
- 开发环境: http://localhost:3000
- 生产环境: 根据部署环境配置

### API服务模块
- `auth.ts`: 用户认证相关
- `book.ts`: 书籍和章节管理
- `vocabulary.ts`: 生词管理
- `listening.ts`: 听力内容管理

### HTTP拦截器
- 请求拦截: 自动添加认证token
- 响应拦截: 统一错误处理
- 401处理: 自动清除用户信息

## 状态管理

### Pinia Store
- `app`: 应用全局状态
- `user`: 用户信息和认证
- `book`: 书籍数据和当前书籍
- `vocabulary`: 生词数据
- `listening`: 听力内容和当前播放

## 样式系统

### 设计变量
- 主色调: #8B5CF6 (紫色)
- 成功色: #10B981 (绿色)
- 警告色: #F59E0B (橙色)
- 危险色: #EF4444 (红色)

### 响应式断点
- 小屏幕: 640px以下
- 中屏幕: 640px - 1024px
- 大屏幕: 1024px以上

## 组件规范

### Vue 3 Composition API
- 使用 `<script setup>` 语法
- TypeScript类型安全
- 响应式数据使用ref/reactive
- 生命周期钩子按需使用

### Element Plus组件
- 统一使用中文语言包
- 图标使用@element-plus/icons-vue
- 样式自定义符合设计规范

## 部署说明

### 环境变量
根据不同环境配置相应的API地址和其他环境参数。

### 构建优化
- 代码分割和懒加载
- 资源压缩和缓存
- 静态资源CDN配置

## 开发注意事项

1. **代码规范**: 严格遵循ESLint规则
2. **类型安全**: 充分利用TypeScript类型检查
3. **组件复用**: 抽取公共组件提高复用性
4. **性能优化**: 合理使用v-if和v-show
5. **用户体验**: 添加加载状态和错误处理

## 待完成功能

- [ ] 用户认证登录功能
- [ ] 书籍阅读器组件
- [ ] 音频播放器组件
- [ ] 生词复习算法
- [ ] 学习进度统计
- [ ] 个人中心页面
- [ ] 设置页面

## 项目状态

✅ **项目架构搭建完成**
✅ **基础页面组件完成**
✅ **路由和状态管理配置完成**
✅ **API服务层配置完成**
✅ **样式系统完成**
✅ **开发环境配置完成**

*创建时间: 2025-10-30*
*项目版本: 1.0.0*