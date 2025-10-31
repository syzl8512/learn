import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Space, Table, Tag, Modal, Input, Select, Row, Col, Statistic, message } from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useApp } from '@contexts/AppContext';
import type { Book, BookSearchParams } from '@/types/books';
import { bookService } from '@services';
import PDFUpload from '@components/reading/PDFUpload';
import BookList from '@components/reading/BookList';
import BookForm from '@components/reading/BookForm';
import ChapterManager from '@components/reading/ChapterManager';
import VersionManager from '@components/reading/VersionManager';
import styles from './BookManagement.module.scss';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

const BookManagement: React.FC = () => {
  const { setPageTitle, setPageDescription } = useApp();
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    processing: 0
  });

  // 模态框状态
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  // 搜索和筛选
  const [searchParams, setSearchParams] = useState<BookSearchParams>({
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    setPageTitle('阅读书籍管理');
    setPageDescription('管理英文原版书籍、章节划分、多版本生成和内容适配');
    fetchBooks();
    fetchStats();
  }, [setPageTitle, setPageDescription]);

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
      message.error('获取书籍列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      // 这里应该调用统计API，暂时使用模拟数据
      setStats({
        total: books.length,
        published: books.filter(b => b.status === 'published').length,
        draft: books.filter(b => b.status === 'draft').length,
        processing: books.filter(b => b.status === 'processing').length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // 处理搜索参数变化
  useEffect(() => {
    fetchBooks();
    fetchStats();
  }, [searchParams]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchParams(prev => ({
      ...prev,
      keyword: value,
      page: 1
    }));
  };

  // 处理筛选
  const handleFilter = (key: string, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

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
    setCurrentBook(book);
    // 这里可以打开详情查看模态框或跳转到详情页
    message.info(`查看书籍: ${book.title}`);
  };

  // 编辑书籍
  const handleEditBook = (book: Book) => {
    setCurrentBook(book);
    setFormModalVisible(true);
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

  // 管理章节
  const handleManageChapters = (book: Book) => {
    setCurrentBook(book);
    setChapterModalVisible(true);
  };

  // 管理版本
  const handleManageVersions = (book: Book) => {
    setCurrentBook(book);
    setVersionModalVisible(true);
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
      setFormModalVisible(false);
      setCurrentBook(null);
      fetchBooks();
    } catch (error) {
      console.error('Failed to save book:', error);
      message.error('保存失败');
    }
  };

  // 上传成功处理
  const handleUploadSuccess = (bookData: any) => {
    setUploadModalVisible(false);
    fetchBooks();
    message.success('PDF上传成功，正在处理中...');
  };

  return (
    <div className={styles.bookManagement}>
      {/* 页面标题区域 */}
      <div className={styles.pageHeader}>
        <Title level={2}>阅读书籍管理</Title>
        <Paragraph type="secondary">
          管理英文原版书籍、章节划分、多版本生成和内容适配
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总书籍数"
              value={stats.total}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#8B5CF6' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已发布"
              value={stats.published}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="草稿"
              value={stats.draft}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="处理中"
              value={stats.processing}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作区域 */}
      <Card className={styles.actionCard}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <Search
                placeholder="搜索书籍标题或作者"
                allowClear
                style={{ width: 300 }}
                onSearch={handleSearch}
              />
              <Select
                placeholder="选择分类"
                allowClear
                style={{ width: 120 }}
                onChange={(value) => handleFilter('category', value)}
              >
                <Option value="故事">故事</Option>
                <Option value="科普">科普</Option>
                <Option value="历史">历史</Option>
                <Option value="文学">文学</Option>
                <Option value="其他">其他</Option>
              </Select>
              <Select
                placeholder="难度等级"
                allowClear
                style={{ width: 120 }}
                onChange={(value) => handleFilter('difficulty', value)}
              >
                <Option value={1}>难度 1</Option>
                <Option value={2}>难度 2</Option>
                <Option value={3}>难度 3</Option>
                <Option value={4}>难度 4</Option>
                <Option value={5}>难度 5</Option>
              </Select>
              <Select
                placeholder="状态"
                allowClear
                style={{ width: 120 }}
                onChange={(value) => handleFilter('status', value)}
              >
                <Option value="draft">草稿</Option>
                <Option value="published">已发布</Option>
                <Option value="archived">已归档</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentBook(null);
                  setFormModalVisible(true);
                }}
                style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
              >
                新建书籍
              </Button>
              <Button
                icon={<UploadOutlined />}
                onClick={() => setUploadModalVisible(true)}
              >
                上传PDF
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 书籍列表 */}
      <BookList
        books={books}
        loading={loading}
        total={total}
        currentPage={searchParams.page}
        pageSize={searchParams.pageSize}
        onView={handleViewBook}
        onEdit={handleEditBook}
        onDelete={handleDeleteBook}
        onManageChapters={handleManageChapters}
        onManageVersions={handleManageVersions}
        onTableChange={handleTableChange}
      />

      {/* PDF上传模态框 */}
      <Modal
        title="上传PDF文件"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <PDFUpload
          onSuccess={handleUploadSuccess}
          onCancel={() => setUploadModalVisible(false)}
        />
      </Modal>

      {/* 书籍表单模态框 */}
      <Modal
        title={currentBook ? '编辑书籍' : '新建书籍'}
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          setCurrentBook(null);
        }}
        footer={null}
        width={800}
      >
        <BookForm
          book={currentBook}
          onSave={handleSaveBook}
          onCancel={() => {
            setFormModalVisible(false);
            setCurrentBook(null);
          }}
        />
      </Modal>

      {/* 章节管理模态框 */}
      <Modal
        title={`章节管理 - ${currentBook?.title}`}
        open={chapterModalVisible}
        onCancel={() => {
          setChapterModalVisible(false);
          setCurrentBook(null);
        }}
        footer={null}
        width={1200}
      >
        {currentBook && (
          <ChapterManager
            book={currentBook}
            onClose={() => {
              setChapterModalVisible(false);
              setCurrentBook(null);
              fetchBooks();
            }}
          />
        )}
      </Modal>

      {/* 版本管理模态框 */}
      <Modal
        title={`版本管理 - ${currentBook?.title}`}
        open={versionModalVisible}
        onCancel={() => {
          setVersionModalVisible(false);
          setCurrentBook(null);
        }}
        footer={null}
        width={1200}
      >
        {currentBook && (
          <VersionManager
            book={currentBook}
            onClose={() => {
              setVersionModalVisible(false);
              setCurrentBook(null);
              fetchBooks();
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default BookManagement;