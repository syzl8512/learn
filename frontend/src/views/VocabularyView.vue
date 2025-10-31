<template>
  <div class="vocabulary-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">生词管理</h1>
        <p class="page-subtitle">智能生词本，高效记忆和复习</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <div class="container">
        <!-- 统计信息 -->
        <div class="stats-section">
          <el-row :gutter="16">
            <el-col :xs="12" :sm="6">
              <div class="stat-card total">
                <div class="stat-icon">
                  <el-icon size="24"><Document /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ statistics.total }}</div>
                  <div class="stat-label">总生词</div>
                </div>
              </div>
            </el-col>

            <el-col :xs="12" :sm="6">
              <div class="stat-card mastered">
                <div class="stat-icon">
                  <el-icon size="24"><CircleCheck /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ statistics.mastered }}</div>
                  <div class="stat-label">已掌握</div>
                </div>
              </div>
            </el-col>

            <el-col :xs="12" :sm="6">
              <div class="stat-card learning">
                <div class="stat-icon">
                  <el-icon size="24"><Clock /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ statistics.learning }}</div>
                  <div class="stat-label">学习中</div>
                </div>
              </div>
            </el-col>

            <el-col :xs="12" :sm="6">
              <div class="stat-card new">
                <div class="stat-icon">
                  <el-icon size="24"><Plus /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ statistics.new }}</div>
                  <div class="stat-label">新生词</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 操作区域 -->
        <div class="action-section">
          <el-row :gutter="16" class="action-row">
            <el-col :xs="24" :sm="8">
              <el-input
                v-model="filters.search"
                placeholder="搜索生词"
                clearable
                @change="handleFilterChange"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>

            <el-col :xs="24" :sm="6">
              <el-select
                v-model="filters.category"
                placeholder="选择分类"
                clearable
                @change="handleFilterChange"
              >
                <el-option label="名词" value="noun" />
                <el-option label="动词" value="verb" />
                <el-option label="形容词" value="adjective" />
                <el-option label="副词" value="adverb" />
              </el-select>
            </el-col>

            <el-col :xs="24" :sm="6">
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

            <el-col :xs="24" :sm="4">
              <el-button type="primary" @click="showAddDialog">
                <el-icon><Plus /></el-icon>
                添加生词
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 生词列表 -->
        <div class="vocabulary-list">
          <el-empty v-if="!loading && vocabularies.length === 0" description="暂无生词" />

          <el-table v-else :data="vocabularies" v-loading="loading" stripe>
            <el-table-column prop="word" label="单词" min-width="120">
              <template #default="{ row }">
                <div class="word-cell">
                  <strong>{{ row.word }}</strong>
                  <span v-if="row.pronunciation" class="pronunciation">
                    [{{ row.pronunciation }}]
                  </span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="definition" label="释义" min-width="200" />

            <el-table-column prop="example" label="例句" min-width="250">
              <template #default="{ row }">
                <span v-if="row.example" class="example">{{ row.example }}</span>
                <span v-else class="no-example">暂无例句</span>
              </template>
            </el-table-column>

            <el-table-column prop="difficulty" label="难度" width="80">
              <template #default="{ row }">
                <el-tag :type="getDifficultyType(row.difficulty)" size="small">
                  {{ getDifficultyText(row.difficulty) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="isMastered" label="掌握状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isMastered ? 'success' : 'warning'" size="small">
                  {{ row.isMastered ? '已掌握' : '学习中' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="reviewCount" label="复习次数" width="100" align="center">
              <template #default="{ row }">
                <span class="review-count">{{ row.reviewCount }}</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="reviewWord(row)"
                >
                  复习
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteWord(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 添加生词对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加生词"
      width="500px"
    >
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="单词" required>
          <el-input v-model="addForm.word" placeholder="请输入单词" />
        </el-form-item>

        <el-form-item label="释义" required>
          <el-input
            v-model="addForm.definition"
            type="textarea"
            placeholder="请输入单词释义"
            :rows="2"
          />
        </el-form-item>

        <el-form-item label="发音">
          <el-input v-model="addForm.pronunciation" placeholder="请输入音标" />
        </el-form-item>

        <el-form-item label="例句">
          <el-input
            v-model="addForm.example"
            type="textarea"
            placeholder="请输入例句"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="addForm.category" placeholder="选择分类">
            <el-option label="名词" value="noun" />
            <el-option label="动词" value="verb" />
            <el-option label="形容词" value="adjective" />
            <el-option label="副词" value="adverb" />
          </el-select>
        </el-form-item>

        <el-form-item label="难度">
          <el-select v-model="addForm.difficulty" placeholder="选择难度">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addWord">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document, CircleCheck, Clock, Plus, Search
} from '@element-plus/icons-vue'
import type { Vocabulary, VocabularyStatistics } from '@/types/vocabulary'
import { vocabularyService } from '@/services/vocabulary'

// 响应式数据
const loading = ref(false)
const vocabularies = ref<Vocabulary[]>([])
const statistics = ref<VocabularyStatistics>({
  total: 0,
  mastered: 0,
  learning: 0,
  new: 0
})

// 筛选条件
const filters = reactive({
  search: '',
  category: '',
  difficulty: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 添加生词对话框
const addDialogVisible = ref(false)
const addForm = reactive({
  word: '',
  definition: '',
  pronunciation: '',
  example: '',
  category: '',
  difficulty: 'medium'
})

// 获取生词列表
const fetchVocabularies = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      category: filters.category || undefined,
      difficulty: filters.difficulty || undefined,
      search: filters.search || undefined
    }

    const response = await vocabularyService.getVocabularies(params)
    vocabularies.value = response.vocabularies
    pagination.total = response.total
  } catch (error) {
    console.error('获取生词列表失败:', error)
    ElMessage.error('获取生词列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计信息
const fetchStatistics = async () => {
  try {
    const response = await vocabularyService.getStatistics()
    statistics.value = response
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 处理筛选条件变化
const handleFilterChange = () => {
  pagination.page = 1
  fetchVocabularies()
}

// 处理分页变化
const handlePageChange = () => {
  fetchVocabularies()
}

// 显示添加对话框
const showAddDialog = () => {
  Object.assign(addForm, {
    word: '',
    definition: '',
    pronunciation: '',
    example: '',
    category: '',
    difficulty: 'medium'
  })
  addDialogVisible.value = true
}

// 添加生词
const addWord = async () => {
  try {
    if (!addForm.word || !addForm.definition) {
      ElMessage.warning('请填写单词和释义')
      return
    }

    await vocabularyService.addVocabulary(addForm)
    ElMessage.success('添加生词成功')
    addDialogVisible.value = false
    fetchVocabularies()
    fetchStatistics()
  } catch (error) {
    console.error('添加生词失败:', error)
    ElMessage.error('添加生词失败')
  }
}

// 复习单词
const reviewWord = (word: Vocabulary) => {
  ElMessage.info(`复习单词: ${word.word}`)
  // TODO: 实现复习功能
}

// 删除单词
const deleteWord = async (word: Vocabulary) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除单词 "${word.word}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await vocabularyService.deleteVocabulary(word.id)
    ElMessage.success('删除成功')
    fetchVocabularies()
    fetchStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除生词失败:', error)
      ElMessage.error('删除生词失败')
    }
  }
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
  fetchVocabularies()
  fetchStatistics()
})
</script>

<style lang="scss" scoped>
.vocabulary-page {
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
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

.stats-section {
  margin-bottom: $spacing-xl;

  .stat-card {
    background-color: $bg-primary;
    border-radius: $radius-lg;
    padding: $spacing-lg;
    box-shadow: $shadow-sm;
    border: 1px solid $border-color;
    display: flex;
    align-items: center;
    gap: $spacing-md;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-info {
      flex: 1;

      .stat-number {
        font-size: 24px;
        font-weight: 600;
        line-height: 1;
        margin-bottom: $spacing-xs;
      }

      .stat-label {
        color: $text-secondary;
        font-size: 14px;
      }
    }

    &.total .stat-icon {
      background-color: rgba(139, 92, 246, 0.1);
      color: $primary-color;
    }

    &.mastered .stat-icon {
      background-color: rgba(16, 185, 129, 0.1);
      color: #10B981;
    }

    &.learning .stat-icon {
      background-color: rgba(245, 158, 11, 0.1);
      color: #F59E0B;
    }

    &.new .stat-icon {
      background-color: rgba(59, 130, 246, 0.1);
      color: #3B82F6;
    }
  }
}

.action-section {
  background-color: $bg-primary;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-xl;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;

  .action-row {
    align-items: center;
  }
}

.vocabulary-list {
  background-color: $bg-primary;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-xl;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;

  .word-cell {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    .pronunciation {
      color: $text-secondary;
      font-size: 12px;
    }
  }

  .example {
    color: $text-secondary;
    font-style: italic;
  }

  .no-example {
    color: $text-light;
    font-size: 12px;
  }

  .review-count {
    color: $primary-color;
    font-weight: 600;
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

  .stats-section {
    margin-bottom: $spacing-lg;

    .stat-card {
      padding: $spacing-md;
      margin-bottom: $spacing-sm;
    }
  }

  .action-section {
    padding: $spacing-md;
  }

  .vocabulary-list {
    padding: $spacing-md;
  }
}
</style>