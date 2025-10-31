<template>
  <div class="home-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">欢迎来到智慧英语阅读平台</h1>
        <p class="page-subtitle">为6-12岁儿童量身定制的英文阅读学习平台</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <div class="container">
        <!-- 功能卡片区域 -->
        <div class="feature-cards">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="6">
              <div class="feature-card" @click="goToListening">
                <div class="card-icon listening">
                  <el-icon size="48"><Headset /></el-icon>
                </div>
                <h3>听力训练</h3>
                <p>丰富的听力资源，提升英语听力理解能力</p>
              </div>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <div class="feature-card" @click="goToReading">
                <div class="card-icon reading">
                  <el-icon size="48"><Reading /></el-icon>
                </div>
                <h3>分级阅读</h3>
                <p>根据难度等级精选英文原版书籍</p>
              </div>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <div class="feature-card" @click="goToVocabulary">
                <div class="card-icon vocabulary">
                  <el-icon size="48"><Notebook /></el-icon>
                </div>
                <h3>生词管理</h3>
                <p>智能生词本，高效记忆和复习</p>
              </div>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <div class="feature-card">
                <div class="card-icon stats">
                  <el-icon size="48"><DataAnalysis /></el-icon>
                </div>
                <h3>学习统计</h3>
                <p>详细的学习报告和进度分析</p>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 推荐内容区域 -->
        <div class="recommended-content">
          <h2 class="section-title">推荐内容</h2>
          <el-row :gutter="24">
            <el-col :xs="24" :md="12">
              <div class="content-section">
                <h3>热门书籍</h3>
                <p>精选适合儿童的英文原版书籍，根据蓝斯值分级，循序渐进提升阅读能力。</p>
                <el-button type="primary" @click="goToReading">查看更多</el-button>
              </div>
            </el-col>

            <el-col :xs="24" :md="12">
              <div class="content-section">
                <h3>听力材料</h3>
                <p>丰富的英文听力资源，包括故事、对话、新闻等，全面提升听力水平。</p>
                <el-button type="primary" @click="goToListening">开始练习</el-button>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Headset, Reading, Notebook, DataAnalysis } from '@element-plus/icons-vue'

const router = useRouter()

// 页面跳转方法
const goToListening = () => {
  router.push('/listening')
}

const goToReading = () => {
  router.push('/reading')
}

const goToVocabulary = () => {
  router.push('/vocabulary')
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
  color: $text-white;
  padding: $spacing-2xl 0;
  text-align: center;

  .page-title {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: $spacing-md;
  }

  .page-subtitle {
    font-size: 18px;
    opacity: 0.9;
  }
}

.page-content {
  padding: $spacing-2xl 0;
}

.feature-cards {
  margin-bottom: $spacing-2xl;

  .feature-card {
    background-color: $bg-primary;
    border-radius: $radius-lg;
    padding: $spacing-xl;
    text-align: center;
    box-shadow: $shadow-sm;
    border: 1px solid $border-color;
    cursor: pointer;
    transition: all 0.3s ease;
    height: 100%;

    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-lg;
      border-color: $primary-color;
    }

    .card-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto $spacing-lg;

      &.listening {
        background-color: rgba(59, 130, 246, 0.1);
        color: #3B82F6;
      }

      &.reading {
        background-color: rgba(16, 185, 129, 0.1);
        color: #10B981;
      }

      &.vocabulary {
        background-color: rgba(245, 158, 11, 0.1);
        color: #F59E0B;
      }

      &.stats {
        background-color: rgba(139, 92, 246, 0.1);
        color: $primary-color;
      }
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: $spacing-sm;
      color: $text-primary;
    }

    p {
      color: $text-secondary;
      line-height: 1.6;
    }
  }
}

.recommended-content {
  .section-title {
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    margin-bottom: $spacing-xl;
    color: $text-primary;
  }

  .content-section {
    background-color: $bg-primary;
    border-radius: $radius-lg;
    padding: $spacing-xl;
    box-shadow: $shadow-sm;
    border: 1px solid $border-color;

    h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: $spacing-md;
      color: $text-primary;
    }

    p {
      color: $text-secondary;
      line-height: 1.6;
      margin-bottom: $spacing-lg;
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .page-header {
    padding: $spacing-xl 0;

    .page-title {
      font-size: 28px;
    }

    .page-subtitle {
      font-size: 16px;
    }
  }

  .page-content {
    padding: $spacing-xl 0;
  }

  .feature-cards {
    margin-bottom: $spacing-xl;

    .feature-card {
      padding: $spacing-lg;
      margin-bottom: $spacing-md;
    }
  }
}
</style>