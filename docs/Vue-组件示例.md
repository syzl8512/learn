# Vue 3 + Taro 组件示例

**版本**: 1.0
**日期**: 2025-10-25
**框架**: Vue 3 + TypeScript + Taro 4.x
**目的**: 为前端开发提供核心交互组件的参考实现

---

## 📋 目录

1. [项目结构](#项目结构)
2. [读书页组件](#读书页组件)
3. [听力播放器](#听力播放器)
4. [生词本管理](#生词本管理)
5. [蓝斯值选择器](#蓝斯值选择器)
6. [通用工具](#通用工具)

---

## 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── Reading/
│   │   │   ├── ReadingPage.vue        # 读书页面
│   │   │   ├── ChapterContent.vue     # 章节内容显示
│   │   │   ├── WordPopover.vue        # 单词弹窗
│   │   │   └── VersionSwitcher.vue    # 版本切换器
│   │   ├── Listening/
│   │   │   ├── ListeningPage.vue      # 听力列表页
│   │   │   ├── AudioPlayer.vue        # 音频播放器
│   │   │   └── FocusMode.vue          # 专注模式
│   │   ├── Vocabulary/
│   │   │   ├── VocabularyBook.vue     # 生词本
│   │   │   ├── VocabularyCard.vue     # 生词卡片
│   │   │   └── ExportModal.vue        # 导出对话框
│   │   ├── LexileSelector/
│   │   │   ├── LexileSelector.vue     # 蓝斯值选择器
│   │   │   ├── QuickSelect.vue        # 快速选择 (4档)
│   │   │   └── AiAssessment.vue       # AI 判定
│   │   └── Common/
│   │       ├── TabBar.vue             # 底部标签栏
│   │       └── Loading.vue            # 加载动画
│   ├── stores/
│   │   ├── user.ts                    # 用户状态
│   │   ├── reading.ts                 # 阅读状态
│   │   └── vocabulary.ts              # 词汇状态
│   ├── services/
│   │   ├── api.ts                     # API 调用
│   │   ├── wechat.ts                  # 微信相关
│   │   └── audio.ts                   # 音频处理
│   └── styles/
│       └── globals.css                # 全局样式
```

---

## 读书页组件

### 1. ReadingPage.vue (主容器)

```vue
<template>
  <view class="reading-page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="title">{{ book.title }}</view>
      <view class="chapter-name">{{ chapter.title }}</view>
    </view>

    <!-- 版本切换器 -->
    <VersionSwitcher
      :current-version="currentVersion"
      :available-versions="availableVersions"
      @change="switchVersion"
    />

    <!-- 章节内容 -->
    <ChapterContent
      :content="chapterContent"
      :version="currentVersion"
      @word-click="showWordPopover"
      @bookmark="saveBookmark"
    />

    <!-- 单词弹窗 -->
    <WordPopover
      v-if="selectedWord"
      :word="selectedWord"
      :visible="showPopover"
      @close="showPopover = false"
      @add-to-vocabulary="addToVocabulary"
    />

    <!-- 底部控制栏 -->
    <view class="footer-controls">
      <button @click="previousChapter">← 上一章</button>
      <button @click="toggleAudio">
        {{ isPlaying ? '⏸ 暂停' : '▶ 朗读' }}
      </button>
      <button @click="nextChapter">下一章 →</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useReadingStore } from '@/stores/reading';
import Taro from '@tarojs/taro';
import ChapterContent from './ChapterContent.vue';
import VersionSwitcher from './VersionSwitcher.vue';
import WordPopover from './WordPopover.vue';

// 定义类型
interface Book {
  id: string;
  title: string;
  author: string;
}

interface Chapter {
  id: string;
  title: string;
  sequence: number;
  content: string;
}

interface Word {
  word: string;
  pronunciation: string;
  meaning: string;
  chineseTranslation: string;
  examples: string[];
}

// 响应式数据
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const readingStore = useReadingStore();

const book = ref<Book>({} as Book);
const chapter = ref<Chapter>({} as Chapter);
const chapterContent = ref('');
const currentVersion = ref('auto');
const availableVersions = ref(['original', 'easy', 'ket', 'pet']);
const showPopover = ref(false);
const selectedWord = ref<Word | null>(null);
const isPlaying = ref(false);

// 计算属性
const bookId = computed(() => route.params.bookId as string);
const chapterId = computed(() => route.params.chapterId as string);

// 方法
const fetchChapter = async () => {
  try {
    const response = await Taro.request({
      url: `/api/chapters/${chapterId.value}?version=${currentVersion.value}`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    if (response.statusCode === 200) {
      const data = response.data.data;
      chapterContent.value = data.content;
      chapter.value = data;
    }
  } catch (error) {
    Taro.showToast({
      title: '加载失败',
      icon: 'error',
    });
  }
};

const switchVersion = (version: string) => {
  currentVersion.value = version;
  fetchChapter();

  // 记录切换事件
  readingStore.recordVersionSwitch(chapterId.value, version);
};

const showWordPopover = async (word: string, x: number, y: number) => {
  try {
    const response = await Taro.request({
      url: `/api/chapters/${chapterId.value}/word-lookup?word=${word}`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    if (response.statusCode === 200) {
      selectedWord.value = response.data.data;
      showPopover.value = true;
    }
  } catch (error) {
    Taro.showToast({
      title: '查词失败',
      icon: 'error',
    });
  }
};

const addToVocabulary = async (word: Word) => {
  try {
    await Taro.request({
      url: '/api/vocabulary',
      method: 'POST',
      data: {
        word: word.word,
        meaning: word.meaning,
        chineseTranslation: word.chineseTranslation,
        pronunciation: word.pronunciation,
        sourceChapterId: chapterId.value,
      },
      header: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    Taro.showToast({
      title: '已添加到生词本',
      icon: 'success',
      duration: 1500,
    });

    showPopover.value = false;
  } catch (error) {
    Taro.showToast({
      title: '添加失败',
      icon: 'error',
    });
  }
};

const toggleAudio = async () => {
  if (!chapter.value.audioUrl) {
    Taro.showToast({
      title: '该章节暂无音频',
      icon: 'error',
    });
    return;
  }

  isPlaying.value = !isPlaying.value;
  // 实现音频播放逻辑
};

const previousChapter = async () => {
  if (chapter.value.sequence <= 1) {
    Taro.showToast({
      title: '已是第一章',
      icon: 'none',
    });
    return;
  }

  // 保存当前进度
  await saveProgress();

  // 导航到上一章
  const newChapterId = await getChapterIdBySequence(
    chapter.value.sequence - 1,
  );
  router.push(`/pages/reading/${bookId.value}/${newChapterId}`);
};

const nextChapter = async () => {
  // 保存当前进度
  await saveProgress();

  // 导航到下一章
  const newChapterId = await getChapterIdBySequence(
    chapter.value.sequence + 1,
  );
  router.push(`/pages/reading/${bookId.value}/${newChapterId}`);
};

const saveProgress = async () => {
  try {
    await Taro.request({
      url: `/api/chapters/${chapterId.value}/progress`,
      method: 'POST',
      data: {
        lastReadPosition: chapterContent.value.length,
        readingTimeSeconds: 300, // TODO: 实际计算
        currentVersion: currentVersion.value,
      },
      header: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

const saveBookmark = async (position: number) => {
  // TODO: 实现书签保存
};

const getChapterIdBySequence = async (sequence: number): Promise<string> => {
  // TODO: 实现通过章节号获取ID
  return '';
};

// 生命周期
onMounted(() => {
  fetchChapter();
});
</script>

<style scoped lang="css">
.reading-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  padding: 12px 16px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.chapter-name {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
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
  margin: 0 4px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
}
</style>
```

### 2. ChapterContent.vue (章节内容)

```vue
<template>
  <view class="chapter-content">
    <view class="text-container">
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
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    default: 'original',
  },
});

const emit = defineEmits(['word-click', 'bookmark']);

// 将内容分词
const words = computed(() => {
  // 简单的分词逻辑，实际应该使用更复杂的分词器
  return props.content.split(/(\s+|[.,!?;:])/).filter((w) => w.length > 0);
});

const isClickable = (word: string) => {
  // 过滤标点符号
  return /^[a-zA-Z]+$/i.test(word);
};

const handleWordClick = (word: string, event: Event) => {
  if (!isClickable(word)) return;

  const target = event.target as HTMLElement;
  const rect = target.getBoundingClientRect();

  emit('word-click', word.toLowerCase(), rect.left, rect.top);
};
</script>

<style scoped lang="css">
.chapter-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: white;
}

.text-container {
  line-height: 1.8;
  font-size: 16px;
  color: #333;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.word {
  display: inline;
}

.word.clickable {
  color: #007aff;
  border-bottom: 1px dotted #007aff;
  cursor: pointer;
}

.word.clickable:active {
  background-color: rgba(0, 122, 255, 0.1);
}
</style>
```

### 3. WordPopover.vue (单词弹窗)

```vue
<template>
  <view v-if="visible" class="popover-overlay" @click="closePopover">
    <view class="popover-content" @click.stop>
      <view class="popover-header">
        <view class="word-title">{{ word.word }}</view>
        <button class="close-btn" @click="closePopover">✕</button>
      </view>

      <view class="pronunciation">
        {{ word.pronunciation }}
      </view>

      <view class="meanings">
        <view class="meaning-item">
          <view class="label">英文释义:</view>
          <view class="content">{{ word.meaning }}</view>
        </view>
        <view class="meaning-item">
          <view class="label">中文翻译:</view>
          <view class="content">{{ word.chineseTranslation }}</view>
        </view>
      </view>

      <view v-if="word.examples && word.examples.length" class="examples">
        <view class="label">例句:</view>
        <view
          v-for="(example, idx) in word.examples"
          :key="idx"
          class="example-item"
        >
          {{ example }}
        </view>
      </view>

      <view class="actions">
        <button class="btn-add" @click="addToVocabulary">
          ❤ 添加到生词本
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps({
  word: {
    type: Object,
    required: true,
  },
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close', 'add-to-vocabulary']);

const closePopover = () => {
  emit('close');
};

const addToVocabulary = () => {
  emit('add-to-vocabulary', props.word);
};
</script>

<style scoped lang="css">
.popover-overlay {
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

.popover-content {
  width: 100%;
  max-height: 60vh;
  background-color: white;
  border-radius: 12px 12px 0 0;
  padding: 20px;
  overflow-y: auto;
}

.popover-header {
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
  cursor: pointer;
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

.examples {
  margin-bottom: 16px;
}

.example-item {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  padding-left: 12px;
  border-left: 3px solid #007aff;
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
  cursor: pointer;
}

.btn-add:active {
  background-color: #ee5a52;
}
</style>
```

---

## 听力播放器

### 1. AudioPlayer.vue

```vue
<template>
  <view class="audio-player">
    <!-- 进度条 -->
    <view class="progress-bar">
      <view
        class="progress-fill"
        :style="{ width: progressPercent + '%' }"
      ></view>
      <input
        type="range"
        min="0"
        :max="duration"
        :value="currentTime"
        class="progress-slider"
        @change="seekTo"
      />
    </view>

    <!-- 时间显示 -->
    <view class="time-info">
      <view class="current-time">{{ formatTime(currentTime) }}</view>
      <view class="total-time">{{ formatTime(duration) }}</view>
    </view>

    <!-- 控制按钮 -->
    <view class="controls">
      <button @click="togglePlayPause" class="btn-play">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>

      <!-- 语速调节 -->
      <view class="speed-control">
        <button
          v-for="speed in [0.75, 1.0, 1.25, 1.5]"
          :key="speed"
          :class="{ active: playbackSpeed === speed }"
          @click="setSpeed(speed)"
        >
          {{ speed }}x
        </button>
      </view>

      <!-- 字幕开关 -->
      <button @click="toggleSubtitles" class="btn-subtitle">
        {{ showSubtitles ? '中文' : '英文' }}
      </button>
    </view>

    <!-- 字幕显示 -->
    <view v-if="showSubtitles" class="subtitles">
      <view class="current-subtitle">
        {{ currentSubtitle }}
      </view>
    </view>

    <!-- 音频元素 (Taro 支持) -->
    <audio
      ref="audioElement"
      :src="audioUrl"
      @timeupdate="updateProgress"
      @ended="onAudioEnded"
    ></audio>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  audioUrl: {
    type: String,
    required: true,
  },
  subtitles: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['ended']);

const audioElement = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const playbackSpeed = ref(1.0);
const showSubtitles = ref(true);

const progressPercent = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

const currentSubtitle = computed(() => {
  const subtitle = props.subtitles.find(
    (s: any) =>
      currentTime.value >= s.startTime && currentTime.value < s.endTime,
  );
  return subtitle
    ? showSubtitles.value
      ? subtitle.chinese
      : subtitle.english
    : '';
});

const togglePlayPause = () => {
  if (!audioElement.value) return;

  if (isPlaying.value) {
    audioElement.value.pause();
  } else {
    audioElement.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

const setSpeed = (speed: number) => {
  if (!audioElement.value) return;
  playbackSpeed.value = speed;
  audioElement.value.playbackRate = speed;
};

const toggleSubtitles = () => {
  showSubtitles.value = !showSubtitles.value;
};

const seekTo = (event: Event) => {
  if (!audioElement.value) return;
  const target = event.target as HTMLInputElement;
  audioElement.value.currentTime = parseFloat(target.value);
};

const updateProgress = () => {
  if (!audioElement.value) return;
  currentTime.value = audioElement.value.currentTime;
  duration.value = audioElement.value.duration;
};

const onAudioEnded = () => {
  isPlaying.value = false;
  emit('ended');
};

const formatTime = (seconds: number): string => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

onMounted(() => {
  if (audioElement.value) {
    audioElement.value.playbackRate = playbackSpeed.value;
  }
});
</script>

<style scoped lang="css">
.audio-player {
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  margin: 16px;
}

.progress-bar {
  position: relative;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  margin-bottom: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #007aff;
  transition: width 0.1s linear;
}

.progress-slider {
  position: absolute;
  top: -6px;
  left: 0;
  width: 100%;
  height: 16px;
  cursor: pointer;
  opacity: 0;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.controls {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.btn-play {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #007aff;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.speed-control {
  display: flex;
  gap: 4px;
  flex: 1;
}

.speed-control button {
  flex: 1;
  padding: 6px;
  background-color: #f0f0f0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.speed-control button.active {
  background-color: #007aff;
  color: white;
  border-color: #007aff;
}

.btn-subtitle {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.subtitles {
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  text-align: center;
}

.current-subtitle {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  min-height: 24px;
}

audio {
  display: none;
}
</style>
```

---

## 生词本管理

### VocabularyBook.vue

```vue
<template>
  <view class="vocabulary-book">
    <!-- 统计信息 -->
    <view class="stats">
      <view class="stat-item">
        <view class="stat-value">{{ statistics.totalWords }}</view>
        <view class="stat-label">总词数</view>
      </view>
      <view class="stat-item">
        <view class="stat-value">{{ statistics.masteredWords }}</view>
        <view class="stat-label">已掌握</view>
      </view>
      <view class="stat-item">
        <view class="stat-value">{{ statistics.newWords }}</view>
        <view class="stat-label">新词数</view>
      </view>
    </view>

    <!-- 筛选和导出 -->
    <view class="toolbar">
      <button
        :class="{ active: filterMastered === 'all' }"
        @click="filterMastered = 'all'"
      >
        全部
      </button>
      <button
        :class="{ active: filterMastered === 'new' }"
        @click="filterMastered = 'new'"
      >
        未掌握
      </button>
      <button @click="showExportModal = true">导出</button>
    </view>

    <!-- 生词列表 -->
    <view class="vocabulary-list">
      <VocabularyCard
        v-for="vocab in filteredVocabulary"
        :key="vocab.id"
        :vocab="vocab"
        @master="markAsMastered"
        @delete="deleteVocab"
      />
    </view>

    <!-- 导出对话框 -->
    <ExportModal
      v-if="showExportModal"
      @export="handleExport"
      @close="showExportModal = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Taro from '@tarojs/taro';
import { useUserStore } from '@/stores/user';
import VocabularyCard from './VocabularyCard.vue';
import ExportModal from './ExportModal.vue';

interface Vocabulary {
  id: string;
  word: string;
  chineseTranslation: string;
  meaning: string;
  pronunciation: string;
  mastered: boolean;
  addedAt: string;
}

const userStore = useUserStore();
const vocabulary = ref<Vocabulary[]>([]);
const filterMastered = ref('all');
const showExportModal = ref(false);

const statistics = computed(() => ({
  totalWords: vocabulary.value.length,
  masteredWords: vocabulary.value.filter((v) => v.mastered).length,
  newWords: vocabulary.value.filter((v) => !v.mastered).length,
}));

const filteredVocabulary = computed(() => {
  if (filterMastered.value === 'all') {
    return vocabulary.value;
  }
  return vocabulary.value.filter((v) => !v.mastered);
});

const fetchVocabulary = async () => {
  try {
    const response = await Taro.request({
      url: '/api/vocabulary?limit=1000',
      method: 'GET',
      header: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    if (response.statusCode === 200) {
      vocabulary.value = response.data.data.items;
    }
  } catch (error) {
    console.error('Failed to fetch vocabulary:', error);
  }
};

const markAsMastered = async (vocabId: string) => {
  try {
    await Taro.request({
      url: `/api/vocabulary/${vocabId}/master`,
      method: 'PATCH',
      header: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    // 更新本地状态
    const vocab = vocabulary.value.find((v) => v.id === vocabId);
    if (vocab) {
      vocab.mastered = true;
    }
  } catch (error) {
    console.error('Failed to mark as mastered:', error);
  }
};

const deleteVocab = async (vocabId: string) => {
  try {
    // TODO: 实现删除接口
    vocabulary.value = vocabulary.value.filter((v) => v.id !== vocabId);
  } catch (error) {
    console.error('Failed to delete vocabulary:', error);
  }
};

const handleExport = async (format: 'csv' | 'anki' | 'json') => {
  try {
    const response = await Taro.request({
      url: `/api/vocabulary/export?format=${format}`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    if (response.statusCode === 200) {
      // 处理文件下载
      Taro.showToast({
        title: '导出成功',
        icon: 'success',
      });
    }
  } catch (error) {
    Taro.showToast({
      title: '导出失败',
      icon: 'error',
    });
  }
};

onMounted(() => {
  fetchVocabulary();
});
</script>

<style scoped lang="css">
.vocabulary-book {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.stats {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: white;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #007aff;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar button {
  flex: 1;
  padding: 8px;
  background-color: #f0f0f0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.toolbar button.active {
  background-color: #007aff;
  color: white;
  border-color: #007aff;
}

.vocabulary-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
</style>
```

---

## 蓝斯值选择器

### LexileSelector.vue

```vue
<template>
  <view class="lexile-selector">
    <view class="title">选择英语水平</view>

    <!-- 快速选择 -->
    <view class="quick-select">
      <button
        v-for="level in quickLevels"
        :key="level.value"
        :class="{ active: selectedLevel === level.value }"
        @click="selectLevel(level.value)"
      >
        {{ level.label }}
        <view class="range">{{ level.range }}</view>
      </button>
    </view>

    <!-- 自定义蓝斯值输入 -->
    <view class="custom-input">
      <label>或输入自定义蓝斯值 (400-2000):</label>
      <input
        v-model.number="customLexile"
        type="number"
        placeholder="输入蓝斯值"
        min="400"
        max="2000"
      />
    </view>

    <!-- AI 评估 -->
    <view class="ai-assessment">
      <button @click="showAiModal = true">AI 评估我的水平</button>
    </view>

    <!-- 确认按钮 -->
    <view class="actions">
      <button class="btn-confirm" @click="confirm">确认选择</button>
    </view>

    <!-- AI 评估对话框 -->
    <AiAssessment
      v-if="showAiModal"
      @assess="handleAiAssessment"
      @close="showAiModal = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Taro from '@tarojs/taro';
import { useUserStore } from '@/stores/user';
import AiAssessment from './AiAssessment.vue';

const userStore = useUserStore();
const selectedLevel = ref('KET');
const customLexile = ref<number | null>(null);
const showAiModal = ref(false);

const quickLevels = [
  { value: 'elementary', label: '初级', range: '400-600L' },
  { value: 'KET', label: 'KET', range: '600-900L' },
  { value: 'PET', label: 'PET', range: '900-1200L' },
];

const selectLevel = (level: string) => {
  selectedLevel.value = level;
  customLexile.value = null;
};

const handleAiAssessment = async (words: string[]) => {
  try {
    const response = await Taro.request({
      url: '/api/lexile/ai-assessment',
      method: 'POST',
      data: { words },
      header: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    if (response.statusCode === 200) {
      const data = response.data.data;
      customLexile.value = data.averageLexile;
      selectedLevel.value = 'custom';
      Taro.showToast({
        title: `推荐蓝斯值: ${data.averageLexile}`,
        icon: 'success',
        duration: 2000,
      });
    }
  } catch (error) {
    Taro.showToast({
      title: 'AI评估失败',
      icon: 'error',
    });
  }
};

const confirm = async () => {
  let lexileScore = customLexile.value;
  let lexileLevel = selectedLevel.value;

  // 如果选择的是快速档次，使用默认蓝斯值
  if (!customLexile.value) {
    const levelMap: Record<string, number> = {
      elementary: 500,
      KET: 750,
      PET: 1050,
    };
    lexileScore = levelMap[selectedLevel.value] || 750;
  }

  try {
    await Taro.request({
      url: '/api/users/me/lexile',
      method: 'PATCH',
      data: {
        lexileScore,
        lexileLevel,
        assessmentMethod: customLexile.value ? 'manual' : 'manual',
      },
      header: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    Taro.showToast({
      title: '蓝斯值设置成功',
      icon: 'success',
    });

    // 更新用户状态并导航
    userStore.setLexile(lexileScore, lexileLevel);
    Taro.navigateTo({
      url: '/pages/home/index',
    });
  } catch (error) {
    Taro.showToast({
      title: '设置失败',
      icon: 'error',
    });
  }
};
</script>

<style scoped lang="css">
.lexile-selector {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.quick-select {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.quick-select button {
  padding: 16px;
  background-color: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-select button.active {
  border-color: #007aff;
  background-color: rgba(0, 122, 255, 0.1);
}

.quick-select .range {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.custom-input {
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.custom-input label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.custom-input input {
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
}

.ai-assessment {
  margin-bottom: 20px;
}

.ai-assessment button {
  width: 100%;
  padding: 12px;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.actions {
  margin-top: 20px;
}

.btn-confirm {
  width: 100%;
  padding: 14px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.btn-confirm:active {
  background-color: #0051d5;
}
</style>
```

---

## 通用工具

### stores/user.ts (用户状态管理)

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  id: string;
  nickName: string;
  avatar: string;
  lexileScore: number;
  lexileLevel: string;
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('');
  const refreshToken = ref<string>('');
  const user = ref<User | null>(null);

  const isLoggedIn = computed(() => !!token.value);

  const setToken = (newToken: string, newRefreshToken: string) => {
    token.value = newToken;
    refreshToken.value = newRefreshToken;
  };

  const setUser = (newUser: User) => {
    user.value = newUser;
  };

  const setLexile = (lexileScore: number, lexileLevel: string) => {
    if (user.value) {
      user.value.lexileScore = lexileScore;
      user.value.lexileLevel = lexileLevel;
    }
  };

  const logout = () => {
    token.value = '';
    refreshToken.value = '';
    user.value = null;
  };

  return {
    token,
    refreshToken,
    user,
    isLoggedIn,
    setToken,
    setUser,
    setLexile,
    logout,
  };
});
```

---

**使用指南**:

1. 将这些组件复制到 `src/components/` 对应目录
2. 根据项目实际需求调整样式和逻辑
3. 使用 `npm run dev:weapp` 启动开发服务器
4. 在微信开发者工具中打开 `dist/weapp` 目录进行调试

---

**维护者**: 前端开发团队
**最后更新**: 2025-10-25
