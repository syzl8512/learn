# Vue + uni-app 设计系统使用指南

**英语分级阅读项目** - Vue 3 + uni-app + TypeScript

## 📖 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [设计系统](#设计系统)
- [主题系统](#主题系统)
- [组件库](#组件库)
- [工具类](#工具类)
- [平台适配](#平台适配)
- [性能优化](#性能优化)
- [开发指南](#开发指南)
- [故障排除](#故障排除)

## 🎯 项目概述

英语分级阅读是一个基于 Vue 3 + uni-app 的跨平台应用，专为 6-12 岁儿童设计的 AI 驱动英文原版阅读难度适配系统。

### 核心特性

- 🎨 **现代化设计系统** - 基于 oklch 颜色空间
- 🌓 **多主题支持** - 浅色/深色/护眼/系统主题
- 📱 **跨平台兼容** - 微信小程序 + H5
- ⚡ **性能优化** - GPU加速、懒加载、虚拟滚动
- ♿ **无障碍支持** - ARIA、键盘导航、高对比度
- 🎭 **丰富动画** - 流畅的过渡和微交互

## 🛠 技术栈

### 前端框架
- **Vue 3** - Composition API
- **uni-app 3.x** - 跨平台框架
- **TypeScript** - 类型安全

### 状态管理
- **Pinia** - 轻量级状态管理
- **useTheme** - 主题管理
- **useApp** - 应用状态

### 样式系统
- **CSS Variables** - 动态主题
- **oklch** - 现代颜色空间
- **SCSS** - CSS 预处理器
- **UnoCSS** - 原子化CSS

### UI 组件
- **Vue UI System** - 自定义组件库
- **uni-ui** - uni-app 官方组件
- **图标系统** - Unicode + SVG

## 🎨 设计系统

### 颜色系统

基于 oklch 颜色空间的现代化设计系统：

```css
/* 主色调 */
--vue-primary: oklch(0.6056 0.2189 292.7172);
--vue-secondary: oklch(0.9618 0.0202 295.1913);

/* 语义化颜色 */
--vue-success: oklch(0.6496 0.1711 142.4954);
--vue-warning: oklch(0.7971 0.1585 70.6781);
--vue-error: oklch(0.6368 0.2078 25.3313);
--vue-info: oklch(0.6056 0.2189 292.7172);

/* 中性色 */
--vue-background: oklch(1.0000 0 0);
--vue-foreground: oklch(0.3588 0.1354 278.6973);
--vue-muted: oklch(0.9691 0.0161 293.7558);
--vue-border: oklch(0.9299 0.0334 272.7879);
```

### 字体系统

```css
/* 字体族 */
--vue-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
--vue-font-serif: 'Georgia', 'Times New Roman', serif;
--vue-font-mono: 'SF Mono', 'Monaco', 'Inconsolata', monospace;

/* 字体大小 (基于 rpx) */
--vue-text-xs: 24rpx;    /* 12px */
--vue-text-sm: 28rpx;    /* 14px */
--vue-text-base: 32rpx;  /* 16px */
--vue-text-lg: 36rpx;    /* 18px */
--vue-text-xl: 40rpx;    /* 20px */
--vue-text-2xl: 48rpx;   /* 24px */
--vue-text-3xl: 56rpx;   /* 28px */
--vue-text-4xl: 72rpx;   /* 36px */
```

### 间距系统

```css
/* 间距变量 (基于 rpx) */
--vue-spacing-1: 10rpx;   /* 5px */
--vue-spacing-2: 20rpx;   /* 10px */
--vue-spacing-3: 30rpx;   /* 15px */
--vue-spacing-4: 40rpx;   /* 20px */
--vue-spacing-5: 50rpx;   /* 25px */
--vue-spacing-6: 60rpx;   /* 30px */
--vue-spacing-8: 80rpx;   /* 40px */
```

### 圆角系统

```css
/* 圆角变量 */
--vue-radius-xs: 8rpx;    /* 4px */
--vue-radius-sm: 12rpx;   /* 6px */
--vue-radius-md: 16rpx;   /* 8px */
--vue-radius-lg: 24rpx;   /* 12px */
--vue-radius-xl: 32rpx;   /* 16px */
--vue-radius-2xl: 48rpx;  /* 24px */
--vue-radius-full: 9999rpx;
```

## 🌓 主题系统

### 主题类型

1. **浅色主题** (`light`) - 默认明亮主题
2. **深色主题** (`dark`) - 护眼深色主题
3. **护眼主题** (`eye-care`) - 温和护眼主题
4. **系统主题** (`system`) - 跟随系统设置

### 主题切换

```vue
<template>
  <!-- 使用主题切换组件 -->
  <ThemeToggle
    :enhanced-mode="true"
    @theme-changed="handleThemeChange"
  />

  <!-- 或者手动切换 -->
  <button @click="themeStore.setTheme('dark')">
    切换深色主题
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const handleThemeChange = (theme) => {
  console.log('主题已切换:', theme)
}
</script>
```

### 主题变量使用

```css
/* 在样式中使用主题变量 */
.my-component {
  background-color: var(--vue-background);
  color: var(--vue-foreground);
  border-color: var(--vue-border);
  transition: all var(--vue-transition-normal);
}

/* 深色主题特定样式 */
.dark .my-component {
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
}
```

### 主题动画

```vue
<template>
  <view class="theme-transition">
    <!-- 页面内容 -->
  </view>
</template>

<style>
.theme-transition,
.theme-transition * {
  transition: background-color var(--vue-transition-slow),
              color var(--vue-transition-slow),
              border-color var(--vue-transition-slow);
}
</style>
```

## 🧩 组件库

### 按钮组件

```vue
<template>
  <!-- 主要按钮 -->
  <button class="vue-btn vue-btn-primary">
    主要按钮
  </button>

  <!-- 次要按钮 -->
  <button class="vue-btn vue-btn-secondary">
    次要按钮
  </button>

  <!-- 尺寸变体 -->
  <button class="vue-btn vue-btn-sm">小按钮</button>
  <button class="vue-btn vue-btn-lg">大按钮</button>

  <!-- 状态变体 -->
  <button class="vue-btn vue-btn-success">成功</button>
  <button class="vue-btn vue-btn-warning">警告</button>
  <button class="vue-btn vue-btn-error">错误</button>
</template>
```

### 卡片组件

```vue
<template>
  <view class="vue-card">
    <view class="vue-card-header">
      <text class="vue-card-title">卡片标题</text>
    </view>

    <view class="vue-card-content">
      卡片内容
    </view>

    <view class="vue-card-footer">
      <button class="vue-btn vue-btn-primary">操作</button>
    </view>
  </view>
</template>
```

### 输入框组件

```vue
<template>
  <input
    class="vue-input"
    placeholder="请输入内容"
    v-model="inputValue"
  />

  <textarea
    class="vue-textarea"
    placeholder="请输入多行内容"
    v-model="textareaValue"
  />
</template>
```

### 徽章组件

```vue
<template>
  <view class="vue-badge vue-badge-primary">主要</view>
  <view class="vue-badge vue-badge-success">成功</view>
  <view class="vue-badge vue-badge-warning">警告</view>
  <view class="vue-badge vue-badge-error">错误</view>
</template>
```

### 警告框组件

```vue
<template>
  <view class="vue-alert vue-alert-success">
    <text>操作成功！</text>
  </view>

  <view class="vue-alert vue-alert-warning">
    <text>请注意相关事项</text>
  </view>

  <view class="vue-alert vue-alert-error">
    <text>操作失败，请重试</text>
  </view>
</template>
```

### 进度条组件

```vue
<template>
  <view class="vue-progress">
    <view
      class="vue-progress-bar"
      :style="{ width: progress + '%' }"
    ></view>
  </view>
</template>

<script setup>
const progress = ref(60)
</script>
```

### 加载组件

```vue
<template>
  <view class="vue-loading">
    <view class="vue-loading-spinner"></view>
    <text>加载中...</text>
  </view>
</template>
```

### 空状态组件

```vue
<template>
  <view class="vue-empty">
    <view class="vue-empty-icon">📚</view>
    <text class="vue-empty-title">暂无内容</text>
    <text class="vue-empty-description">这里还没有任何内容</text>
    <button class="vue-btn vue-btn-primary">添加内容</button>
  </view>
</template>
```

## 🛠 工具类

### 布局工具类

```vue
<template>
  <!-- Flexbox 布局 -->
  <view class="vue-flex vue-items-center vue-justify-between">
    <text>左侧内容</text>
    <text>右侧内容</text>
  </view>

  <!-- Grid 布局 -->
  <view class="vue-grid vue-grid-cols-2">
    <view class="vue-p-4">项目 1</view>
    <view class="vue-p-4">项目 2</view>
  </view>
</template>
```

### 间距工具类

```vue
<template>
  <!-- 内边距 -->
  <view class="vue-p-4">四周内边距</view>
  <view class="vue-px-4 vue-py-2">水平内边距</view>

  <!-- 外边距 -->
  <view class="vue-m-4">四周外边距</view>
  <view class="vue-mt-4 vue-mb-2">上下外边距</view>
</template>
```

### 文本工具类

```vue
<template>
  <!-- 文本对齐 -->
  <text class="vue-text-left">左对齐</text>
  <text class="vue-text-center">居中对齐</text>
  <text class="vue-text-right">右对齐</text>

  <!-- 文本截断 -->
  <text class="vue-text-ellipsis">单行截断的文本内容</text>
  <text class="vue-text-ellipsis-2">两行截断的文本内容，超出的部分会显示省略号</text>

  <!-- 字体大小 -->
  <text class="vue-text-xs">小号文本</text>
  <text class="vue-text-base">基础文本</text>
  <text class="vue-text-2xl">大号文本</text>
</template>
```

### 显示工具类

```vue
<template>
  <!-- 显示控制 -->
  <view class="vue-block">块级元素</view>
  <view class="vue-hidden">隐藏元素</view>

  <!-- 位置控制 -->
  <view class="vue-relative">相对定位</view>
  <view class="vue-fixed">固定定位</view>
</template>
```

### 圆角工具类

```vue
<template>
  <view class="vue-rounded-sm">小圆角</view>
  <view class="vue-rounded-lg">大圆角</view>
  <view class="vue-rounded-full">完全圆角</view>
</template>
```

### 阴影工具类

```vue
<template>
  <view class="vue-shadow-sm">小阴影</view>
  <view class="vue-shadow-md">中等阴影</view>
  <view class="vue-shadow-xl">大阴影</view>
</template>
```

### 过渡工具类

```vue
<template>
  <view class="vue-transition-fast">快速过渡</view>
  <view class="vue-transition-normal">正常过渡</view>
  <view class="vue-transition-slow">慢速过渡</view>
</template>
```

## 📱 平台适配

### 微信小程序适配

```vue
<template>
  <!-- 安全区域适配 -->
  <view class="safe-area-top">
    <!-- 状态栏以下的内容 -->
  </view>

  <view class="safe-area-bottom">
    <!-- 底部安全区域内容 -->
  </view>

  <!-- 导航栏适配 -->
  <view class="nav-bar">
    <text>导航标题</text>
  </view>

  <!-- 底部导航适配 -->
  <view class="tab-bar">
    <text>底部导航</text>
  </view>
</template>
```

### H5 平台适配

```vue
<template>
  <!-- H5 特定优化 -->
  <view class="h5-performance">
    <!-- 内容 -->
  </view>

  <!-- 响应式设计 -->
  <view class="responsive-container">
    <!-- 响应式内容 -->
  </view>
</template>

<style>
/* H5 特定样式 */
/* #ifdef H5 */
.h5-performance {
  transform: translateZ(0);
  backface-visibility: hidden;
}
/* #endif */
</style>
```

### 条件编译

```vue
<template>
  <!-- 微信小程序专用 -->
  <!-- #ifdef MP-WEIXIN -->
  <button open-type="share">分享</button>
  <!-- #endif -->

  <!-- H5 专用 -->
  <!-- #ifdef H5 -->
  <a href="/download">下载应用</a>
  <!-- #endif -->

  <!-- 通用内容 -->
  <view class="common-content">通用内容</view>
</template>

<script>
// 条件编译的 JavaScript
// #ifdef MP-WEIXIN
wx.showShareMenu()
// #endif

// #ifdef H5
window.addEventListener('scroll', handleScroll)
// #endif
</script>

<style>
/* 条件编译的样式 */
/* #ifdef MP-WEIXIN */
.mp-specific {
  /* 小程序专用样式 */
}
/* #endif */

/* #ifdef H5 */
.h5-specific {
  /* H5 专用样式 */
}
/* #endif */
</style>
```

## ⚡ 性能优化

### GPU 加速

```vue
<template>
  <view class="gpu-accelerated">
    <!-- 需要GPU加速的内容 -->
  </view>
</template>

<style>
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
```

### 懒加载优化

```vue
<template>
  <!-- 图片懒加载 -->
  <image
    class="lazy-image"
    :src="imageSrc"
    lazy-load
    @load="handleImageLoad"
  />

  <!-- 列表懒加载 -->
  <scroll-view
    scroll-y
    @scrolltolower="loadMore"
    class="lazy-list"
  >
    <view
      v-for="item in visibleItems"
      :key="item.id"
      class="lazy-list-item"
    >
      {{ item.content }}
    </view>
  </scroll-view>
</template>

<script setup>
const imageSrc = ref('')
const visibleItems = ref([])

const handleImageLoad = () => {
  console.log('图片加载完成')
}

const loadMore = () => {
  // 加载更多数据
}
</script>

<style>
.lazy-image {
  background-color: var(--vue-muted);
  min-height: 200rpx;
}

.lazy-list {
  height: 100vh;
  contain: layout style paint;
}
</style>
```

### 动画性能优化

```vue
<template>
  <view
    class="animate-fadeIn gpu-accelerated"
    :class="{ 'will-change-transform': isAnimating }"
  >
    <!-- 动画内容 -->
  </view>
</template>

<script setup>
const isAnimating = ref(false)

const startAnimation = () => {
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 300)
}
</script>

<style>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
  will-change: opacity;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateZ(0);
  }
  to {
    opacity: 1;
    transform: translateZ(0);
  }
}
</style>
```

### 内容可见性优化

```vue
<template>
  <!-- 大型列表优化 -->
  <view class="large-list">
    <view
      v-for="(item, index) in items"
      :key="item.id"
      class="large-list-item"
      :style="{
        contentVisibility: index > visibleThreshold ? 'hidden' : 'auto',
        containIntrinsicSize: '100px'
      }"
    >
      {{ item.content }}
    </view>
  </view>
</template>

<script setup>
const items = ref([])
const visibleThreshold = ref(20)
</script>

<style>
.large-list {
  contain: layout style paint;
}

.large-list-item {
  contain: layout style;
  transform: translateZ(0);
}
</style>
```

## 📖 开发指南

### 项目结构

```
frontend/src/
├── styles/                 # 样式文件
│   ├── index.css          # 主样式入口
│   ├── design-system.css  # 设计系统
│   ├── vue-ui-system.css # Vue UI系统
│   ├── theme.css         # 主题样式
│   ├── platform-adapt.css # 平台适配
│   ├── performance.css   # 性能优化
│   └── themes/           # 主题变体
├── components/            # 组件目录
│   ├── ui/              # UI组件库
│   └── ...             # 业务组件
├── stores/              # 状态管理
├── pages/               # 页面文件
└── App.vue             # 应用入口
```

### 使用设计系统

1. **导入样式系统**

```vue
<style>
/* 在组件中导入 */
@import '@/styles/index.css';
</style>
```

2. **使用主题变量**

```css
.my-component {
  background-color: var(--vue-background);
  color: var(--vue-foreground);
  border-radius: var(--vue-radius-md);
  transition: all var(--vue-transition-normal);
}
```

3. **使用工具类**

```vue
<template>
  <view class="vue-card vue-p-4 vue-mb-4">
    <text class="vue-text-lg vue-font-semibold">
      标题文本
    </text>
    <text class="vue-text-base vue-mt-2">
      内容文本
    </text>
  </view>
</template>
```

### 创建新组件

1. **组件模板**

```vue
<template>
  <view
    class="vue-component"
    :class="themeClasses"
    :style="componentStyles"
  >
    <!-- 组件内容 -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

// 组件属性
interface Props {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

// 主题系统
const { themeClasses } = useTheme()

// 计算样式
const componentStyles = computed(() => ({
  '--component-size': props.size === 'sm' ? 'var(--vue-text-sm)' :
                    props.size === 'lg' ? 'var(--vue-text-lg)' :
                    'var(--vue-text-base)',
  opacity: props.disabled ? 0.5 : 1
}))
</script>

<style scoped>
.vue-component {
  /* 基础样式 */
  background-color: var(--vue-card);
  color: var(--vue-foreground);
  border-radius: var(--vue-radius-md);
  font-size: var(--component-size);
  transition: all var(--vue-transition-normal);
}

.vue-component:hover {
  box-shadow: var(--vue-shadow-md);
}

.vue-component:disabled {
  cursor: not-allowed;
}
</style>
```

2. **组件注册**

```typescript
// 在 src/components/index.ts 中注册
import VueComponent from './VueComponent.vue'

export {
  VueComponent
}
```

### 主题定制

1. **自定义主题变量**

```css
:root {
  --custom-primary: oklch(0.6 0.2 280);
  --custom-secondary: oklch(0.9 0.1 200);
}

.dark {
  --custom-primary: oklch(0.7 0.2 280);
  --custom-secondary: oklch(0.8 0.1 200);
}
```

2. **使用自定义主题**

```vue
<style>
.custom-component {
  background-color: var(--custom-primary);
  color: var(--custom-secondary);
}
</style>
```

### 响应式设计

```vue
<template>
  <view class="responsive-layout">
    <view class="responsive-grid">
      <!-- 响应式网格内容 -->
    </view>
  </view>
</template>

<style>
.responsive-layout {
  width: 100%;
  max-width: 1200rpx;
  margin: 0 auto;
  padding: 0 var(--vue-spacing-4);
}

.responsive-grid {
  display: grid;
  gap: var(--vue-spacing-4);
  grid-template-columns: 1fr;
}

/* 平板设备 */
@media screen and (min-width: 750rpx) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面设备 */
@media screen and (min-width: 1200rpx) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
```

## 🔧 故障排除

### 常见问题

#### 1. 样式不生效

**问题**: 组件样式没有正确应用

**解决方案**:
- 确保导入了主样式文件
- 检查 CSS 变量是否正确定义
- 确认类名拼写正确
- 检查样式优先级

```vue
<!-- 确保导入样式 -->
<style>
@import '@/styles/index.css';
</style>
```

#### 2. 主题切换无效

**问题**: 主题切换后样式没有更新

**解决方案**:
- 确保使用了 CSS 变量
- 检查主题类名是否正确添加
- 确认主题过渡动画类是否存在

```vue
<template>
  <view class="theme-transition">
    <!-- 需要主题切换的内容 -->
  </view>
</template>
```

#### 3. 微信小程序兼容问题

**问题**: 在微信小程序中样式异常

**解决方案**:
- 检查条件编译是否正确
- 确认使用了小程序支持的 CSS 属性
- 检查 rpx 单位使用是否正确

```css
/* 小程序适配 */
/* #ifdef MP-WEIXIN */
.mp-component {
  /* 小程序专用样式 */
}
/* #endif */
```

#### 4. 性能问题

**问题**: 页面滚动或动画卡顿

**解决方案**:
- 使用 GPU 加速
- 减少重绘和回流
- 优化图片加载
- 使用虚拟滚动

```css
.performance-optimized {
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}
```

#### 5. 响应式布局问题

**问题**: 在不同设备上布局异常

**解决方案**:
- 检查媒体查询是否正确
- 确认 rpx 单位使用是否合理
- 测试不同屏幕尺寸

```css
@media screen and (max-width: 750rpx) {
  .responsive {
    /* 小屏幕样式 */
  }
}
```

### 调试技巧

#### 1. 开启调试模式

```javascript
// 在开发环境启用调试
if (process.env.NODE_ENV === 'development') {
  console.log('Design System Debug Mode')

  // 添加调试类
  document.body.classList.add('debug-performance')
}
```

#### 2. 性能监控

```javascript
// 监控页面性能
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Performance Entry:', entry)
  }
})

observer.observe({ entryTypes: ['navigation', 'paint'] })
```

#### 3. 主题调试

```vue
<template>
  <view>
    <!-- 主题调试工具 -->
    <view class="theme-debug">
      <text>当前主题: {{ currentTheme }}</text>
      <button @click="toggleTheme">切换主题</button>
    </view>
  </view>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>
```

### 最佳实践

1. **保持一致性**: 使用设计系统的变量和工具类
2. **性能优先**: 合理使用 GPU 加速和懒加载
3. **响应式设计**: 确保在不同设备上都有良好体验
4. **无障碍支持**: 添加适当的 ARIA 标签和键盘导航
5. **代码规范**: 遵循项目的代码风格和命名规范

## 📞 支持

如果在开发过程中遇到问题，可以：

1. 查看项目文档和示例代码
2. 检查控制台错误信息
3. 使用调试工具进行排查
4. 联系开发团队获取帮助

---

**更新日期**: 2025年10月29日
**版本**: v1.0.0
**维护者**: Vue Design System Team