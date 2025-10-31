import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.nickname || user.value?.username || '用户')

  // 操作
  const setUser = (userData: User) => {
    user.value = userData
  }

  const setToken = (userToken: string) => {
    token.value = userToken
    localStorage.setItem('token', userToken)
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  const updateProfile = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
    }
  }

  return {
    // 状态
    user,
    token,

    // 计算属性
    isLoggedIn,
    userName,

    // 操作
    setUser,
    setToken,
    logout,
    updateProfile
  }
})