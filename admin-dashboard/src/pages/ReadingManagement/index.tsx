import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Space, Table, Tag, Upload, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, UploadOutlined, FileTextOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useApp } from '@contexts/AppContext';
import type { Book, BookSearchParams } from '@/types/books';
import { bookService } from '@services';
import styles from './ReadingManagement.module.scss';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ReadingManagement: React.FC = () => {
  const { setPageTitle, setPageDescription } = useApp();
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [form] = Form.useForm();

  const [searchParams, setSearchParams] = useState<BookSearchParams>({
    page: 1,
    pageSize: 10,
  });

  // 获取书籍列表
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks(searchParams);
      if (response.data && response.data.data) {
        setBooks(response.data.data || []);
        setTotal(response.data.meta?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
      // 网络错误时静默处理，不显示错误消息（后端可能未启动）
      const axiosError = error as any;
      if (axiosError.code !== 'ERR_NETWORK' && axiosError.message !== 'Network Error') {
        message.error('获取书籍列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始化页面标题和描述
  useEffect(() => {
    setPageTitle('阅读书籍管理');
    setPageDescription('管理英文原版书籍、章节和版本');
  }, [setPageTitle, setPageDescription]);

  // 处理搜索参数变化，获取书籍列表
  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 表格列定义
  const columns = [
    {
      title: '书籍信息',
      key: 'bookInfo',
      render: (record: Book) => (
        <div className={styles.bookInfo}>
          <div className={styles.bookTitle}>{record.title}</div>
          <div className={styles.bookAuthor}>作者: {record.author}</div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '难度等级',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: number) => {
        const colors = ['green', 'blue', 'orange', 'red', 'purple'];
        return <Tag color={colors[difficulty - 1]}>难度 {difficulty}</Tag>;
      },
    },
    {
      title: '蓝斯值',
      dataIndex: 'lexileLevel',
      key: 'lexileLevel',
      render: (lexileLevel?: number) => (
        lexileLevel ? `${lexileLevel}L` : '-'
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
        const statusMap = {
          draft: { color: 'orange', text: '草稿' },
          published: { color: 'green', text: '已发布' },
          archived: { color: 'gray', text: '已归档' },
        };
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
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
      render: (record: Book) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewBook(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditBook(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteBook(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处理表格变化
  const handleTableChange = (pagination: any) => {
    setSearchParams(prev => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  // 查看书籍
  const handleViewBook = (book: Book) => {
    message.info(`查看书籍: ${book.title}`);
  };

  // 编辑书籍
  const handleEditBook = (book: Book) => {
    setCurrentBook(book);
    form.setFieldsValue(book);
    setEditModalVisible(true);
  };

  // 删除书籍
  const handleDeleteBook = (book: Book) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除《${book.title}》吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await bookService.deleteBook(book.id);
          message.success('删除成功');
          fetchBooks();
        } catch (error) {
          console.error('Failed to delete book:', error);
          message.error('删除失败');
        }
      },
    });
  };

  // 保存书籍
  const handleSaveBook = async (values: any) => {
    try {
      if (currentBook) {
        await bookService.updateBook(currentBook.id, values);
        message.success('更新成功');
      } else {
        await bookService.createBook(values);
        message.success('创建成功');
      }
      setEditModalVisible(false);
      setCurrentBook(null);
      form.resetFields();
      fetchBooks();
    } catch (error) {
      console.error('Failed to save book:', error);
      message.error('保存失败');
    }
  };

  // 上传PDF
  const handleUploadPdf = (file: File) => {
    // 实现PDF上传逻辑
    message.info('PDF上传功能将在后续版本中实现');
    return false;
  };

  return (
    <div className={styles.readingManagement}>
      {/* 页面标题区域 */}
      <div className={styles.pageHeader}>
        <Title level={2}>阅读书籍管理</Title>
        <Paragraph type="secondary">
          管理英文原版书籍、章节划分、多版本生成和内容适配
        </Paragraph>
      </div>

      {/* 操作区域 */}
      <div className={styles.actionBar}>
        <Space size="middle">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentBook(null);
              form.resetFields();
              setEditModalVisible(true);
            }}
          >
            新建书籍
          </Button>
          <Upload
            accept=".pdf"
            beforeUpload={handleUploadPdf}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>
              上传PDF
            </Button>
          </Upload>
        </Space>
      </div>

      {/* 书籍列表 */}
      <Card className={styles.bookTableCard}>
        <Table
          columns={columns}
          dataSource={books}
          rowKey="id"
          loading={loading}
          pagination={{
            current: searchParams.page,
            pageSize: searchParams.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          className={styles.bookTable}
        />
      </Card>

      {/* 新建/编辑书籍模态框 */}
      <Modal
        title={currentBook ? '编辑书籍' : '新建书籍'}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentBook(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveBook}
        >
          <Form.Item
            name="title"
            label="书籍标题"
            rules={[{ required: true, message: '请输入书籍标题' }]}
          >
            <Input placeholder="请输入书籍标题" />
          </Form.Item>

          <Form.Item
            name="author"
            label="作者"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input placeholder="请输入作者" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="故事">故事</Option>
              <Option value="科普">科普</Option>
              <Option value="历史">历史</Option>
              <Option value="文学">文学</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="难度等级"
            rules={[{ required: true, message: '请选择难度等级' }]}
          >
            <Select placeholder="请选择难度等级">
              <Option value={1}>难度 1 (入门)</Option>
              <Option value={2}>难度 2 (初级)</Option>
              <Option value={3}>难度 3 (中级)</Option>
              <Option value={4}>难度 4 (高级)</Option>
              <Option value={5}>难度 5 (专家)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="lexileLevel"
            label="蓝斯值"
          >
            <Input
              type="number"
              placeholder="请输入蓝斯值 (可选)"
              suffix="L"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入书籍描述"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReadingManagement;