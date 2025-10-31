import api from './api'
import type { User, LoginRequest, RegisterRequest } from '@/types/user'

export const authService = {
  // 登录
  async login(credentials: LoginRequest) {
    return api.post('/auth/login', credentials)
  },

  // 注册
  async register(userData: RegisterRequest) {
    return api.post('/auth/register', userData)
  },

  // 获取用户信息
  async getUserInfo() {
    return api.get<User>('/auth/me')
  },

  // 更新用户信息
  async updateProfile(userData: Partial<User>) {
    return api.put<User>('/auth/profile', userData)
  },

  // 修改密码
  async changePassword(oldPassword: string, newPassword: string) {
    return api.put('/auth/password', {
      oldPassword,
      newPassword
    })
  },

  // 退出登录
  async logout() {
    return api.post('/auth/logout')
  }
}