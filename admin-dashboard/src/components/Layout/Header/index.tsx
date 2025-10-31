import React from 'react';
import { Layout, Button, Space, Badge, Dropdown, Breadcrumb, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useApp } from '@contexts/AppContext';
import { useTheme } from '@contexts/ThemeContext';
import styles from './Header.module.scss';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState, logout } = useAuth();
  const { state: appState, toggleSidebar, toggleFullscreen } = useApp();
  const { toggleTheme } = useTheme();

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  // 通知下拉菜单
  const notificationMenuItems = [
    {
      key: '1',
      label: (
        <div className={styles.notificationItem}>
          <div className={styles.notificationTitle}>
            新的书籍上传成功
          </div>
          <div className={styles.notificationTime}>
            2分钟前
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className={styles.notificationItem}>
          <div className={styles.notificationTitle}>
            听力材料处理完成
          </div>
          <div className={styles.notificationTime}>
            10分钟前
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div className={styles.notificationItem}>
          <div className={styles.notificationTitle}>
            词汇库更新提醒
          </div>
          <div className={styles.notificationTime}>
            1小时前
          </div>
        </div>
      ),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'view-all',
      label: (
        <div className={styles.viewAllNotifications}>
          查看全部通知
        </div>
      ),
      onClick: () => navigate('/notifications'),
    },
  ];

  return (
    <AntHeader className={styles.header}>
      <div className={styles.headerLeft}>
        {/* 侧边栏切换按钮 */}
        <Button
          type="text"
          icon={appState.sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          className={styles.collapseButton}
        />

        {/* 面包屑导航 */}
        <div className={styles.breadcrumbContainer}>
          <Breadcrumb className={styles.breadcrumb}>
            <Breadcrumb.Item>
              <Text type="secondary">首页</Text>
            </Breadcrumb.Item>
            {appState.breadcrumbs.map((item, index) => (
              <Breadcrumb.Item key={index}>
                {item.path ? (
                  <a href={item.path} onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path!);
                  }}>
                    {item.title}
                  </a>
                ) : (
                  <Text>{item.title}</Text>
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </div>
      </div>

      <div className={styles.headerRight}>
        <Space size="middle">
          {/* 全屏切换 */}
          <Button
            type="text"
            icon={appState.isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullscreen}
            className={styles.actionButton}
            title={appState.isFullscreen ? '退出全屏' : '全屏'}
          />

          {/* 主题切换 */}
          <Button
            type="text"
            onClick={toggleTheme}
            className={styles.actionButton}
            title="切换主题"
          >
            🌙
          </Button>

          {/* 通知 */}
          <Dropdown
            menu={{ items: notificationMenuItems }}
            placement="bottomRight"
            trigger={['click']}
            arrow
          >
            <Badge count={appState.notificationCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className={styles.actionButton}
                title="通知"
              />
            </Badge>
          </Dropdown>

          {/* 用户信息 */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
            arrow
          >
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {authState.user?.username || '管理员'}
              </span>
            </div>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;