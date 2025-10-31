import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tabs,
  Upload,
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
  Popconfirm,
  Badge,
  DatePicker,
  Switch
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  SoundOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useApp } from '@contexts/AppContext';
import { ListeningMaterial, ListeningSearchParams } from '@types/listening';
import { listeningService } from '@services';
import FeishuSync from '@components/listening/FeishuSync';
import MaterialManager from '@components/listening/MaterialManager';
import AudioMatcher from '@components/listening/AudioMatcher';
import MaterialReview from '@components/listening/MaterialReview';
import styles from './ListeningManagement.module.scss';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ListeningManagement: React.FC = () => {
  const { setPageTitle, setPageDescription } = useApp();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<ListeningMaterial[]>([]);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('materials');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<ListeningMaterial | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    pendingReview: 0,
    totalDuration: 0
  });
  const [form] = Form.useForm();

  const [searchParams, setSearchParams] = useState<ListeningSearchParams>({
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    setPageTitle('听力材料管理');
    setPageDescription('管理听力材料、音频匹配和飞书表格集成');
    fetchMaterials();
    fetchStats();
  }, [setPageTitle, setPageDescription]);

  // 获取听力材料列表
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await listeningService.getMaterials(searchParams);
      const { data } = response;

      if (data && data.data) {
        setMaterials(data.data.items || []);
        setTotal(data.data.total || 0);
      } else {
        // 如果后端API不可用，使用模拟数据
        const mockData = generateMockMaterials();
        setMaterials(mockData.items);
        setTotal(mockData.total);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      // 使用模拟数据
      const mockData = generateMockMaterials();
      setMaterials(mockData.items);
      setTotal(mockData.total);
      message.warning('使用模拟数据，后端服务可能不可用');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await listeningService.getStats();
      if (response && response.data) {
        setStats(response.data);
      } else {
        // 使用模拟统计数据
        setStats({
          total: 156,
          published: 89,
          draft: 45,
          pendingReview: 22,
          totalDuration: 7200
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // 使用模拟统计数据
      setStats({
        total: 156,
        published: 89,
        draft: 45,
        pendingReview: 22,
        totalDuration: 7200
      });
    }
  };

  // 生成模拟数据
  const generateMockMaterials = () => {
    const mockMaterials: ListeningMaterial[] = [
      {
        id: '1',
        title: '小红帽的故事',
        content: '从前有一个可爱的小女孩，大家都叫她小红帽...',
        category: '故事',
        difficulty: 1,
        audioUrl: 'https://example.com/audio1.mp3',
        duration: 180,
        status: 'published',
        source: 'manual',
        tags: ['童话', '经典', '儿童'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        publishedAt: '2024-01-16T08:00:00Z'
      },
      {
        id: '2',
        title: '环境保护的重要性',
        content: '环境保护是当今世界面临的重要问题之一...',
        category: '科普',
        difficulty: 3,
        audioUrl: 'https://example.com/audio2.mp3',
        duration: 240,
        status: 'published',
        source: 'feishu',
        tags: ['环保', '科学', '教育'],
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        publishedAt: '2024-01-21T09:00:00Z'
      },
      {
        id: '3',
        title: '日常对话：购物',
        content: 'A: 你好，请问有什么可以帮助您的吗？B: 我想看看这件衣服...',
        category: '对话',
        difficulty: 2,
        status: 'draft',
        source: 'manual',
        tags: ['日常', '购物', '实用'],
        createdAt: '2024-01-25T16:45:00Z',
        updatedAt: '2024-01-25T16:45:00Z'
      }
    ];

    return {
      items: mockMaterials,
      total: mockMaterials.length
    };
  };

  // 处理搜索参数变化
  useEffect(() => {
    if (activeTab === 'materials') {
      fetchMaterials();
    }
  }, [searchParams, activeTab]);

  // 搜索功能
  const handleSearch = (values: any) => {
    setSearchParams(prev => ({
      ...prev,
      ...values,
      page: 1,
    }));
  };

  // 重置搜索
  const handleResetSearch = () => {
    setSearchParams({
      page: 1,
      pageSize: 10,
    });
  };

  // 批量操作
  const handleBatchPublish = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要发布的材料');
      return;
    }

    try {
      await listeningService.batchPublishMaterials(selectedRowKeys);
      message.success('批量发布成功');
      setSelectedRowKeys([]);
      fetchMaterials();
      fetchStats();
    } catch (error) {
      console.error('Failed to batch publish:', error);
      message.error('批量发布失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的材料');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个材料吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await listeningService.batchDeleteMaterials(selectedRowKeys);
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          fetchMaterials();
          fetchStats();
        } catch (error) {
          console.error('Failed to batch delete:', error);
          message.error('批量删除失败');
        }
      },
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '材料信息',
      key: 'materialInfo',
      render: (record: ListeningMaterial) => (
        <div className={styles.materialInfo}>
          <div className={styles.materialTitle}>
            <Space>
              {record.title}
              {record.status === 'published' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              {record.status === 'draft' && <EditOutlined style={{ color: '#faad14' }} />}
            </Space>
          </div>
          <div className={styles.materialExcerpt}>
            {record.content.substring(0, 100)}{record.content.length > 100 ? '...' : ''}
          </div>
          <div className={styles.materialMeta}>
            <Space split={<span>•</span>}>
              <span>#{record.id}</span>
              <span>{record.category}</span>
              <span>难度 {record.difficulty}</span>
              {record.duration && <span>{Math.floor(record.duration / 60)}:{(record.duration % 60).toString().padStart(2, '0')}</span>}
            </Space>
          </div>
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
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: number) => {
        const colors = ['green', 'blue', 'orange', 'red', 'purple'];
        return <Tag color={colors[difficulty - 1]}>难度 {difficulty}</Tag>;
      },
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration?: number) => (
        duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : '-'
      ),
    },
    {
      title: '音频',
      key: 'audio',
      render: (record: ListeningMaterial) => (
        record.audioUrl ? (
          <Button
            type="text"
            icon={<PlayCircleOutlined />}
            onClick={() => window.open(record.audioUrl, '_blank')}
          >
            播放
          </Button>
        ) : (
          <Tag color="orange">无音频</Tag>
        )
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => {
        const sourceMap = {
          manual: { color: 'blue', text: '手动添加' },
          feishu: { color: 'green', text: '飞书导入' },
          imported: { color: 'orange', text: '文件导入' },
        };
        const config = sourceMap[source as keyof typeof sourceMap] || { color: 'default', text: source };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
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
      width: 200,
      render: (record: ListeningMaterial) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePlayMaterial(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditMaterial(record)}
            />
          </Tooltip>
          {record.audioUrl && (
            <Tooltip title="播放音频">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handlePlayMaterial(record)}
              />
            </Tooltip>
          )}
          {!record.audioUrl && (
            <Tooltip title="匹配音频">
              <Button
                type="text"
                icon={<SoundOutlined />}
                onClick={() => {
                  message.info('音频匹配功能将在后续版本中实现');
                }}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确认删除"
            description={`确定要删除《${record.title}》吗？`}
            onConfirm={() => handleDeleteMaterial(record)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
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

  // 播放材料
  const handlePlayMaterial = (material: ListeningMaterial) => {
    if (material.audioUrl) {
      window.open(material.audioUrl, '_blank');
    } else {
      message.warning('该材料暂无音频');
    }
  };

  // 编辑材料
  const handleEditMaterial = (material: ListeningMaterial) => {
    setCurrentMaterial(material);
    form.setFieldsValue(material);
    setEditModalVisible(true);
  };

  // 删除材料
  const handleDeleteMaterial = (material: ListeningMaterial) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除《${material.title}》吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await listeningService.deleteMaterial(material.id);
          message.success('删除成功');
          fetchMaterials();
        } catch (error) {
          console.error('Failed to delete material:', error);
          message.error('删除失败');
        }
      },
    });
  };

  // 保存材料
  const handleSaveMaterial = async (values: any) => {
    try {
      if (currentMaterial) {
        await listeningService.updateMaterial(currentMaterial.id, values);
        message.success('更新成功');
      } else {
        await listeningService.createMaterial(values);
        message.success('创建成功');
      }
      setEditModalVisible(false);
      setCurrentMaterial(null);
      form.resetFields();
      fetchMaterials();
    } catch (error) {
      console.error('Failed to save material:', error);
      message.error('保存失败');
    }
  };

  // 连接飞书
  const handleConnectFeishu = () => {
    message.info('飞书连接功能将在后续版本中实现');
  };

  // 导入文件
  const handleImportFile = () => {
    setImportModalVisible(true);
  };

  return (
    <div className={styles.listeningManagement}>
      {/* 页面标题区域 */}
      <div className={styles.pageHeader}>
        <Title level={2}>听力材料管理</Title>
        <Paragraph type="secondary">
          管理听力材料、音频匹配、飞书多维表格导入和内容分类
        </Paragraph>
      </div>

      {/* 统计卡片区域 */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总材料数"
              value={stats.total}
              prefix={<SoundOutlined />}
              valueStyle={{ color: '#8B5CF6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已发布"
              value={stats.published}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="草稿"
              value={stats.draft}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总时长"
              value={Math.floor(stats.totalDuration / 60)}
              suffix="分钟"
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和操作区域 */}
      <Card className={styles.searchCard}>
        <Form
          layout="inline"
          onFinish={handleSearch}
          initialValues={searchParams}
        >
          <Form.Item name="keyword" label="关键词">
            <Input
              placeholder="搜索标题或内容"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select placeholder="选择分类" style={{ width: 120 }} allowClear>
              <Option value="故事">故事</Option>
              <Option value="新闻">新闻</Option>
              <Option value="科普">科普</Option>
              <Option value="对话">对话</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="difficulty" label="难度">
            <Select placeholder="选择难度" style={{ width: 120 }} allowClear>
              <Option value={1}>难度 1</Option>
              <Option value={2}>难度 2</Option>
              <Option value={3}>难度 3</Option>
              <Option value={4}>难度 4</Option>
              <Option value={5}>难度 5</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="选择状态" style={{ width: 120 }} allowClear>
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleResetSearch} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 操作区域 */}
      <Card className={styles.actionBar}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentMaterial(null);
                  form.resetFields();
                  setEditModalVisible(true);
                }}
              >
                新建材料
              </Button>
              <Button
                icon={<ImportOutlined />}
                onClick={handleImportFile}
              >
                导入文件
              </Button>
              <Button
                icon={<CloudUploadOutlined />}
                onClick={handleConnectFeishu}
              >
                连接飞书
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              {selectedRowKeys.length > 0 && (
                <>
                  <span>已选择 {selectedRowKeys.length} 项</span>
                  <Button
                    type="default"
                    icon={<CheckCircleOutlined />}
                    onClick={handleBatchPublish}
                  >
                    批量发布
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBatchDelete}
                  >
                    批量删除
                  </Button>
                </>
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchMaterials();
                  fetchStats();
                }}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 内容区域 */}
      <Card className={styles.contentCard}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <Badge count={stats.pendingReview} offset={[10, 0]}>
                <span>听力材料</span>
              </Badge>
            }
            key="materials"
          >
            <Table
              columns={columns}
              dataSource={materials}
              rowKey="id"
              loading={loading}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
              pagination={{
                current: searchParams.page,
                pageSize: searchParams.pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
              }}
              onChange={handleTableChange}
              className={styles.materialTable}
            />
          </TabPane>

          <TabPane tab="飞书集成" key="feishu">
            <FeishuSync />
          </TabPane>

          <TabPane tab="音频匹配" key="audio">
            <AudioMatcher />
          </TabPane>

          <TabPane
            tab={
              <Badge count={stats.pendingReview} offset={[10, 0]}>
                <span>内容审核</span>
              </Badge>
            }
            key="review"
          >
            <MaterialReview />
          </TabPane>
        </Tabs>
      </Card>

      {/* 新建/编辑材料模态框 */}
      <Modal
        title={currentMaterial ? '编辑材料' : '新建材料'}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentMaterial(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveMaterial}
        >
          <Form.Item
            name="title"
            label="材料标题"
            rules={[{ required: true, message: '请输入材料标题' }]}
          >
            <Input placeholder="请输入材料标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入材料内容' }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="请输入听力材料内容"
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="故事">故事</Option>
              <Option value="新闻">新闻</Option>
              <Option value="科普">科普</Option>
              <Option value="对话">对话</Option>
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
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              placeholder="请输入标签"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 导入模态框 */}
      <Modal
        title="导入听力材料"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>
            取消
          </Button>,
          <Button key="download" type="default">
            下载模板
          </Button>,
          <Button key="import" type="primary">
            开始导入
          </Button>,
        ]}
      >
        <div className={styles.importContent}>
          <p>支持导入 Excel (.xlsx) 和 CSV (.csv) 格式的文件</p>
          <p>请确保文件包含以下列：标题、内容、分类、难度等级</p>
          <div className={styles.uploadArea}>
            <Upload.Dragger
              accept=".xlsx,.csv"
              showUploadList={false}
              beforeUpload={() => false}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持单个文件上传，文件大小不超过 10MB</p>
            </Upload.Dragger>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListeningManagement;