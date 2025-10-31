import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Drawer,
  Tabs,
  Alert,
  Progress,
  message,
  Popconfirm,
  Tag,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SplitCellsOutlined,
  FileTextOutlined,
  DragOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Book, Chapter, ChapterSearchParams } from '@types/books';
import { bookService } from '@services';
import ChapterForm from './ChapterForm';
import ChapterContentEditor from './ChapterContentEditor';
import styles from './ChapterManager.module.scss';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface ChapterManagerProps {
  book: Book;
  onClose: () => void;
}

const ChapterManager: React.FC<ChapterManagerProps> = ({ book, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // 模态框状态
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [contentDrawerVisible, setContentDrawerVisible] = useState(false);
  const [splitModalVisible, setSplitModalVisible] = useState(false);

  // 分页和搜索
  const [searchParams, setSearchParams] = useState<ChapterSearchParams>({
    bookId: book.id,
    page: 1,
    pageSize: 10,
  });

  // 分割章节相关
  const [splitting, setSplitting] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);
  const [splitForm] = Form.useForm();

  useEffect(() => {
    fetchChapters();
  }, [searchParams]);

  // 获取章节列表
  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await bookService.getChapters(searchParams);
      const { data } = response;

      if (data.success && data.data) {
        setChapters(data.data.items);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
      message.error('获取章节列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理表格变化
  const handleTableChange = (pagination: any) => {
    setSearchParams(prev => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  // 创建章节
  const handleCreateChapter = () => {
    setSelectedChapter(null);
    setFormModalVisible(true);
  };

  // 编辑章节
  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setFormModalVisible(true);
  };

  // 删除章节
  const handleDeleteChapter = async (chapter: Chapter) => {
    try {
      await bookService.deleteChapter(chapter.id);
      message.success('删除成功');
      fetchChapters();
    } catch (error) {
      console.error('Failed to delete chapter:', error);
      message.error('删除失败');
    }
  };

  // 查看章节内容
  const handleViewContent = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setContentDrawerVisible(true);
  };

  // 保存章节
  const handleSaveChapter = async (values: any) => {
    try {
      if (selectedChapter) {
        await bookService.updateChapter(selectedChapter.id, values);
        message.success('更新成功');
      } else {
        await bookService.createChapter({
          ...values,
          bookId: book.id,
        });
        message.success('创建成功');
      }
      setFormModalVisible(false);
      setSelectedChapter(null);
      fetchChapters();
    } catch (error) {
      console.error('Failed to save chapter:', error);
      message.error('保存失败');
    }
  };

  // 自动分割章节
  const handleAutoSplit = async (values: any) => {
    try {
      setSplitting(true);
      setSplitProgress(0);

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setSplitProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      await bookService.autoSplitChapters(book.id, {
        maxWordsPerChapter: values.maxWordsPerChapter,
        strategy: values.strategy,
      });

      clearInterval(progressInterval);
      setSplitProgress(100);
      message.success('章节分割完成');
      setSplitModalVisible(false);
      fetchChapters();
    } catch (error) {
      console.error('Failed to split chapters:', error);
      message.error('章节分割失败');
    } finally {
      setSplitting(false);
      setSplitProgress(0);
    }
  };

  // 章节状态
  const getStatusColor = (status: string) => {
    const statusMap = {
      draft: { color: 'orange', text: '草稿' },
      published: { color: 'green', text: '已发布' },
    };
    return statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
  };

  // 表格列定义
  const columns = [
    {
      title: '章节',
      key: 'chapter',
      render: (record: Chapter) => (
        <div className={styles.chapterInfo}>
          <div className={styles.chapterTitle}>
            <FileTextOutlined style={{ color: '#8B5CF6', marginRight: 8 }} />
            <Text strong>{record.title}</Text>
          </div>
          <Text type="secondary" className={styles.chapterOrder}>
            第 {record.order} 章
          </Text>
        </div>
      ),
    },
    {
      title: '字数',
      dataIndex: 'wordCount',
      key: 'wordCount',
      render: (wordCount?: number) => (
        wordCount ? wordCount.toLocaleString() : '-'
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getStatusColor(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => (
        new Date(createdAt).toLocaleDateString()
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: Chapter) => (
        <Space size="small">
          <Tooltip title="查看内容">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewContent(record)}
            />
          </Tooltip>
          <Tooltip title="编辑章节">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditChapter(record)}
            />
          </Tooltip>
          <Tooltip title="删除章节">
            <Popconfirm
              title="确认删除"
              description={`确定要删除"${record.title}"吗？`}
              onConfirm={() => handleDeleteChapter(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.chapterManager}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Title level={4} className={styles.title}>
            {book.title} - 章节管理
          </Title>
          <Text type="secondary">
            共 {total} 个章节 • 管理书籍章节结构和内容
          </Text>
        </div>
        <Space>
          <Button
            icon={<SplitCellsOutlined />}
            onClick={() => setSplitModalVisible(true)}
            className={styles.splitButton}
          >
            智能分割
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateChapter}
            className={styles.createButton}
          >
            新建章节
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        <Card className={styles.chapterTableCard}>
          <Table
            columns={columns}
            dataSource={chapters}
            rowKey="id"
            loading={loading}
            pagination={{
              current: searchParams.page,
              pageSize: searchParams.pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 个章节`,
              pageSizeOptions: ['10', '20', '50'],
            }}
            onChange={handleTableChange}
            className={styles.chapterTable}
          />
        </Card>
      </div>

      {/* 章节表单模态框 */}
      <Modal
        title={selectedChapter ? '编辑章节' : '新建章节'}
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          setSelectedChapter(null);
        }}
        footer={null}
        width={600}
      >
        <ChapterForm
          chapter={selectedChapter}
          onSave={handleSaveChapter}
          onCancel={() => {
            setFormModalVisible(false);
            setSelectedChapter(null);
          }}
        />
      </Modal>

      {/* 章节内容抽屉 */}
      <Drawer
        title={`章节内容 - ${selectedChapter?.title}`}
        placement="right"
        open={contentDrawerVisible}
        onClose={() => {
          setContentDrawerVisible(false);
          setSelectedChapter(null);
        }}
        width={1000}
      >
        {selectedChapter && (
          <ChapterContentEditor
            chapter={selectedChapter}
            onSave={() => {
              setContentDrawerVisible(false);
              fetchChapters();
            }}
          />
        )}
      </Drawer>

      {/* 智能分割模态框 */}
      <Modal
        title="智能分割章节"
        open={splitModalVisible}
        onCancel={() => setSplitModalVisible(false)}
        footer={null}
        width={500}
      >
        <Alert
          message="智能分割说明"
          description="系统将根据您选择的策略自动将书籍内容分割为多个章节，您可以设置每章的最大字数和分割策略。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={splitForm}
          layout="vertical"
          onFinish={handleAutoSplit}
          initialValues={{
            maxWordsPerChapter: 1000,
            strategy: 'paragraph',
          }}
        >
          <Form.Item
            name="maxWordsPerChapter"
            label="每章最大字数"
            rules={[{ required: true, message: '请输入每章最大字数' }]}
          >
            <Input
              type="number"
              placeholder="请输入每章最大字数"
              suffix="字"
            />
          </Form.Item>

          <Form.Item
            name="strategy"
            label="分割策略"
            rules={[{ required: true, message: '请选择分割策略' }]}
          >
            <Select placeholder="请选择分割策略">
              <Option value="paragraph">按段落分割</Option>
              <Option value="sentence">按句子分割</Option>
              <Option value="semantic">按语义分割</Option>
              <Option value="mixed">混合策略</Option>
            </Select>
          </Form.Item>

          {splitting && (
            <div style={{ marginBottom: 16 }}>
              <Progress
                percent={splitProgress}
                status="active"
                strokeColor="#8B5CF6"
              />
              <Text type="secondary">正在智能分割章节...</Text>
            </div>
          )}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={splitting}
                style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
              >
                {splitting ? '分割中...' : '开始分割'}
              </Button>
              <Button onClick={() => setSplitModalVisible(false)} disabled={splitting}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChapterManager;