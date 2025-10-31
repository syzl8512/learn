// API响应类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 管理员用户类型
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// 登录表单类型
export interface LoginForm {
  username: string;
  password: string;
  remember?: boolean;
}

// 登录响应类型
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: AdminUser;
  expiresIn: number;
}

// 菜单项类型
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  permission?: string[];
}

// 面包屑类型
export interface BreadcrumbItem {
  title: string;
  path?: string;
}

// 搜索参数
export interface SearchParams {
  keyword?: string;
  status?: string;
  category?: string;
  dateRange?: [string, string];
  [key: string]: any;
}