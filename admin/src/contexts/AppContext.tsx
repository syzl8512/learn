import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { BreadcrumbItem, MenuItem } from '../types/common';

// 应用状态类型
interface AppState {
  // 侧边栏状态
  sidebarCollapsed: boolean;

  // 面包屑
  breadcrumbs: BreadcrumbItem[];

  // 页面标题
  pageTitle: string;

  // 页面描述
  pageDescription: string;

  // 加载状态
  pageLoading: boolean;

  // 全屏状态
  isFullscreen: boolean;

  // 通知数量
  notificationCount: number;

  // 当前选中的菜单
  selectedMenuKey: string;

  // 打开的子菜单
  openMenuKeys: string[];
}

// 应用动作类型
type AppAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_BREADCRUMBS'; payload: BreadcrumbItem[] }
  | { type: 'ADD_BREADCRUMB'; payload: BreadcrumbItem }
  | { type: 'SET_PAGE_TITLE'; payload: string }
  | { type: 'SET_PAGE_DESCRIPTION'; payload: string }
  | { type: 'SET_PAGE_LOADING'; payload: boolean }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'SET_NOTIFICATION_COUNT'; payload: number }
  | { type: 'INCREMENT_NOTIFICATION_COUNT' }
  | { type: 'DECREMENT_NOTIFICATION_COUNT' }
  | { type: 'SET_SELECTED_MENU'; payload: string }
  | { type: 'SET_OPEN_MENUS'; payload: string[] }
  | { type: 'TOGGLE_MENU'; payload: string };

// 初始状态
const initialState: AppState = {
  sidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
  breadcrumbs: [],
  pageTitle: '',
  pageDescription: '',
  pageLoading: false,
  isFullscreen: false,
  notificationCount: 0,
  selectedMenuKey: '',
  openMenuKeys: [],
};

// 应用Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      const newCollapsedState = !state.sidebarCollapsed;
      localStorage.setItem('sidebar_collapsed', newCollapsedState.toString());
      return {
        ...state,
        sidebarCollapsed: newCollapsedState,
      };
    case 'SET_SIDEBAR_COLLAPSED':
      localStorage.setItem('sidebar_collapsed', action.payload.toString());
      return {
        ...state,
        sidebarCollapsed: action.payload,
      };
    case 'SET_BREADCRUMBS':
      return {
        ...state,
        breadcrumbs: action.payload,
      };
    case 'ADD_BREADCRUMB':
      return {
        ...state,
        breadcrumbs: [...state.breadcrumbs, action.payload],
      };
    case 'SET_PAGE_TITLE':
      // 更新页面标题和浏览器标题
      document.title = `${action.payload} - 智慧儿童英文辅助阅读平台`;
      return {
        ...state,
        pageTitle: action.payload,
      };
    case 'SET_PAGE_DESCRIPTION':
      return {
        ...state,
        pageDescription: action.payload,
      };
    case 'SET_PAGE_LOADING':
      return {
        ...state,
        pageLoading: action.payload,
      };
    case 'TOGGLE_FULLSCREEN':
      const newFullscreenState = !state.isFullscreen;
      if (newFullscreenState) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      return {
        ...state,
        isFullscreen: newFullscreenState,
      };
    case 'SET_FULLSCREEN':
      return {
        ...state,
        isFullscreen: action.payload,
      };
    case 'SET_NOTIFICATION_COUNT':
      return {
        ...state,
        notificationCount: action.payload,
      };
    case 'INCREMENT_NOTIFICATION_COUNT':
      return {
        ...state,
        notificationCount: state.notificationCount + 1,
      };
    case 'DECREMENT_NOTIFICATION_COUNT':
      return {
        ...state,
        notificationCount: Math.max(0, state.notificationCount - 1),
      };
    case 'SET_SELECTED_MENU':
      return {
        ...state,
        selectedMenuKey: action.payload,
      };
    case 'SET_OPEN_MENUS':
      return {
        ...state,
        openMenuKeys: action.payload,
      };
    case 'TOGGLE_MENU':
      const isOpen = state.openMenuKeys.includes(action.payload);
      return {
        ...state,
        openMenuKeys: isOpen
          ? state.openMenuKeys.filter(key => key !== action.payload)
          : [...state.openMenuKeys, action.payload],
      };
    default:
      return state;
  }
};

// 应用Context类型
interface AppContextType {
  state: AppState;
  // 侧边栏操作
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // 面包屑操作
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;

  // 页面操作
  setPageTitle: (title: string) => void;
  setPageDescription: (description: string) => void;
  setPageLoading: (loading: boolean) => void;

  // 全屏操作
  toggleFullscreen: () => void;
  setFullscreen: (fullscreen: boolean) => void;

  // 通知操作
  setNotificationCount: (count: number) => void;
  incrementNotificationCount: () => void;
  decrementNotificationCount: () => void;

  // 菜单操作
  setSelectedMenu: (key: string) => void;
  setOpenMenus: (keys: string[]) => void;
  toggleMenu: (key: string) => void;
}

// 创建应用Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 应用Provider组件
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 侧边栏操作
  const toggleSidebar = (): void => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const setSidebarCollapsed = (collapsed: boolean): void => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
  };

  // 面包屑操作
  const setBreadcrumbs = (breadcrumbs: BreadcrumbItem[]): void => {
    dispatch({ type: 'SET_BREADCRUMBS', payload: breadcrumbs });
  };

  const addBreadcrumb = (breadcrumb: BreadcrumbItem): void => {
    dispatch({ type: 'ADD_BREADCRUMB', payload: breadcrumb });
  };

  // 页面操作
  const setPageTitle = (title: string): void => {
    dispatch({ type: 'SET_PAGE_TITLE', payload: title });
  };

  const setPageDescription = (description: string): void => {
    dispatch({ type: 'SET_PAGE_DESCRIPTION', payload: description });
  };

  const setPageLoading = (loading: boolean): void => {
    dispatch({ type: 'SET_PAGE_LOADING', payload: loading });
  };

  // 全屏操作
  const toggleFullscreen = (): void => {
    dispatch({ type: 'TOGGLE_FULLSCREEN' });
  };

  const setFullscreen = (fullscreen: boolean): void => {
    dispatch({ type: 'SET_FULLSCREEN', payload: fullscreen });
  };

  // 通知操作
  const setNotificationCount = (count: number): void => {
    dispatch({ type: 'SET_NOTIFICATION_COUNT', payload: count });
  };

  const incrementNotificationCount = (): void => {
    dispatch({ type: 'INCREMENT_NOTIFICATION_COUNT' });
  };

  const decrementNotificationCount = (): void => {
    dispatch({ type: 'DECREMENT_NOTIFICATION_COUNT' });
  };

  // 菜单操作
  const setSelectedMenu = (key: string): void => {
    dispatch({ type: 'SET_SELECTED_MENU', payload: key });
  };

  const setOpenMenus = (keys: string[]): void => {
    dispatch({ type: 'SET_OPEN_MENUS', payload: keys });
  };

  const toggleMenu = (key: string): void => {
    dispatch({ type: 'TOGGLE_MENU', payload: key });
  };

  const value: AppContextType = {
    state,
    toggleSidebar,
    setSidebarCollapsed,
    setBreadcrumbs,
    addBreadcrumb,
    setPageTitle,
    setPageDescription,
    setPageLoading,
    toggleFullscreen,
    setFullscreen,
    setNotificationCount,
    incrementNotificationCount,
    decrementNotificationCount,
    setSelectedMenu,
    setOpenMenus,
    toggleMenu,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 使用应用Context的Hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;