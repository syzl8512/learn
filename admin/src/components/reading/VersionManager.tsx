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
  InputNumber,
  Alert,
  Progress,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Tabs,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  HistoryOutlined,
  FileTextOutlined,
  RocketOutlined,
  SettingOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { Book, Chapter, ChapterVersion } from '@/types/books';
import { bookService } from '@services';
import VersionComparison from './VersionComparison';
import styles from './VersionManager.module.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface VersionManagerProps {
  book: Book;
  onClose: () => void;
}

const VersionManager: React.FC<VersionManagerProps> = ({ book, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [versions, setVersions] = useState<ChapterVersion[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<ChapterVersion[]>([]);

  // 模态框状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [comparisonModalVisible, setComparisonModalVisible] = useState(false);
  const [batchGenerateModalVisible, setBatchGenerateModalVisible] = useState(false);

  // 处理状态
  const [generating, setGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [publishing, setPublishing] = useState(false);

  // 表单
  const [createForm] = Form.useForm();
  const [batchForm] = Form.useForm();

  useEffect(() => {
    fetchChapters();
  }, [book.id]);

  // 获取章节列表
  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await bookService.getChapters({ bookId: book.id, page: 1, pageSize: 100 });
      if (response.data.success && response.data.data) {
        setChapters(response.data.data.items);
        if (response.data.data.items.length > 0) {
          setSelectedChapter(response.data.data.items[0]);
          fetchChapterVersions(response.data.data.items[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
      message.error('获取章节列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取章节版本列表
  const fetchChapterVersions = async (chapterId: string) => {
    try {
      setLoading(true);
      const response = await bookService.getChapterVersions(chapterId);
      if (response.data.success && response.data.data) {
        setVersions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch chapter versions:', error);
      message.error('获取版本列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 选择章节
  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    fetchChapterVersions(chapter.id);
  };

  // 创建版本
  const handleCreateVersion = async (values: any) => {
    if (!selectedChapter) return;

    try {
      setGenerating(true);
      setGenerateProgress(0);

      // 模拟进度
      const progressInterval = setInterval(() => {
        setGenerateProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const versionData = {
        ...values,
        chapterId: selectedChapter.id,
        content: selectedChapter.content || '',
      };

      const response = await bookService.createChapterVersion(selectedChapter.id, versionData);

      clearInterval(progressInterval);
      setGenerateProgress(100);

      if (response.data.success) {
        message.success('版本创建成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchChapterVersions(selectedChapter.id);
      }
    } catch (error) {
      console.error('Failed to create version:', error);
      message.error('创建版本失败');
    } finally {
      setGenerating(false);
      setGenerateProgress(0);
    }
  };

  // 发布版本
  const handlePublishVersion = async (versionId: string) => {
    try {
      setPublishing(true);
      await bookService.publishChapterVersion(versionId);
      message.success('版本发布成功');
      if (selectedChapter) {
        fetchChapterVersions(selectedChapter.id);
      }
    } catch (error) {
      console.error('Failed to publish version:', error);
      message.error('发布失败');
    } finally {
      setPublishing(false);
    }
  };

  // 删除版本
  const handleDeleteVersion = async (versionId: string) => {
    try {
      await bookService.deleteChapterVersion(versionId);
      message.success('删除成功');
      if (selectedChapter) {
        fetchChapterVersions(selectedChapter.id);
      }
    } catch (error) {
      console.error('Failed to delete version:', error);
      message.error('删除失败');
    }
  };

  // 批量生成版本
  const handleBatchGenerate = async (values: any) => {
    try {
      setGenerating(true);
      setGenerateProgress(0);

      // 模拟进度
      const progressInterval = setInterval(() => {
        setGenerateProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 800);

      await bookService.batchGenerateVersions(book.id, values);

      clearInterval(progressInterval);
      setGenerateProgress(100);

      message.success('批量生成完成');
      setBatchGenerateModalVisible(false);
      batchForm.resetFields();
      if (selectedChapter) {
        fetchChapterVersions(selectedChapter.id);
      }
    } catch (error) {
      console.error('Failed to batch generate versions:', error);
      message.error('批量生成失败');
    } finally {
      setGenerating(false);
      setGenerateProgress(0);
    }
  };

  // 比较版本
  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      message.warning('请选择两个版本进行比较');
      return;
    }
    setComparisonModalVisible(true);
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const statusMap = {
      draft: { color: 'orange', text: '草稿' },
      published: { color: 'green', text: '已发布' },
    };
    return statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
  };

  // 版本表格列
  const versionColumns = [
    {
      title: '版本',
      key: 'version',
      render: (record: ChapterVersion) => (
        <div className={styles.versionInfo}>
          <div className={styles.versionNumber}>
            <FileTextOutlined style={{ color: '#8B5CF6', marginRight: 8 }} />
            <Text strong>v{record.version}</Text>
          </div>
          <Text type="secondary" className={styles.creator}>
            创建者: {record.createdBy}
          </Text>
        </div>
      ),
    },
    {
      title: '难度等级',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: number) => (
        <Tag color={['green', 'blue', 'orange', 'red', 'purple'][difficulty - 1]}>
          难度 {difficulty}
        </Tag>
      ),
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
      render: (wordCount: number) => (
        wordCount.toLocaleString()
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
      render: (record: ChapterVersion) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <Tooltip title="发布版本">
              <Button
                type="text"
                size="small"
                icon={<RocketOutlined />}
                onClick={() => handlePublishVersion(record.id)}
                loading={publishing}
              />
            </Tooltip>
          )}
          <Tooltip title="删除版本">
            <Popconfirm
              title="确认删除"
              description={`确定要删除版本 v${record.version} 吗？`}
              onConfirm={() => handleDeleteVersion(record.id)}
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
    <div className={styles.versionManager}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Title level={4} className={styles.title}>
            {book.title} - 版本管理
          </Title>
          <Text type="secondary">
            管理章节的不同难度版本和发布状态
          </Text>
        </div>
        <Space>
          <Button
            icon={<SwapOutlined />}
            onClick={handleCompareVersions}
            disabled={selectedVersions.length !== 2}
            className={styles.compareButton}
          >
            比较版本
          </Button>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setBatchGenerateModalVisible(true)}
            className={styles.batchButton}
          >
            批量生成
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            disabled={!selectedChapter}
            className={styles.createButton}
          >
            新建版本
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        {/* 章节选择 */}
        <Card className={styles.chapterSelectorCard}>
          <div className={styles.chapterSelector}>
            <Title level={5}>选择章节</Title>
            <div className={styles.chapterList}>
              {chapters.map(chapter => (
                <Button
                  key={chapter.id}
                  type={selectedChapter?.id === chapter.id ? 'primary' : 'default'}
                  onClick={() => handleSelectChapter(chapter)}
                  className={styles.chapterButton}
                >
                  第{chapter.order}章: {chapter.title}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* 版本列表 */}
        <Card
          className={styles.versionTableCard}
          title={`版本列表 - ${selectedChapter?.title || '请选择章节'}`}
          extra={
            <Space>
              <Text type="secondary">
                共 {versions.length} 个版本
              </Text>
            </Space>
          }
        >
          <Table
            columns={versionColumns}
            dataSource={versions}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 个版本`,
              pageSizeOptions: ['10', '20', '50'],
            }}
            rowSelection={{
              selectedRowKeys: selectedVersions.map(v => v.id),
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedVersions(selectedRows as ChapterVersion[]);
              },
              type: 'checkbox',
            }}
            className={styles.versionTable}
          />
        </Card>
      </div>

      {/* 创建版本模态框 */}
      <Modal
        title="创建新版本"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Alert
          message="版本创建说明"
          description="创建基于当前章节内容的新版本，可以设置不同的难度等级和目标蓝斯值。系统将自动调整内容难度。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateVersion}
        >
          <Form.Item
            name="version"
            label="版本号"
            rules={[{ required: true, message: '请输入版本号' }]}
          >
            <Input placeholder="例如: 1.1.0" />
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
            label="目标蓝斯值"
          >
            <InputNumber
              placeholder="可选"
              min={0}
              max={2000}
              style={{ width: '100%' }}
              formatter={value => `${value}L`}
              parser={value => value!.replace('L', '')}
            />
          </Form.Item>

          {generating && (
            <div style={{ marginBottom: 16 }}>
              <Progress
                percent={generateProgress}
                status="active"
                strokeColor="#8B5CF6"
              />
              <Text type="secondary">正在生成适配版本...</Text>
            </div>
          )}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={generating}
                style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
              >
                {generating ? '生成中...' : '创建版本'}
              </Button>
              <Button onClick={() => setCreateModalVisible(false)} disabled={generating}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量生成模态框 */}
      <Modal
        title="批量生成版本"
        open={batchGenerateModalVisible}
        onCancel={() => {
          setBatchGenerateModalVisible(false);
          batchForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Alert
          message="批量生成说明"
          description="为所有章节生成指定难度的版本，适合快速创建不同难度级别的完整书籍版本。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={batchForm}
          layout="vertical"
          onFinish={handleBatchGenerate}
        >
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
            name="targetLexile"
            label="目标蓝斯值"
          >
            <InputNumber
              placeholder="可选"
              min={0}
              max={2000}
              style={{ width: '100%' }}
              formatter={value => `${value}L`}
              parser={value => value!.replace('L', '')}
            />
          </Form.Item>

          {generating && (
            <div style={{ marginBottom: 16 }}>
              <Progress
                percent={generateProgress}
                status="active"
                strokeColor="#8B5CF6"
              />
              <Text type="secondary">正在批量生成版本...</Text>
            </div>
          )}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={generating}
                style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
              >
                {generating ? '生成中...' : '开始生成'}
              </Button>
              <Button onClick={() => setBatchGenerateModalVisible(false)} disabled={generating}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 版本比较模态框 */}
      <Modal
        title="版本比较"
        open={comparisonModalVisible}
        onCancel={() => setComparisonModalVisible(false)}
        footer={null}
        width={1200}
      >
        {selectedVersions.length === 2 && (
          <VersionComparison
            version1={selectedVersions[0]}
            version2={selectedVersions[1]}
          />
        )}
      </Modal>
    </div>
  );
};

export default VersionManager;