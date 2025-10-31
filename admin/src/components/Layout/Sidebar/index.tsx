import React, { useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
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
  BellOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useApp } from '@contexts/AppContext';
import { MenuItem } from '../../../types/common';
import styles from './Sidebar.module.scss';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: authState, logout } = useAuth();
  const { state: appState, toggleSidebar, setSelectedMenu, setOpenMenus } = useApp();

  // 菜单配置
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      label: '仪表板',
      icon: 'DashboardOutlined',
      path: '/dashboard',
    },
    {
      key: 'reading',
      label: '阅读管理',
      icon: 'BookOutlined',
      path: '/reading',
      children: [
        {
          key: 'reading-overview',
          label: '阅读概览',
          icon: 'DashboardOutlined',
          path: '/reading',
        },
        {
          key: 'reading-books',
          label: '书籍管理',
          icon: 'BookOutlined',
          path: '/reading/books',
        },
      ],
    },
    {
      key: 'listening',
      label: '听力材料管理',
      icon: 'SoundOutlined',
      path: '/listening',
    },
    {
      key: 'dictionary',
      label: '词典管理',
      icon: 'FileTextOutlined',
      path: '/dictionary',
    },
    {
      key: 'users',
      label: '用户管理',
      icon: 'UserOutlined',
      path: '/users',
    },
    {
      key: 'settings',
      label: '系统设置',
      icon: 'SettingOutlined',
      path: '/settings',
    },
  ];

  // 获取图标组件
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      DashboardOutlined: <DashboardOutlined />,
      BookOutlined: <BookOutlined />,
      SoundOutlined: <SoundOutlined />,
      FileTextOutlined: <FileTextOutlined />,
      UserOutlined: <UserOutlined />,
      SettingOutlined: <SettingOutlined />,
    };
    return iconMap[iconName] || <FileTextOutlined />;
  };

  // 递归转换菜单数据格式
  const convertMenuItems = (items: MenuItem[]): any[] => {
    return items.map((item) => {
      const menuItem: any = {
        key: item.key,
        icon: getIcon(item.icon!),
        label: item.label,
      };

      if (item.children && item.children.length > 0) {
        menuItem.children = convertMenuItems(item.children);
      } else {
        menuItem.onClick = () => handleMenuClick(item);
      }

      return menuItem;
    });
  };

  // 处理菜单点击
  const handleMenuClick = (menuItem: MenuItem): void => {
    if (menuItem.path) {
      navigate(menuItem.path);
      setSelectedMenu(menuItem.key);
    }
  };

  // 根据当前路由设置选中的菜单
  useEffect(() => {
    const currentPath = location.pathname;
    let selectedKeys: string[] = [];
    let openKeys: string[] = [];

    const findMatchingMenu = (items: MenuItem[], parentKey?: string): boolean => {
      for (const item of items) {
        if (item.path === currentPath) {
          selectedKeys.push(item.key);
          if (parentKey) {
            openKeys.push(parentKey);
          }
          return true;
        }

        if (item.children) {
          if (findMatchingMenu(item.children, item.key)) {
            selectedKeys.push(item.key);
            return true;
          }
        }
      }
      return false;
    };

    findMatchingMenu(menuItems);

    setSelectedMenu(selectedKeys[0] || '');
    setOpenMenus(openKeys);
  }, [location.pathname, menuItems, setSelectedMenu, setOpenMenus]);

  const menuData = convertMenuItems(menuItems);

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
      onClick: logout,
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={appState.sidebarCollapsed}
      className={styles.sidebar}
      width={240}
      collapsedWidth={80}
    >
      {/* Logo区域 */}
      <div className={styles.logo}>
        <div className={styles.logoContainer}>
          {!appState.sidebarCollapsed ? (
            <>
              <div className={styles.logoIcon}>
                <BookOutlined />
              </div>
              <div className={styles.logoText}>
                <div className={styles.logoTitle}>阅读平台</div>
                <div className={styles.logoSubtitle}>管理后台</div>
              </div>
            </>
          ) : (
            <div className={styles.logoIconCollapsed}>
              <BookOutlined />
            </div>
          )}
        </div>
      </div>

      {/* 菜单区域 */}
      <div className={styles.menuContainer}>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[appState.selectedMenuKey]}
          openKeys={appState.openMenuKeys}
          onOpenChange={setOpenMenus}
          items={menuData}
          className={styles.menu}
        />
      </div>

      {/* 底部用户区域 */}
      <div className={styles.userSection}>
        {!appState.sidebarCollapsed ? (
          <div className={styles.userInfo}>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="topRight"
              trigger={['click']}
              arrow
            >
              <div className={styles.userDropdown}>
                <Avatar
                  size="small"
                  src={authState.user?.avatar}
                  icon={<UserOutlined />}
                  className={styles.userAvatar}
                />
                <div className={styles.userDetails}>
                  <div className={styles.userName}>
                    {authState.user?.username || '管理员'}
                  </div>
                  <div className={styles.userRole}>
                    {authState.user?.role || 'Admin'}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        ) : (
          <div className={styles.userSectionCollapsed}>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="topRight"
              trigger={['click']}
              arrow
            >
              <Avatar
                size="small"
                src={authState.user?.avatar}
                icon={<UserOutlined />}
                className={styles.userAvatarCollapsed}
              />
            </Dropdown>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default Sidebar;