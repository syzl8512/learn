import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import { purpleTheme, darkTheme } from '@styles/themes';

// 主题模式类型
type ThemeMode = 'light' | 'dark' | 'auto';

// 主题状态类型
interface ThemeState {
  mode: ThemeMode;
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';
}

// 主题动作类型
type ThemeAction =
  | { type: 'SET_THEME_MODE'; payload: ThemeMode }
  | { type: 'SET_SYSTEM_THEME'; payload: 'light' | 'dark' };

// 初始状态
const initialState: ThemeState = {
  mode: (localStorage.getItem('theme_mode') as ThemeMode) || 'light',
  systemTheme: 'light',
  effectiveTheme: 'light',
};

// 主题Reducer
const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME_MODE':
      const newMode = action.payload;
      const effectiveTheme = newMode === 'auto' ? state.systemTheme : newMode;

      return {
        ...state,
        mode: newMode,
        effectiveTheme,
      };
    case 'SET_SYSTEM_THEME':
      const newEffectiveTheme = state.mode === 'auto' ? action.payload : state.mode;

      return {
        ...state,
        systemTheme: action.payload,
        effectiveTheme: newEffectiveTheme,
      };
    default:
      return state;
  }
};

// 主题Context类型
interface ThemeContextType {
  state: ThemeState;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  getThemeConfig: () => typeof purpleTheme;
}

// 创建主题Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题Provider组件
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // 设置主题模式
  const setThemeMode = (mode: ThemeMode): void => {
    dispatch({ type: 'SET_THEME_MODE', payload: mode });
    localStorage.setItem('theme_mode', mode);
  };

  // 切换主题
  const toggleTheme = (): void => {
    const newMode = state.mode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  // 获取主题配置
  const getThemeConfig = () => {
    return state.effectiveTheme === 'dark' ? darkTheme : purpleTheme;
  };

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      dispatch({
        type: 'SET_SYSTEM_THEME',
        payload: e.matches ? 'dark' : 'light',
      });
    };

    // 初始设置
    dispatch({
      type: 'SET_SYSTEM_THEME',
      payload: mediaQuery.matches ? 'dark' : 'light',
    });

    // 监听变化
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // 应用主题到document根元素
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', state.effectiveTheme);
    root.className = state.effectiveTheme;
  }, [state.effectiveTheme]);

  const value: ThemeContextType = {
    state,
    setThemeMode,
    toggleTheme,
    getThemeConfig,
  };

  const themeConfig = getThemeConfig();

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          algorithm: themeConfig.algorithm,
          token: themeConfig.token,
          components: themeConfig.components,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// 使用主题Context的Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;