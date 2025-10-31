import React, { useEffect, useState } from 'react';
import { Layout as AntLayout, Spin } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useApp } from '@contexts/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.scss';

const { Content } = AntLayout;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: authState, logout } = useAuth();
  const { state: appState, setSidebarCollapsed } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  // 检查认证状态
  useEffect(() => {
    if (!authState.isAuthenticated && !authState.loading) {
      navigate('/login', { replace: true });
      return;
    }

    // 模拟初始化加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [authState.isAuthenticated, authState.loading, navigate]);

  // 处理响应式侧边栏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始检查

    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  // 如果正在加载或未认证，显示加载页面
  if (isLoading || authState.loading || !authState.isAuthenticated) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AntLayout className={styles.layout}>
      <Sidebar />
      <AntLayout className={styles.mainLayout}>
        <Header />
        <Content className={styles.content}>
          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;