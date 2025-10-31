<template>
  <div class="listening-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">听力训练</h1>
        <p class="page-subtitle">丰富的听力资源，提升英语听力理解能力</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <div class="container">
        <!-- 筛选区域 -->
        <div class="filter-section">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="8" :md="6">
              <el-select
                v-model="filters.category"
                placeholder="选择分类"
                clearable
                @change="handleFilterChange"
              >
                <el-option label="故事" value="story" />
                <el-option label="对话" value="dialogue" />
                <el-option label="新闻" value="news" />
                <el-option label="歌曲" value="song" />
              </el-select>
            </el-col>

            <el-col :xs="24" :sm="8" :md="6">
              <el-select
                v-model="filters.difficulty"
                placeholder="选择难度"
                clearable
                @change="handleFilterChange"
              >
                <el-option label="简单" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
              </el-select>
            </el-col>

            <el-col :xs="24" :sm="8" :md="6">
              <el-input
                v-model="filters.search"
                placeholder="搜索内容"
                clearable
                @change="handleFilterChange"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
          </el-row>
        </div>

        <!-- 听力内容列表 -->
        <div class="content-list">
          <el-empty v-if="!loading && listeningContents.length === 0" description="暂无听力内容" />

          <el-row v-else :gutter="24">
            <el-col
              v-for="content in listeningContents"
              :key="content.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <div class="content-card" @click="playContent(content)">
                <div class="card-cover">
                  <div class="play-button">
                    <el-icon size="32"><VideoPlay /></el-icon>
                  </div>
                  <div class="duration">{{ formatDuration(content.duration) }}</div>
                </div>

                <div class="card-body">
                  <h3 class="content-title">{{ content.title }}</h3>
                  <p class="content-description">{{ content.description }}</p>

                  <div class="content-meta">
                    <el-tag :type="getDifficultyType(content.difficulty)">
                      {{ getDifficultyText(content.difficulty) }}
                    </el-tag>
                    <el-tag type="info">{{ content.category }}</el-tag>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 分页 -->
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :total="pagination.total"
            :page-sizes="[12, 24, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, VideoPlay } from '@element-plus/icons-vue'
import type { ListeningContent } from '@/types/listening'
import { listeningService } from '@/services/listening'

// 响应式数据
const loading = ref(false)
const listeningContents = ref<ListeningContent[]>([])

// 筛选条件
const filters = reactive({
  category: '',
  difficulty: '',
  search: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0
})

// 获取听力内容列表
const fetchListeningContents = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      category: filters.category || undefined,
      difficulty: filters.difficulty || undefined,
      search: filters.search || undefined
    }

    const response = await listeningService.getListeningContents(params)
    listeningContents.value = response.contents
    pagination.total = response.total
  } catch (error) {
    console.error('获取听力内容失败:', error)
    ElMessage.error('获取听力内容失败')
  } finally {
    loading.value = false
  }
}

// 处理筛选条件变化
const handleFilterChange = () => {
  pagination.page = 1
  fetchListeningContents()
}

// 处理分页变化
const handlePageChange = () => {
  fetchListeningContents()
}

// 播放内容
const playContent = (content: ListeningContent) => {
  ElMessage.info(`播放: ${content.title}`)
  // TODO: 实现播放功能
}

// 格式化时长
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 获取难度类型
const getDifficultyType = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'success'
    case 'medium':
      return 'warning'
    case 'hard':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取难度文本
const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return '简单'
    case 'medium':
      return '中等'
    case 'hard':
      return '困难'
    default:
      return '未知'
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchListeningContents()
})
</script>

<style lang="scss" scoped>
.listening-page {
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
  color: $text-white;
  padding: $spacing-xl 0;
  text-align: center;

  .page-title {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: $spacing-sm;
  }

  .page-subtitle {
    font-size: 16px;
    opacity: 0.9;
  }
}

.page-content {
  padding: $spacing-xl 0;
}

.filter-section {
  background-color: $bg-primary;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-xl;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
}

.content-list {
  margin-bottom: $spacing-xl;

  .content-card {
    background-color: $bg-primary;
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow: $shadow-sm;
    border: 1px solid $border-color;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: $spacing-lg;

    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-lg;
      border-color: $primary-color;
    }

    .card-cover {
      position: relative;
      height: 160px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;

      .play-button {
        width: 64px;
        height: 64px;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $primary-color;
        transition: all 0.3s ease;
      }

      .duration {
        position: absolute;
        bottom: $spacing-sm;
        right: $spacing-sm;
        background-color: rgba(0, 0, 0, 0.7);
        color: $text-white;
        padding: $spacing-xs $spacing-sm;
        border-radius: $radius-sm;
        font-size: 12px;
      }
    }

    &:hover .play-button {
      background-color: $text-white;
      transform: scale(1.1);
    }

    .card-body {
      padding: $spacing-lg;

      .content-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: $spacing-sm;
        color: $text-primary;
        line-height: 1.4;
      }

      .content-description {
        color: $text-secondary;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: $spacing-md;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .content-meta {
        display: flex;
        gap: $spacing-sm;
        flex-wrap: wrap;
      }
    }
  }
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: $spacing-xl;
}

@media (max-width: $breakpoint-sm) {
  .page-header {
    padding: $spacing-lg 0;

    .page-title {
      font-size: 24px;
    }
  }

  .page-content {
    padding: $spacing-lg 0;
  }

  .filter-section {
    padding: $spacing-md;
  }

  .content-card {
    .card-cover {
      height: 140px;
    }
  }
}
</style>