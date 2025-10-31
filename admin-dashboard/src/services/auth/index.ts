import { request } from '@services/api';
import type { LoginForm, LoginResponse, AdminUser } from '@/types/common';

export const authService = {
  // 管理员登录
  login: (data: LoginForm) => {
    return request.post<LoginResponse>('/auth/admin/login', data);
  },

  // 登出
  logout: () => {
    return request.post('/auth/logout');
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return request.get<AdminUser>('/users/me');
  },

  // 刷新token
  refreshToken: (refreshToken: string) => {
    return request.post<{ token: string; expiresIn: number }>('/auth/refresh', {
      refreshToken,
    });
  },

  // 修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) => {
    return request.post('/auth/change-password', data);
  },

  // 重置密码
  resetPassword: (data: { email: string }) => {
    return request.post('/auth/reset-password', data);
  },

  // 验证token有效性
  verifyToken: () => {
    return request.get<{ valid: boolean }>('/auth/verify');
  },
};

export default authService;