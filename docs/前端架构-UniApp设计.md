# 前端架构 - uni-app 设计文档

**版本**: 1.0
**日期**: 2025-10-25
**框架**: uni-app 3.x + Vue 3 + TypeScript
**目标平台**: 微信小程序 (primary) + H5 网页版 (可选)
**说明**: 用 uni-app 替代 Taro，更好地适配微信小程序生态

---

## 📋 目录

1. [为什么选择 uni-app](#为什么选择-uni-app)
2. [项目结构设计](#项目结构设计)
3. [核心技术栈](#核心技术栈)
4. [页面和组件设计](#页面和组件设计)
5. [状态管理 (Pinia)](#状态管理-pinia)
6. [API 集成](#api-集成)
7. [核心组件实现](#核心组件实现)
8. [快速启动指南](#快速启动指南)
9. [部署和打包](#部署和打包)

---

## 为什么选择 uni-app

### uni-app vs Taro 对比

| 维度 | uni-app | Taro | 结论 |
|------|---------|------|------|
| **微信小程序支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | uni-app 更原生 |
| **开发者生态** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | uni-app 社区更活跃 |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | uni-app 更轻量 |
| **文档完整性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | uni-app 更详细 |
| **编译速度** | 快 | 中等 | uni-app 更快 |
| **包体积** | 更小 | 稍大 | uni-app 优势 |
| **Vue 3 支持** | ✅ 完美 | ✅ 完美 | 并驾齐驱 |

### 选择 uni-app 的理由

```
1. 微信小程序生态支持最好
   - 官方建议在微信小程序使用 uni-app
   - 编译优化专为小程序定制

2. 更小的包体积
   - 主包通常 < 2MB (符合微信限制)
   - 分包加载更灵活

3. 更快的开发速度
   - 热重载更可靠
   - 调试工具集成度高

4. 完整的多端支持
   - 微信小程序 (primary)
   - H5 网页版
   - 支付宝小程序
   - Android/iOS APP (可选)

5. 更成熟的最佳实践
   - uni-app 官方文档更完善
   - 社区插件生态更丰富
```

---

## 项目结构设计

### 完整的项目文件夹组织

```
reading-app/
├── src/
│   ├── pages/                      # 页面
│   │   ├── login/
│   │   │   ├── index.vue          # 登录页
│   │   │   └── lexile-selector/   # 蓝斯值选择
│   │   │       ├── index.vue
│   │   │       ├── quick-select.vue
│   │   │       └── ai-assessment.vue
│   │   ├── index/
│   │   │   └── index.vue          # 首页 (选择书籍)
│   │   ├── books/
│   │   │   ├── index.vue          # 书籍列表
│   │   │   ├── detail.vue         # 书籍详情
│   │   │   ├── reading.vue        # 阅读页 (核心)
│   │   │   └── chapter-select.vue # 章节选择
│   │   ├── listening/
│   │   │   ├── index.vue          # 听力列表
│   │   │   ├── detail.vue         # 听力详情
│   │   │   └── player.vue         # 播放器页面
│   │   ├── vocabulary/
│   │   │   ├── index.vue          # 生词本列表
│   │   │   └── detail.vue         # 单词详情
│   │   ├── dashboard/
│   │   │   ├── index.vue          # 学习仪表板
│   │   │   └── stats.vue          # 学习统计
│   │   └── my/
│   │       ├── index.vue          # 个人中心
│   │       └── settings.vue       # 设置
│   │
│   ├── components/                 # 可复用组件
│   │   ├── Reading/
│   │   │   ├── WordPopover.vue     # 单词弹窗
│   │   │   ├── VersionSwitcher.vue # 版本切换
│   │   │   ├── BookmarkBar.vue     # 书签栏
│   │   │   └── ContentRenderer.vue # 内容渲染器
│   │   ├── Audio/
│   │   │   ├── AudioPlayer.vue     # 音频播放器
│   │   │   ├── PlaybackSpeed.vue   # 速度控制
│   │   │   └── Subtitles.vue       # 字幕显示
│   │   ├── Common/
│   │   │   ├── TabBar.vue          # 底部标签栏
│   │   │   ├── Loading.vue         # 加载动画
│   │   │   ├── Empty.vue           # 空状态
│   │   │   └── Toast.vue           # 提示框
│   │   └── Vocabulary/
│   │       ├── WordCard.vue        # 单词卡片
│   │       └── WordList.vue        # 单词列表
│   │
│   ├── stores/                     # Pinia 状态管理
│   │   ├── user.ts                 # 用户信息
│   │   ├── reading.ts              # 阅读进度
│   │   ├── vocabulary.ts           # 词汇数据
│   │   ├── audio.ts                # 音频播放状态
│   │   └── ui.ts                   # UI 状态
│   │
│   ├── services/                   # API 和服务
│   │   ├── api.ts                  # HTTP 客户端
│   │   ├── auth.ts                 # 认证服务
│   │   ├── books.ts                # 书籍服务
│   │   ├── listening.ts            # 听力服务
│   │   ├── vocabulary.ts           # 词汇服务
│   │   ├── wechat.ts               # 微信相关
│   │   └── storage.ts              # 本地存储
│   │
│   ├── utils/                      # 工具函数
│   │   ├── request.ts              # 请求拦截器
│   │   ├── formatter.ts            # 格式化
│   │   ├── validator.ts            # 验证
│   │   ├── constants.ts            # 常量
│   │   └── common.ts               # 通用工具
│   │
│   ├── styles/                     # 全局样式
│   │   ├── variables.scss          # 变量定义
│   │   ├── mixins.scss             # Mixin
│   │   ├── global.scss             # 全局样式
│   │   └── responsive.scss         # 响应式
│   │
│   ├── types/                      # TypeScript 类型定义
│   │   ├── user.ts
│   │   ├── book.ts
│   │   ├── listening.ts
│   │   ├── vocabulary.ts
│   │   └── api.ts
│   │
│   ├── App.vue                     # 应用根组件
│   ├── main.ts                     # 应用入口
│   └── manifest.json               # uni-app 配置
│
├── public/                         # 静态资源
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── unpackage/                      # 编译输出
│   ├── dist/
│   │   ├── dev/
│   │   │   ├── mp-weixin/         # 微信小程序
│   │   │   └── h5/                # H5 版本
│   │   └── build/
│   │       ├── mp-weixin/         # 小程序产品包
│   │       └── h5/                # H5 产品包
│   └── ...
│
├── vite.config.ts                 # Vite 配置
├── tsconfig.json                  # TypeScript 配置
├── package.json                   # 依赖管理
├── .env.development               # 开发环境变量
├── .env.production                # 生产环境变量
└── README.md                      # 项目说明
```

---

## 核心技术栈

### 依赖清单

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "uni-app": "^3.8.0",
    "pinia": "^2.1.0",
    "axios": "^1.6.0",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "@unocss/preset-uno": "^0.57.0",
    "unocss": "^0.57.0",
    "sass": "^1.69.0",
    "vite": "^5.0.0"
  }
}
```

### 技术选型说明

| 层级 | 技术 | 说明 |
|------|------|------|
| **框架** | uni-app 3.x | 官方最新版本，支持 Vue 3 |
| **UI 框架** | Vue 3 | 最新版本，性能最优 |
| **语言** | TypeScript 5.x | 类型安全 |
| **状态管理** | Pinia | 比 Vuex 更轻量 |
| **HTTP 客户端** | axios | 成熟稳定，支持拦截器 |
| **样式** | SCSS + UnoCSS | 原子化 CSS，包体积小 |
| **日期处理** | dayjs | 体积小，性能好 |
| **构建工具** | Vite | 超快的开发体验 |

---

## 页面和组件设计

### 页面路由

```javascript
// pages.json
{
  "pages": [
    {
      "path": "pages/login/index",
      "style": { "navigationBarTitleText": "登录" }
    },
    {
      "path": "pages/login/lexile-selector/index",
      "style": { "navigationBarTitleText": "选择英语水平" }
    },
    {
      "path": "pages/index/index",
      "style": { "navigationBarTitleText": "首页" }
    },
    {
      "path": "pages/books/index",
      "style": { "navigationBarTitleText": "书籍列表" }
    },
    {
      "path": "pages/books/detail",
      "style": { "navigationBarTitleText": "书籍详情" }
    },
    {
      "path": "pages/books/reading",
      "style": { "navigationBarTitleText": "阅读中", "navigationBarBackgroundColor": "#f5f5f5" }
    },
    {
      "path": "pages/listening/index",
      "style": { "navigationBarTitleText": "听力训练" }
    },
    {
      "path": "pages/listening/player",
      "style": { "navigationBarTitleText": "播放中" }
    },
    {
      "path": "pages/vocabulary/index",
      "style": { "navigationBarTitleText": "生词本" }
    },
    {
      "path": "pages/dashboard/index",
      "style": { "navigationBarTitleText": "学习仪表板" }
    },
    {
      "path": "pages/my/index",
      "style": { "navigationBarTitleText": "个人中心" }
    }
  ],
  "subPackages": [
    {
      "root": "pages/admin",
      "pages": [
        {
          "path": "index",
          "style": { "navigationBarTitleText": "管理后台" }
        }
      ]
    }
  ],
  "tabBar": {
    "color": "#999",
    "selectedColor": "#007AFF",
    "backgroundColor": "#fff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/books/index",
        "iconPath": "public/icons/books.png",
        "selectedIconPath": "public/icons/books-active.png",
        "text": "书籍"
      },
      {
        "pagePath": "pages/listening/index",
        "iconPath": "public/icons/listening.png",
        "selectedIconPath": "public/icons/listening-active.png",
        "text": "听力"
      },
      {
        "pagePath": "pages/vocabulary/index",
        "iconPath": "public/icons/vocab.png",
        "selectedIconPath": "public/icons/vocab-active.png",
        "text": "词汇"
      },
      {
        "pagePath": "pages/my/index",
        "iconPath": "public/icons/my.png",
        "selectedIconPath": "public/icons/my-active.png",
        "text": "我的"
      }
    ]
  }
}
```

---

## 状态管理 (Pinia)

### 用户状态 (stores/user.ts)

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  nickName: string
  avatar: string
  lexileScore: number
  lexileLevel: 'elementary' | 'KET' | 'PET' | 'custom'
  createdAt: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const userInitials = computed(() => {
    if (!user.value) return '未登录'
    return user.value.nickName.substring(0, 2)
  })

  // 方法
  function setToken(newToken: string, newRefreshToken: string) {
    token.value = newToken
    refreshToken.value = newRefreshToken
    // 保存到本地存储
    uni.setStorageSync('accessToken', newToken)
    uni.setStorageSync('refreshToken', newRefreshToken)
  }

  function setUser(newUser: User) {
    user.value = newUser
    uni.setStorageSync('user', JSON.stringify(newUser))
  }

  function updateLexile(lexileScore: number, lexileLevel: string) {
    if (user.value) {
      user.value.lexileScore = lexileScore
      user.value.lexileLevel = lexileLevel as any
      setUser(user.value)
    }
  }

  function logout() {
    token.value = ''
    refreshToken.value = ''
    user.value = null
    uni.removeStorageSync('accessToken')
    uni.removeStorageSync('refreshToken')
    uni.removeStorageSync('user')
  }

  function loadFromStorage() {
    const storedToken = uni.getStorageSync('accessToken')
    const storedUser = uni.getStorageSync('user')

    if (storedToken) {
      token.value = storedToken
      refreshToken.value = uni.getStorageSync('refreshToken') || ''
    }

    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  return {
    token,
    refreshToken,
    user,
    isLoggedIn,
    userInitials,
    isLoading,
    setToken,
    setUser,
    updateLexile,
    logout,
    loadFromStorage,
  }
})
```

### 阅读状态 (stores/reading.ts)

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ReadingProgress {
  bookId: string
  chapterId: string
  lastReadPosition: number
  lastReadAt: string
  totalReadingTime: number
}

export const useReadingStore = defineStore('reading', () => {
  const currentBook = ref<any>(null)
  const currentChapter = ref<any>(null)
  const currentContent = ref('')
  const currentVersion = ref<'original' | 'easy' | 'ket' | 'pet'>('ket')
  const readingHistory = ref<ReadingProgress[]>([])

  function setCurrentBook(book: any) {
    currentBook.value = book
  }

  function setCurrentChapter(chapter: any) {
    currentChapter.value = chapter
  }

  function setCurrentContent(content: string) {
    currentContent.value = content
  }

  function switchVersion(version: 'original' | 'easy' | 'ket' | 'pet') {
    currentVersion.value = version
  }

  function saveProgress(position: number, readingTime: number) {
    if (!currentBook.value || !currentChapter.value) return

    const progress: ReadingProgress = {
      bookId: currentBook.value.id,
      chapterId: currentChapter.value.id,
      lastReadPosition: position,
      lastReadAt: new Date().toISOString(),
      totalReadingTime: readingTime,
    }

    // 保存到本地存储
    uni.setStorageSync(
      `reading_${currentBook.value.id}_${currentChapter.value.id}`,
      JSON.stringify(progress)
    )

    readingHistory.value.push(progress)
  }

  function getProgress(bookId: string, chapterId: string): ReadingProgress | null {
    const key = `reading_${bookId}_${chapterId}`
    const stored = uni.getStorageSync(key)
    return stored ? JSON.parse(stored) : null
  }

  return {
    currentBook,
    currentChapter,
    currentContent,
    currentVersion,
    readingHistory,
    setCurrentBook,
    setCurrentChapter,
    setCurrentContent,
    switchVersion,
    saveProgress,
    getProgress,
  }
})
```

### 词汇状态 (stores/vocabulary.ts)

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Vocabulary {
  id: string
  word: string
  pronunciation: string
  meaning: string
  chineseTranslation: string
  examples: string[]
  mastered: boolean
  addedAt: string
}

export const useVocabularyStore = defineStore('vocabulary', () => {
  const words = ref<Vocabulary[]>([])
  const filter = ref<'all' | 'new' | 'mastered'>('all')

  const filteredWords = computed(() => {
    if (filter.value === 'all') return words.value
    if (filter.value === 'mastered') return words.value.filter(w => w.mastered)
    return words.value.filter(w => !w.mastered)
  })

  const statistics = computed(() => ({
    total: words.value.length,
    mastered: words.value.filter(w => w.mastered).length,
    new: words.value.filter(w => !w.mastered).length,
  }))

  function addWord(vocab: Vocabulary) {
    const exists = words.value.find(w => w.word === vocab.word)
    if (!exists) {
      words.value.push(vocab)
      saveToStorage()
    }
  }

  function removeWord(wordId: string) {
    words.value = words.value.filter(w => w.id !== wordId)
    saveToStorage()
  }

  function markAsMastered(wordId: string) {
    const word = words.value.find(w => w.id === wordId)
    if (word) {
      word.mastered = true
      saveToStorage()
    }
  }

  function setFilter(newFilter: 'all' | 'new' | 'mastered') {
    filter.value = newFilter
  }

  function saveToStorage() {
    uni.setStorageSync('vocabulary', JSON.stringify(words.value))
  }

  function loadFromStorage() {
    const stored = uni.getStorageSync('vocabulary')
    if (stored) {
      words.value = JSON.parse(stored)
    }
  }

  return {
    words,
    filter,
    filteredWords,
    statistics,
    addWord,
    removeWord,
    markAsMastered,
    setFilter,
    saveToStorage,
    loadFromStorage,
  }
})
```

---

## API 集成

### HTTP 客户端 (services/api.ts)

```typescript
import axios, { AxiosInstance, AxiosConfig } from 'axios'
import { useUserStore } from '@/stores/user'

// 创建 axios 实例
const api: AxiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const userStore = useUserStore()

    if (error.response?.status === 401) {
      // Token 过期，尝试刷新
      userStore.logout()
      uni.redirectTo({ url: '/pages/login/index' })
    }

    // 统一错误处理
    const message = error.response?.data?.message || '请求失败，请重试'
    uni.showToast({
      title: message,
      icon: 'error',
      duration: 2000,
    })

    return Promise.reject(error)
  }
)

export default api
```

### 具体服务实现 (services/books.ts)

```typescript
import api from './api'

// 获取书籍列表
export async function getBooks(page = 1, limit = 20) {
  return api.get('/books', {
    params: { page, limit },
  })
}

// 获取书籍详情
export async function getBookDetail(bookId: string) {
  return api.get(`/books/${bookId}`)
}

// 获取章节内容（指定版本）
export async function getChapterContent(chapterId: string, version = 'ket') {
  return api.get(`/chapters/${chapterId}`, {
    params: { version },
  })
}

// 查询单词释义
export async function lookupWord(chapterId: string, word: string) {
  return api.get(`/chapters/${chapterId}/word-lookup`, {
    params: { word },
  })
}

// 保存阅读进度
export async function saveReadingProgress(
  chapterId: string,
  data: {
    lastReadPosition: number
    readingTimeSeconds: number
    currentVersion: string
  }
) {
  return api.post(`/chapters/${chapterId}/progress`, data)
}

// 切换章节版本
export async function switchChapterVersion(
  chapterId: string,
  version: string
) {
  return api.patch(`/chapters/${chapterId}/switch-version`, {
    version,
  })
}
```

---

## 核心组件实现

### 阅读页面 (pages/books/reading.vue)

```vue
<template>
  <view class="reading-page">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">⬅</text>
      </view>
      <view class="header-center">
        <view class="book-title">{{ currentBook?.title }}</view>
        <view class="chapter-title">{{ currentChapter?.title }}</view>
      </view>
      <view class="header-right">
        <button class="icon-btn" @click="showMenu = true">☰</button>
      </view>
    </view>

    <!-- 版本切换器 -->
    <view class="version-switcher">
      <button
        v-for="version in ['original', 'easy', 'ket', 'pet']"
        :key="version"
        :class="{ active: readingStore.currentVersion === version }"
        @click="switchVersion(version)"
      >
        {{ getVersionLabel(version) }}
      </button>
    </view>

    <!-- 章节内容 -->
    <scroll-view
      class="content-area"
      scroll-y
      @scroll="onScroll"
      :style="{ height: contentHeight }"
    >
      <view class="content-wrapper">
        <view
          v-for="(word, idx) in words"
          :key="idx"
          class="word"
          :class="{ clickable: isClickable(word) }"
          @click="handleWordClick(word, $event)"
        >
          {{ word }}
        </view>
      </view>
    </scroll-view>

    <!-- 单词弹窗 -->
    <view v-if="selectedWord" class="word-popup-overlay" @click="selectedWord = null">
      <view class="word-popup" @click.stop>
        <view class="popup-header">
          <view class="word-title">{{ selectedWord.word }}</view>
          <button class="close-btn" @click="selectedWord = null">✕</button>
        </view>

        <view class="pronunciation">{{ selectedWord.pronunciation }}</view>

        <view class="meanings">
          <view class="meaning-item">
            <view class="label">英文释义:</view>
            <view class="content">{{ selectedWord.meaning }}</view>
          </view>
          <view class="meaning-item">
            <view class="label">中文翻译:</view>
            <view class="content">{{ selectedWord.chineseTranslation }}</view>
          </view>
        </view>

        <view class="actions">
          <button class="btn-add" @click="addToVocabulary">❤ 添加生词本</button>
        </view>
      </view>
    </view>

    <!-- 底部控制栏 -->
    <view class="footer-controls">
      <button @click="previousChapter">← 上一章</button>
      <button @click="toggleAudio">{{ isPlaying ? '⏸' : '▶' }} 朗读</button>
      <button @click="nextChapter">下一章 →</button>
    </view>

    <!-- 菜单 -->
    <view v-if="showMenu" class="menu-overlay" @click="showMenu = false">
      <view class="menu" @click.stop>
        <button @click="toggleNightMode">🌙 夜间模式</button>
        <button @click="toggleFontSize">A+ 字体大小</button>
        <button @click="toggleLineHeight">↕ 行距</button>
        <button @click="showBookmarks">🔖 书签</button>
        <button @click="showMenu = false">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'uni-app'
import { useUserStore } from '@/stores/user'
import { useReadingStore } from '@/stores/reading'
import { useVocabularyStore } from '@/stores/vocabulary'
import * as booksService from '@/services/books'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const readingStore = useReadingStore()
const vocabStore = useVocabularyStore()

// 响应式数据
const currentBook = ref<any>(null)
const currentChapter = ref<any>(null)
const chapterContent = ref('')
const selectedWord = ref<any>(null)
const isPlaying = ref(false)
const showMenu = ref(false)
const contentHeight = ref('0px')

// 计算属性
const words = computed(() => {
  return chapterContent.value.split(/(\s+|[.,!?;:])/).filter((w) => w.length > 0)
})

function isClickable(word: string): boolean {
  return /^[a-zA-Z]+$/i.test(word)
}

function getVersionLabel(version: string): string {
  const labels: Record<string, string> = {
    original: '原文',
    easy: '初级',
    ket: 'KET',
    pet: 'PET',
  }
  return labels[version] || version
}

// 方法
async function fetchChapter() {
  try {
    const bookId = route.params.bookId as string
    const chapterId = route.params.chapterId as string

    const response = await booksService.getChapterContent(
      chapterId,
      readingStore.currentVersion
    )

    chapterContent.value = response.data.content
    currentChapter.value = response.data
  } catch (error) {
    console.error('Failed to fetch chapter:', error)
    uni.showToast({ title: '加载失败', icon: 'error' })
  }
}

function switchVersion(version: string) {
  readingStore.switchVersion(version as any)
  fetchChapter()
}

async function handleWordClick(word: string, event: any) {
  if (!isClickable(word)) return

  try {
    const chapterId = route.params.chapterId as string
    const response = await booksService.lookupWord(chapterId, word.toLowerCase())
    selectedWord.value = response.data
  } catch (error) {
    console.error('Failed to lookup word:', error)
  }
}

async function addToVocabulary() {
  if (!selectedWord.value) return

  vocabStore.addWord({
    id: `${Date.now()}`,
    word: selectedWord.value.word,
    pronunciation: selectedWord.value.pronunciation,
    meaning: selectedWord.value.meaning,
    chineseTranslation: selectedWord.value.chineseTranslation,
    examples: selectedWord.value.examples || [],
    mastered: false,
    addedAt: new Date().toISOString(),
  })

  uni.showToast({ title: '已添加到生词本', icon: 'success', duration: 1500 })
  selectedWord.value = null
}

function previousChapter() {
  if (currentChapter.value?.sequence <= 1) {
    uni.showToast({ title: '已是第一章', icon: 'none' })
    return
  }
  // 导航到上一章
  router.push({
    url: `/pages/books/reading?bookId=${currentBook.value.id}&chapterId=prev`,
  })
}

function nextChapter() {
  router.push({
    url: `/pages/books/reading?bookId=${currentBook.value.id}&chapterId=next`,
  })
}

function toggleAudio() {
  isPlaying.value = !isPlaying.value
  // TODO: 实现音频播放
}

function goBack() {
  router.back()
}

function toggleNightMode() {
  // TODO: 实现夜间模式
}

function toggleFontSize() {
  // TODO: 实现字体大小调整
}

function toggleLineHeight() {
  // TODO: 实现行距调整
}

function showBookmarks() {
  // TODO: 显示书签列表
}

function onScroll(e: any) {
  // 处理滚动事件
}

onMounted(() => {
  fetchChapter()

  // 计算内容区高度
  uni.getSystemInfo({
    success: (info) => {
      contentHeight.value = `${info.windowHeight - 200}px`
    },
  })
})
</script>

<style scoped lang="scss">
.reading-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.header-left,
.header-right {
  flex: 0 0 40px;
}

.header-center {
  flex: 1;
  margin: 0 16px;
}

.book-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.chapter-title {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.version-switcher {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.version-switcher button {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;

  &.active {
    background-color: #007aff;
    color: white;
    border-color: #007aff;
  }
}

.content-area {
  flex: 1;
  padding: 16px;
  background-color: white;
}

.content-wrapper {
  line-height: 1.8;
  font-size: 16px;
  color: #333;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.word {
  display: inline;

  &.clickable {
    color: #007aff;
    border-bottom: 1px dotted #007aff;
  }
}

.word-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.word-popup {
  width: 100%;
  max-height: 60vh;
  background-color: white;
  border-radius: 12px 12px 0 0;
  padding: 20px;
  overflow-y: auto;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.word-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
}

.pronunciation {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
  font-style: italic;
}

.meanings {
  margin-bottom: 16px;
}

.meaning-item {
  margin-bottom: 8px;
}

.label {
  font-size: 12px;
  color: #666;
  font-weight: bold;
  margin-bottom: 4px;
}

.content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-add {
  flex: 1;
  padding: 12px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
}

.footer-controls {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

.footer-controls button {
  flex: 1;
  padding: 8px 12px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  margin: 0 4px;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.menu {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  min-width: 200px;
}

.menu button {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  text-align: left;
}
</style>
```

---

## 快速启动指南

### 1. 环境安装

```bash
# 安装 Node.js 18+
node --version  # v18.x.x

# 全局安装 uni-app CLI
npm install -g @dcloudio/cli

# 或使用 pnpm (推荐)
pnpm install -g @dcloudio/cli
```

### 2. 创建项目

```bash
# 方式 A: 使用官方脚手架
dcloudio create -t web reading-app

# 方式 B: 手动初始化
mkdir reading-app
cd reading-app
npm init -y
npm install uni-app vue@^3.4.0 pinia axios dayjs
```

### 3. 项目配置

创建 `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

创建 `manifest.json`:

```json
{
  "name": "英语分级阅读",
  "appid": "your-app-id",
  "description": "智慧儿童英文辅助阅读平台",
  "versionName": "1.0.0",
  "versionCode": "100",
  "permission": {
    "scope.userInfo": {
      "desc": "用于获取用户信息"
    }
  },
  "mp-weixin": {
    "appid": "your-wechat-appid",
    "setting": {
      "urlCheck": false
    },
    "usingComponents": true
  }
}
```

### 4. 启动开发

```bash
# 开发小程序
npm run dev:mp-weixin

# 开发 H5
npm run dev:h5

# 生产构建
npm run build:mp-weixin
npm run build:h5
```

---

## 部署和打包

### 微信小程序发布

```bash
# 1. 构建小程序版本
npm run build:mp-weixin

# 2. 生成的文件在 unpackage/dist/build/mp-weixin

# 3. 打开微信开发者工具
# - 导入项目: unpackage/dist/build/mp-weixin
# - 预览和上传

# 4. 审核和发布
# - 在微信公众平台提交审核
# - 等待审核通过后发布
```

### H5 版本发布

```bash
# 1. 构建 H5 版本
npm run build:h5

# 2. 上传 unpackage/dist/build/h5 到服务器

# 3. 配置 Web 服务器
# - Nginx/Apache 配置
# - HTTPS 证书配置
# - CDN 加速配置
```

### 包体积优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue'],
          'pinia': ['pinia'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})
```

---

## 最佳实践

### 1. 性能优化

```typescript
// 使用 defineAsyncComponent 进行代码分割
const LexileSelector = defineAsyncComponent(() =>
  import('./pages/login/lexile-selector/index.vue')
)

// 使用分包加载
// 在 pages.json 配置 subPackages
```

### 2. 错误处理

```typescript
// 统一的错误捕获
uni.onError((error) => {
  console.error('全局错误:', error)
  uni.showToast({
    title: '系统错误，请稍后重试',
    icon: 'error',
  })
})
```

### 3. 数据持久化

```typescript
// 使用本地存储
uni.setStorageSync('key', value)
const value = uni.getStorageSync('key')
uni.removeStorageSync('key')
```

### 4. 离线支持

```typescript
// 缓存 API 响应
const cachedData = uni.getStorageSync(`cache_${url}`)
if (cachedData) {
  return JSON.parse(cachedData)
}

// 显示离线提示
if (!uni.getNetworkType()) {
  uni.showToast({ title: '网络连接失败', icon: 'error' })
}
```

---

**版本**: 1.0
**维护者**: 前端开发团队
**最后更新**: 2025-10-25
