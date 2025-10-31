<template>
  <div class="reading-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">分级阅读</h1>
        <p class="page-subtitle">根据难度等级精选英文原版书籍，循序渐进提升阅读能力</p>
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
                <el-option label="童话故事" value="fairy-tale" />
                <el-option label="科普读物" value="science" />
                <el-option label="历史故事" value="history" />
                <el-option label="冒险故事" value="adventure" />
              </el-select>
            </el-col>

            <el-col :xs="24" :sm="8" :md="6">
              <el-select
                v-model="filters.lexileRange"
                placeholder="蓝斯值范围"
                clearable
                @change="handleFilterChange"
              >
                <el-option label="0-200L (入门)" value="0-200" />
                <el-option label="200-400L (初级)" value="200-400" />
                <el-option label="400-600L (中级)" value="400-600" />
                <el-option label="600L+ (高级)" value="600+" />
              </el-select>
            </el-col>

            <el-col :xs="24" :sm="8" :md="6">
              <el-input
                v-model="filters.search"
                placeholder="搜索书籍"
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

        <!-- 书籍列表 -->
        <div class="book-list">
          <el-empty v-if="!loading && books.length === 0" description="暂无书籍" />

          <el-row v-else :gutter="24">
            <el-col
              v-for="book in books"
              :key="book.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <div class="book-card" @click="openBook(book)">
                <div class="book-cover">
                  <img
                    v-if="book.cover"
                    :src="book.cover"
                    :alt="book.title"
                    class="cover-image"
                  />
                  <div v-else class="cover-placeholder">
                    <el-icon size="48"><Reading /></el-icon>
                  </div>
                </div>

                <div class="book-info">
                  <h3 class="book-title">{{ book.title }}</h3>
                  <p class="book-author">{{ book.author }}</p>
                  <p class="book-description">{{ book.description }}</p>

                  <div class="book-meta">
                    <el-tag type="primary" size="small">
                      {{ book.lexileLevel }}L
                    </el-tag>
                    <el-tag :type="getDifficultyType(book.difficulty)" size="small">
                      {{ getDifficultyText(book.difficulty) }}
                    </el-tag>
                  </div>

                  <div class="book-stats">
                    <span class="stat-item">
                      <el-icon><Document /></el-icon>
                      {{ book.totalChapters }} 章节
                    </span>
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
            :page-sizes="[8, 16, 32]"
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
// import { useRouter } from 'vue-router' // 暂时不使用，后续会用到
import { ElMessage } from 'element-plus'
import { Search, Reading, Document } from '@element-plus/icons-vue'
import type { Book } from '@/types/book'
import { bookService } from '@/services/book'

// const router = useRouter() // 暂时不使用，后续会用到

// 响应式数据
const loading = ref(false)
const books = ref<Book[]>([])

// 筛选条件
const filters = reactive({
  category: '',
  lexileRange: '',
  search: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 16,
  total: 0
})

// 获取书籍列表
const fetchBooks = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      category: filters.category || undefined,
      search: filters.search || undefined
    }

    const response = await bookService.getBooks(params)
    books.value = response.books
    pagination.total = response.total
  } catch (error) {
    console.error('获取书籍列表失败:', error)
    ElMessage.error('获取书籍列表失败')
  } finally {
    loading.value = false
  }
}

// 处理筛选条件变化
const handleFilterChange = () => {
  pagination.page = 1
  fetchBooks()
}

// 处理分页变化
const handlePageChange = () => {
  fetchBooks()
}

// 打开书籍
const openBook = (book: Book) => {
  ElMessage.info(`打开书籍: ${book.title}`)
  // TODO: 实现打开书籍功能，跳转到阅读页面
  // router.push(`/reading/${book.id}`)
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
  fetchBooks()
})
</script>

<style lang="scss" scoped>
.reading-page {
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
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

.book-list {
  margin-bottom: $spacing-xl;

  .book-card {
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

    .book-cover {
      position: relative;
      height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .cover-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-placeholder {
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .book-info {
      padding: $spacing-lg;

      .book-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: $spacing-xs;
        color: $text-primary;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .book-author {
        color: $text-secondary;
        font-size: 14px;
        margin-bottom: $spacing-sm;
      }

      .book-description {
        color: $text-secondary;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: $spacing-md;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .book-meta {
        display: flex;
        gap: $spacing-sm;
        margin-bottom: $spacing-md;
        flex-wrap: wrap;
      }

      .book-stats {
        .stat-item {
          display: flex;
          align-items: center;
          gap: $spacing-xs;
          color: $text-secondary;
          font-size: 12px;
        }
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

  .book-card {
    .book-cover {
      height: 160px;
    }
  }
}
</style>