import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Spin } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  SoundOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import styles from './SimpleLayout.module.scss';

const { Header, Sider, Content } = AntLayout;

const SimpleLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { state: authState, logout } = useAuth();

  // 检查登录状态并重定向
  useEffect(() => {
    // 等待认证状态初始化完成
    if (authState.loading) {
      return;
    }

    // 如果未认证，重定向到登录页
    if (!authState.isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [authState.isAuthenticated, authState.loading, navigate]);

  // 菜单配置
  const navigateIfChanged = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
      onClick: () => navigateIfChanged('/dashboard'),
    },
    {
      key: 'reading',
      icon: <BookOutlined />,
      label: '阅读管理',
      children: [
        {
          key: 'reading-overview',
          label: '阅读概览',
          onClick: () => navigateIfChanged('/reading'),
        },
        {
          key: 'reading-books',
          label: '📚 书籍管理',
          onClick: () => navigateIfChanged('/reading/books'),
        },
      ],
    },
    {
      key: 'listening',
      icon: <SoundOutlined />,
      label: '🎧 听力材料管理',
      onClick: () => navigateIfChanged('/listening'),
    },
    {
      key: 'dictionary',
      icon: <FileTextOutlined />,
      label: '📖 词典管理',
      onClick: () => navigateIfChanged('/dictionary'),
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
      onClick: () => navigateIfChanged('/users'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigateIfChanged('/settings'),
    },
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => console.log('个人资料'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login', { replace: true });
      },
    },
  ];

  // 获取当前选中的菜单
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/dashboard') return ['dashboard'];
    if (path === '/reading') return ['reading-overview'];
    if (path === '/reading/books') return ['reading-books'];
    if (path === '/listening') return ['listening'];
    if (path === '/dictionary') return ['dictionary'];
    if (path === '/users') return ['users'];
    if (path === '/settings') return ['settings'];
    return ['dashboard'];
  };

  // 获取当前展开的菜单
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/reading')) return ['reading'];
    return [];
  };

  // 如果正在加载或未认证，显示加载页面
  if (authState.loading || !authState.isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5',
        transition: 'opacity 0.2s ease-in-out'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#666' }}>正在验证身份...</div>
        </div>
      </div>
    );
  }

  return (
    <AntLayout
      style={{
        minHeight: '100vh',
        opacity: isCheckingAuth ? 0 : 1,
        transition: 'opacity 0.2s ease-in-out'
      }}
    >
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className={styles.sider}
      >
        {/* Logo区域 */}
        <div style={{
          height: '64px',
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BookOutlined style={{ fontSize: '24px', color: '#8B5CF6', marginRight: '12px' }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1a1a1a' }}>阅读平台</div>
                <div style={{ fontSize: '12px', color: '#666' }}>管理后台</div>
              </div>
            </div>
          ) : (
            <BookOutlined style={{ fontSize: '24px', color: '#8B5CF6' }} />
          )}
        </div>

        {/* 菜单区域 */}
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          style={{ borderRight: 0 }}
          items={menuItems}
        />
      </Sider>

      <AntLayout>
        <Header style={{
          padding: '0 16px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            {collapsed ? (
              <MenuUnfoldOutlined
                style={{ fontSize: '18px', cursor: 'pointer' }}
                onClick={() => setCollapsed(!collapsed)}
              />
            ) : (
              <MenuFoldOutlined
                style={{ fontSize: '18px', cursor: 'pointer' }}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
          </div>

          <div>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px' }}>
                  {authState.user?.username || '管理员'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{
          margin: '16px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 96px)'
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default SimpleLayout;