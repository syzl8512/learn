# 设计系统使用指南 - 英语分级阅读项目

## 📋 概述

本项目采用基于 oklch 颜色空间的现代化设计系统，支持浅色/深色主题切换，响应式布局，以及完整的无障碍支持。

## 🎨 设计系统架构

### 核心文件结构
```
frontend/src/styles/
├── index.css           # 主样式文件（入口）
├── design-system.css   # 设计系统基础
├── theme.css          # 主题系统
└── pages.css          # 页面组件样式

frontend/src/components/
├── ThemeToggle.vue    # 主题切换组件
└── AppLayout.vue      # 应用布局组件
```

## 🚀 快速开始

### 1. 导入样式文件

在主应用文件中导入样式：

```javascript
// main.js 或 App.vue
import '@/styles/index.css'
```

### 2. 使用布局组件

```vue
<template>
  <AppLayout ref="appLayout">
    <!-- 你的页面内容 -->
    <router-view />
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue'
</script>
```

### 3. 使用主题切换

主题切换按钮已集成在 `AppLayout` 中，也可以单独使用：

```vue
<template>
  <ThemeToggle />
</template>

<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>
```

## 🎯 核心特性

### 颜色系统

使用 oklch 颜色空间，提供更好的颜色一致性：

```css
:root {
  --primary: oklch(0.6056 0.2189 292.7172);
  --background: oklch(1.0000 0 0);
  --foreground: oklch(0.3588 0.1354 278.6973);
}
```

### 主题支持

- **浅色主题**: 默认的明亮主题
- **深色主题**: 适合夜间使用
- **系统主题**: 自动跟随系统设置

### 响应式设计

采用移动端优先的响应式设计：

```css
/* 基础样式 */
.container {
  padding: var(--spacing-md);
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-xl);
  }
}
```

## 🛠️ 组件样式指南

### 按钮

使用统一的按钮样式类：

```html
<!-- 主要按钮 -->
<button class="btn btn-primary">主要操作</button>

<!-- 次要按钮 -->
<button class="btn btn-secondary">次要操作</button>

<!-- 轮廓按钮 -->
<button class="btn btn-outline">轮廓按钮</button>

<!-- 危险按钮 -->
<button class="btn btn-destructive">删除操作</button>
```

### 卡片

使用卡片容器：

```html
<div class="card">
  <div class="card-header">
    <h3>卡片标题</h3>
  </div>
  <div class="card-content">
    <p>卡片内容</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">操作</button>
  </div>
</div>
```

### 表单

表单元素样式：

```html
<div class="form-group">
  <label class="label">用户名</label>
  <input type="text" class="input" placeholder="请输入用户名" />
</div>

<div class="form-group">
  <label class="label">密码</label>
  <input type="password" class="input" placeholder="请输入密码" />
</div>
```

### 通知系统

使用 `AppLayout` 组件的通知功能：

```javascript
// 获取布局组件引用
const appLayout = ref(null)

// 显示成功通知
appLayout.value?.showSuccess('操作成功！')

// 显示错误通知
appLayout.value?.showError('操作失败，请重试')

// 显示警告通知
appLayout.value?.showWarning('请注意相关风险')

// 显示信息通知
appLayout.value?.showInfo('系统提示信息')
```

## 🎨 颜色使用指南

### 主色调

```css
.primary-bg      { background-color: var(--primary); }
.primary-text    { color: var(--primary); }
.primary-border  { border-color: var(--primary); }
```

### 语义化颜色

```css
.success-bg      { background-color: var(--chart-1); }
.error-bg        { background-color: var(--destructive); }
.warning-bg      { background-color: #f59e0b; }
.info-bg         { background-color: var(--primary); }
```

### 中性色

```css
.background-bg   { background-color: var(--background); }
.card-bg         { background-color: var(--card); }
.muted-bg        { background-color: var(--muted); }
```

## 📐 间距系统

使用统一的间距变量：

```css
.spacing-xs      { padding: var(--spacing-xs); }    /* 4px */
.spacing-sm      { padding: var(--spacing-sm); }    /* 8px */
.spacing-md      { padding: var(--spacing-md); }    /* 16px */
.spacing-lg      { padding: var(--spacing-lg); }    /* 24px */
.spacing-xl      { padding: var(--spacing-xl); }    /* 32px */
.spacing-2xl     { padding: var(--spacing-2xl); }   /* 48px */
.spacing-3xl     { padding: var(--spacing-3xl); }   /* 64px */
```

## 🅰️ 字体系统

### 字体族

```css
.font-sans       { font-family: var(--font-sans); }      /* 无衬线 */
.font-serif      { font-family: var(--font-serif); }     /* 衬线 */
.font-mono       { font-family: var(--font-mono); }      /* 等宽 */
```

### 字体大小

```css
.text-xs         { font-size: var(--text-xs); }      /* 12px */
.text-sm         { font-size: var(--text-sm); }      /* 14px */
.text-base       { font-size: var(--text-base); }    /* 16px */
.text-lg         { font-size: var(--text-lg); }      /* 18px */
.text-xl         { font-size: var(--text-xl); }      /* 20px */
.text-2xl        { font-size: var(--text-2xl); }     /* 24px */
.text-3xl        { font-size: var(--text-3xl); }     /* 30px */
.text-4xl        { font-size: var(--text-4xl); }     /* 36px */
```

## 🌙 主题定制

### 自定义主题变量

```css
:root {
  /* 自定义主色调 */
  --primary: oklch(0.6 0.2 280);
  --primary-foreground: oklch(1 0 0);

  /* 自定义圆角 */
  --radius: 0.75rem;

  /* 自定义阴影 */
  --shadow: 0 2px 8px oklch(0 0 0 / 0.1);
}
```

### 暗色主题定制

```css
.dark {
  /* 暗色主题下的自定义颜色 */
  --card: oklch(0.2 0.1 280);
  --muted: oklch(0.25 0.1 280);
}
```

## 📱 响应式工具类

### 显示控制

```html
<!-- 移动端隐藏，平板显示 -->
<div class="mobile-hidden md:block">内容</div>

<!-- 移动端显示，桌面隐藏 -->
<div class="block lg:hidden">内容</div>
```

### 布局控制

```html
<!-- 移动端垂直，桌面水平 -->
<div class="flex flex-col md:flex-row">
  <div>内容1</div>
  <div>内容2</div>
</div>
```

## ♿ 无障碍支持

### 焦点管理

```html
<!-- 添加焦点环 -->
<button class="focus-ring">按钮</button>
```

### 屏幕阅读器支持

```html
<!-- 跳过链接 -->
<a href="#main-content" class="skip-link">跳到主要内容</a>

<!-- 屏幕阅读器专用文本 -->
<span class="sr-only">隐藏的辅助文本</span>
```

### 减少动画支持

系统会自动检测用户的减少动画偏好：

```css
@media (prefers-reduced-motion: reduce) {
  /* 动画会被自动禁用 */
}
```

## 🎭 动画效果

### 内置动画类

```html
<div class="animate-fade-in">淡入动画</div>
<div class="animate-slide-up">向上滑入</div>
<div class="animate-scale-in">缩放进入</div>
```

### 过渡效果

```css
.custom-element {
  transition: all var(--transition-normal);
}
```

## 🔧 开发工具

### 主题调试

在浏览器控制台中调试主题：

```javascript
// 切换到深色主题
document.documentElement.classList.add('dark')

// 切换到浅色主题
document.documentElement.classList.remove('dark')

// 查看当前主题
console.log(getComputedStyle(document.documentElement).getPropertyValue('--primary'))
```

### 样式检查

使用浏览器开发者工具检查样式应用情况，所有设计系统变量都以 `--` 开头。

## 📋 最佳实践

### 1. 统一使用设计令牌

```css
/* ✅ 好的做法 */
.my-component {
  padding: var(--spacing-md);
  background-color: var(--card);
  border-radius: var(--radius-lg);
}

/* ❌ 避免的做法 */
.my-component {
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
}
```

### 2. 语义化使用颜色

```css
/* ✅ 好的做法 */
.success-message {
  color: var(--chart-1);
  background-color: oklch(from var(--chart-1) l c h / 0.1);
}

/* ❌ 避免的做法 */
.success-message {
  color: #10b981;
  background-color: #f0fdf4;
}
```

### 3. 响应式优先

```css
/* ✅ 好的做法 */
.my-grid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .my-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ❌ 避免的做法 */
.my-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
```

## 🚀 性能优化

### 1. CSS 变量缓存

系统会自动缓存常用的颜色变量，减少计算开销。

### 2. 条件加载

根据设备特性加载不同的样式：

```css
/* 只在支持现代特性的浏览器中加载 */
@supports (color: oklch(1 0 0)) {
  .modern-feature {
    /* 现代样式 */
  }
}
```

### 3. GPU 加速

对动画元素启用 GPU 加速：

```html
<div class="gpu-accelerated animate-slide-up">
  动画内容
</div>
```

## 🔍 故障排除

### 常见问题

1. **主题切换不生效**
   - 确保导入了 `theme.css` 文件
   - 检查是否有其他样式覆盖了 CSS 变量

2. **响应式布局异常**
   - 确保设置了正确的 viewport meta 标签
   - 检查媒体查询的断点设置

3. **颜色显示异常**
   - 检查浏览器是否支持 oklch 颜色空间
   - 提供备用的 RGB 颜色值

### 调试技巧

1. 使用浏览器开发工具的 CSS 变量检查功能
2. 在不同设备和浏览器上测试主题切换
3. 检查控制台是否有 CSS 解析错误

## 📚 参考资源

- [oklch 颜色空间规范](https://www.w3.org/TR/css-color-4/#ok-lab)
- [CSS 自定义属性最佳实践](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [无障碍设计指南](https://www.w3.org/WAI/WCAG21/quickref/)

---

**最后更新**: 2026-02-01
**版本**: v1.0.0
**维护者**: 开发团队