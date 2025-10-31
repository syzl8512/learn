import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { message } from 'antd';
import { AdminUser, LoginForm, LoginResponse } from '../types/common';
import { authService } from '@services';

// 认证状态类型
interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// 认证动作类型
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AdminUser; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: AdminUser }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// 初始状态
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

// 认证Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// 认证Context类型
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
}

// 创建认证Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证Provider组件
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 登录方法
  const login = async (credentials: LoginForm): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await authService.login(credentials);
      const { data } = response;

      if (data.success && data.data) {
        const { user, token } = data.data;

        // 保存到localStorage
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });

        message.success('登录成功');
      } else {
        throw new Error(data.message || '登录失败');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '登录失败';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      message.error(errorMessage);
      throw error;
    }
  };

  // 登出方法
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除本地存储
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_refresh_token');

      dispatch({ type: 'LOGOUT' });
      message.success('已安全退出');
    }
  };

  // 获取当前用户信息
  const getCurrentUser = async (showLoading = false): Promise<void> => {
    try {
      if (showLoading) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }

      const response = await authService.getCurrentUser();
      const { data } = response;

      if (data.success && data.data) {
        dispatch({
          type: 'SET_USER',
          payload: data.data,
        });

        // 更新localStorage中的用户信息
        localStorage.setItem('admin_user', JSON.stringify(data.data));
      }
    } catch (error: any) {
      console.error('Get current user error:', error);

      // 如果获取用户信息失败，可能是token过期，清除认证状态
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_refresh_token');
        dispatch({ type: 'LOGOUT' });
      }
    } finally {
      if (showLoading) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  // 清除错误
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // 刷新token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await authService.refreshToken(refreshToken);
      const { data } = response;

      if (data.success && data.data) {
        const { token } = data.data;
        localStorage.setItem('admin_token', token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Refresh token error:', error);
      return false;
    }
  };

  // 组件挂载时检查认证状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('admin_token');
      const userStr = localStorage.getItem('admin_user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          // 先设置初始状态，不触发loading，避免闪屏
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });

          // 在后台验证token是否仍然有效，不阻塞UI，不显示loading
          getCurrentUser(false).catch((error) => {
            console.error('Validate token error:', error);
            // 如果验证失败，getCurrentUser 内部会处理清除逻辑
          });
        } catch (error) {
          console.error('Parse user data error:', error);
          // 清除无效的本地数据
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          localStorage.removeItem('admin_refresh_token');
        }
      }
    };

    checkAuthStatus();
  }, []);

  // 自动刷新token的定时器
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      // 每50分钟刷新一次token
      const timer = setInterval(() => {
        refreshToken();
      }, 50 * 60 * 1000);

      return () => clearInterval(timer);
    }
  }, [state.isAuthenticated, state.token]);

  const value: AuthContextType = {
    state,
    login,
    logout,
    getCurrentUser,
    clearError,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 使用认证Context的Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;