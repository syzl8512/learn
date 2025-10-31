import React, { useEffect } from 'react';
import { Card, Typography, Table, Tag, Space, Button, Input, Select } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useApp } from '@contexts/AppContext';
import styles from './UserManagement.module.scss';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const UserManagement: React.FC = () => {
  const { setPageTitle, setPageDescription } = useApp();

  useEffect(() => {
    setPageTitle('用户管理');
    setPageDescription('查看和管理平台用户信息');
  }, [setPageTitle, setPageDescription]);

  // 模拟用户数据
  const users = [
    {
      id: '1',
      username: 'student001',
      email: 'student001@example.com',
      role: 'student',
      status: 'active',
      lastLoginAt: '2025-10-30T10:30:00Z',
      createdAt: '2025-09-15T08:00:00Z',
      readingLevel: 'Level 2',
      booksRead: 15,
      vocabularyCount: 234,
    },
    {
      id: '2',
      username: 'student002',
      email: 'student002@example.com',
      role: 'student',
      status: 'active',
      lastLoginAt: '2025-10-29T15:45:00Z',
      createdAt: '2025-09-20T09:30:00Z',
      readingLevel: 'Level 3',
      booksRead: 23,
      vocabularyCount: 456,
    },
  ];

  const columns = [
    {
      title: '用户信息',
      key: 'userInfo',
      render: (record: any) => (
        <div className={styles.userInfo}>
          <div className={styles.username}>{record.username}</div>
          <div className={styles.email}>{record.email}</div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap = {
          student: { color: 'blue', text: '学生' },
          admin: { color: 'red', text: '管理员' },
        };
        const config = roleMap[role as keyof typeof roleMap] || { color: 'default', text: role };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'green', text: '活跃' },
          inactive: { color: 'gray', text: '停用' },
        };
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '阅读等级',
      dataIndex: 'readingLevel',
      key: 'readingLevel',
    },
    {
      title: '已读书籍',
      dataIndex: 'booksRead',
      key: 'booksRead',
    },
    {
      title: '词汇量',
      dataIndex: 'vocabularyCount',
      key: 'vocabularyCount',
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => console.log('View user:', record)}
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => console.log('Edit user:', record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.userManagement}>
      <div className={styles.pageHeader}>
        <Title level={2}>用户管理</Title>
        <Paragraph type="secondary">
          查看和管理平台用户信息、学习进度和使用频率
        </Paragraph>
      </div>

      <div className={styles.actionBar}>
        <Space size="middle">
          <Input
            placeholder="搜索用户名或邮箱"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Select placeholder="用户角色" style={{ width: 120 }} allowClear>
            <Option value="student">学生</Option>
            <Option value="admin">管理员</Option>
          </Select>
          <Select placeholder="用户状态" style={{ width: 120 }} allowClear>
            <Option value="active">活跃</Option>
            <Option value="inactive">停用</Option>
          </Select>
        </Space>
      </div>

      <Card className={styles.userTableCard}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
};

export default UserManagement;