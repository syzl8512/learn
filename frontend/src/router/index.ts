import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 延迟加载组件
const HomeView = () => import('@/views/HomeView.vue')
const ListeningView = () => import('@/views/ListeningView.vue')
const ReadingView = () => import('@/views/ReadingView.vue')
const VocabularyView = () => import('@/views/VocabularyView.vue')
const LayoutView = () => import('@/components/LayoutView.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: LayoutView,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: {
          title: '首页',
          icon: 'House'
        }
      },
      {
        path: '/listening',
        name: 'listening',
        component: ListeningView,
        meta: {
          title: '听力',
          icon: 'Headphones'
        }
      },
      {
        path: '/reading',
        name: 'reading',
        component: ReadingView,
        meta: {
          title: '阅读',
          icon: 'Reading'
        }
      },
      {
        path: '/vocabulary',
        name: 'vocabulary',
        component: VocabularyView,
        meta: {
          title: '生词管理',
          icon: 'Notebook'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta?.title || '智慧儿童英文辅助阅读平台'} - 儿童英语阅读`
  next()
})

export default router