<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>智慧英语阅读</h1>
        </div>

        <!-- 导航菜单 -->
        <el-menu
          :default-active="activeRoute"
          mode="horizontal"
          class="nav-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/listening">
            <el-icon><Headset /></el-icon>
            <span>听力</span>
          </el-menu-item>
          <el-menu-item index="/reading">
            <el-icon><Reading /></el-icon>
            <span>阅读</span>
          </el-menu-item>
          <el-menu-item index="/vocabulary">
            <el-icon><Notebook /></el-icon>
            <span>生词管理</span>
          </el-menu-item>
        </el-menu>

        <!-- 用户信息 -->
        <div class="user-section">
          <el-dropdown v-if="userStore.isLoggedIn">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userStore.user?.avatar">
                {{ userStore.userName.charAt(0) }}
              </el-avatar>
              <span class="username">{{ userStore.userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">个人中心</el-dropdown-item>
                <el-dropdown-item @click="handleSettings">设置</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button v-else type="primary" @click="handleLogin">登录</el-button>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="app-main">
      <router-view />
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { House, Headset, Reading, Notebook, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 计算当前激活的路由
const activeRoute = computed(() => route.path)

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  router.push(index)
}

// 处理登录
const handleLogin = () => {
  ElMessage.info('登录功能待实现')
}

// 处理个人中心
const handleProfile = () => {
  ElMessage.info('个人中心功能待实现')
}

// 处理设置
const handleSettings = () => {
  ElMessage.info('设置功能待实现')
}

// 处理退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style lang="scss" scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: $bg-primary;
  border-bottom: 1px solid $border-color;
  box-shadow: $shadow-sm;
  padding: 0;
  height: 64px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-lg;
}

.logo {
  h1 {
    color: $primary-color;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }
}

.nav-menu {
  flex: 1;
  margin: 0 $spacing-xl;
  border-bottom: none;

  .el-menu-item {
    font-size: 16px;

    &:hover {
      color: $primary-color;
    }

    &.is-active {
      color: $primary-color;
      border-bottom-color: $primary-color;
    }
  }
}

.user-section {
  display: flex;
  align-items: center;

  .user-dropdown {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: $spacing-sm;
    border-radius: $radius-md;
    transition: background-color 0.3s;

    &:hover {
      background-color: $bg-secondary;
    }
  }

  .username {
    margin: 0 $spacing-sm;
    color: $text-primary;
  }
}

.app-main {
  flex: 1;
  padding: 0;
  background-color: $bg-secondary;
}

@media (max-width: $breakpoint-sm) {
  .header-content {
    padding: 0 $spacing-md;
  }

  .nav-menu {
    margin: 0 $spacing-md;
  }

  .username {
    display: none;
  }
}
</style>