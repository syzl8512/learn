import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  useEffect(() => {
    // 页面加载完成后添加loaded类，触发淡入效果
    const timer = setTimeout(() => {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.classList.add('loaded');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;