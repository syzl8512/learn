import React from 'react';
import { Card, Table, Tag, Button, Space, Tooltip, Typography, Progress } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SplitCellsOutlined,
  HistoryOutlined,
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { Book } from '@/types/books';
import styles from './BookList.module.scss';

const { Text } = Typography;

interface BookListProps {
  books: Book[];
  loading: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  onView: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onManageChapters: (book: Book) => void;
  onManageVersions: (book: Book) => void;
  onTableChange: (pagination: any) => void;
}

const BookList: React.FC<BookListProps> = ({
  books,
  loading,
  total,
  currentPage,
  pageSize,
  onView,
  onEdit,
  onDelete,
  onManageChapters,
  onManageVersions,
  onTableChange,
}) => {
  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const statusMap = {
      draft: { color: 'orange', text: '草稿', icon: <EditOutlined /> },
      published: { color: 'green', text: '已发布', icon: <FileTextOutlined /> },
      archived: { color: 'gray', text: '已归档', icon: <ClockCircleOutlined /> },
      processing: { color: 'blue', text: '处理中', icon: <ClockCircleOutlined /> },
    };
    return statusMap[status as keyof typeof statusMap] || { color: 'default', text: status, icon: <FileTextOutlined /> };
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty: number) => {
    const colors = ['green', 'blue', 'orange', 'red', 'purple'];
    return colors[difficulty - 1] || 'default';
  };

  // 表格列定义
  const columns = [
    {
      title: '书籍信息',
      key: 'bookInfo',
      width: 280,
      render: (record: Book) => (
        <div className={styles.bookInfo}>
          <div className={styles.bookTitle}>
            <BookOutlined style={{ color: '#8B5CF6', marginRight: 8 }} />
            <Text strong>{record.title}</Text>
          </div>
          <div className={styles.bookMeta}>
            <Space size="small">
              <Text type="secondary" className={styles.author}>
                <UserOutlined style={{ fontSize: 12, marginRight: 4 }} />
                {record.author}
              </Text>
              {record.wordCount && (
                <Text type="secondary">
                  {record.wordCount.toLocaleString()} 字
                </Text>
              )}
            </Space>
          </div>
          {record.description && (
            <div className={styles.bookDescription}>
              <Text type="secondary" ellipsis={{ tooltip: record.description }}>
                {record.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="blue" className={styles.categoryTag}>
          {category}
        </Tag>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 120,
      render: (difficulty: number, record: Book) => (
        <div className={styles.difficultyInfo}>
          <Tag color={getDifficultyColor(difficulty)} className={styles.difficultyTag}>
            难度 {difficulty}
          </Tag>
          {record.lexileLevel && (
            <Text type="secondary" className={styles.lexileLevel}>
              {record.lexileLevel}L
            </Text>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = getStatusColor(status);
        return (
          <Tag color={config.color} className={styles.statusTag}>
            {config.icon}
            <span style={{ marginLeft: 4 }}>{config.text}</span>
          </Tag>
        );
      },
    },
    {
      title: '阅读时长',
      key: 'readingTime',
      width: 120,
      render: (record: Book) => {
        if (record.estimatedReadingTime) {
          return (
            <div className={styles.readingTime}>
              <ClockCircleOutlined style={{ color: '#8B5CF6', marginRight: 4 }} />
              <Text>{record.estimatedReadingTime} 分钟</Text>
            </div>
          );
        }
        if (record.wordCount) {
          const estimatedTime = Math.ceil(record.wordCount / 200); // 假设每分钟200字
          return (
            <div className={styles.readingTime}>
              <ClockCircleOutlined style={{ color: '#8B5CF6', marginRight: 4 }} />
              <Text>{estimatedTime} 分钟</Text>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (createdAt: string) => (
        <Text type="secondary">
          {new Date(createdAt).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 280,
      fixed: 'right' as const,
      render: (record: Book) => (
        <Space size="small" className={styles.actionButtons}>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              className={styles.actionButton}
            />
          </Tooltip>
          <Tooltip title="编辑书籍">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              className={styles.actionButton}
            />
          </Tooltip>
          <Tooltip title="管理章节">
            <Button
              type="text"
              size="small"
              icon={<SplitCellsOutlined />}
              onClick={() => onManageChapters(record)}
              className={styles.actionButton}
            />
          </Tooltip>
          <Tooltip title="版本管理">
            <Button
              type="text"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => onManageVersions(record)}
              className={styles.actionButton}
            />
          </Tooltip>
          <Tooltip title="删除书籍">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
              className={styles.actionButton}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card className={styles.bookListCard}>
      <Table
        columns={columns}
        dataSource={books}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={onTableChange}
        className={styles.bookTable}
        scroll={{ x: 1200 }}
        rowClassName={(record) =>
          `${styles.tableRow} ${styles[`status-${record.status}`]}`
        }
      />
    </Card>
  );
};

export default BookList;