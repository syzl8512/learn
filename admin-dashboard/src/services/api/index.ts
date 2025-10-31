import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '@/types/common';

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const REQUEST_TIMEOUT = 30000; // 30秒超时

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加认证token
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求时间戳
    if (config.params) {
      config.params._t = Date.now();
    } else {
      config.params = { _t: Date.now() };
    }

    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data,
    });

    return config;
  },
  (error: AxiosError) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });

    const { data } = response;

    // 检查业务状态码
    if (data.success === false) {
      message.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }

    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    const { response } = error;
    let errorMessage = '网络请求失败，请稍后重试';

    // 只在非后台请求且非网络错误时记录错误
    const isBackgroundAuth = error.config?.url?.includes('/auth/me');
    const isNetworkError = error.code === 'ERR_NETWORK' || error.message === 'Network Error';
    
    if (!isBackgroundAuth && !isNetworkError) {
      console.error('Response Error:', error);
    }

    if (response) {
      const { status, data } = response;

      switch (status) {
        case 401:
          errorMessage = '登录已过期，请重新登录';
          // 清除本地token并跳转到登录页
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = '没有权限访问该资源';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 422:
          errorMessage = data?.message || '请求参数验证失败';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        case 502:
          errorMessage = '网关错误';
          break;
        case 503:
          errorMessage = '服务暂时不可用';
          break;
        default:
          errorMessage = data?.message || `请求失败 (${status})`;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请检查网络连接';
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      // 后端服务未启动时，不显示错误消息（特别是在后台验证时）
      if (error.config?.url?.includes('/auth/me')) {
        // 后台验证失败，静默处理
        return Promise.reject(error);
      }
      errorMessage = '网络连接失败，请检查网络设置或确认后端服务已启动';
    }

    // 只在非后台验证请求时显示错误消息
    if (!error.config?.url?.includes('/auth/me')) {
      message.error(errorMessage);
    }
    return Promise.reject(error);
  }
);

// 通用请求方法
export const request = {
  // GET请求
  get: <T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get(url, { params, ...config });
  },

  // POST请求
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post(url, data, config);
  },

  // PUT请求
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put(url, data, config);
  },

  // DELETE请求
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete(url, config);
  },

  // PATCH请求
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.patch(url, data, config);
  },

  // 文件上传
  upload: <T = any>(url: string, formData: FormData, onProgress?: (progressEvent: any) => void): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },

  // 文件下载
  download: (url: string, params?: any, filename?: string): Promise<void> => {
    return apiClient.get(url, {
      params,
      responseType: 'blob',
    }).then((response) => {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    });
  },
};

export { apiClient };
export default apiClient;