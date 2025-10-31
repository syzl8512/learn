import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import ErrorBoundary from './components/ErrorBoundary';

console.log('📦 App 组件加载中...');

const App: React.FC = () => {
  useEffect(() => {
    console.log('📦 App 组件已挂载');
    // 页面加载完成后添加loaded类，触发淡入效果
    const timer = setTimeout(() => {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.classList.add('loaded');
        console.log('✓ 添加了 loaded 类');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  console.log('📦 App 组件渲染中...');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;