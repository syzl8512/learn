import React, { useState, useEffect } from 'react';
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
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
  Popconfirm,
  Badge,
  DatePicker,
  Drawer,
  Descriptions,
  Empty,
  Segmented
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { ListeningMaterial, ListeningSearchParams } from '@types/listening';
import { listeningService } from '@services';
import styles from './MaterialManager.module.scss';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface MaterialManagerProps {
  onMaterialSelect?: (material: ListeningMaterial) => void;
}

const MaterialManager: React.FC<MaterialManagerProps> = ({ onMaterialSelect }) => {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<ListeningMaterial[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState<ListeningMaterial | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    withAudio: 0,
    withoutAudio: 0
  });
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [form] = Form.useForm();

  const [searchParams, setSearchParams] = useState<ListeningSearchParams>({
    page: 1,
    pageSize: 10,
  });

  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    difficulty: undefined,
    status: '',
    hasAudio: '',
    dateRange: undefined as any
  });

  useEffect(() => {
    fetchMaterials();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [searchParams]);

  // 获取素材列表
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = {
        ...searchParams,
        ...filters
      };
      const response = await listeningService.getMaterials(params);

      if (response && response.data) {
        setMaterials(response.data.items || []);
        setTotal(response.data.total || 0);
      } else {
        // 使用模拟数据
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
      message.warning('使用模拟数据');
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
          withAudio: 123,
          withoutAudio: 33
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // 使用模拟统计数据
      setStats({
        total: 156,
        published: 89,
        draft: 45,
        withAudio: 123,
        withoutAudio: 33
      });
    }
  };

  // 生成模拟数据
  const generateMockMaterials = () => {
    const mockMaterials: ListeningMaterial[] = [
      {
        id: '1',
        title: '小红帽的故事',
        content: '从前有一个可爱的小女孩，大家都叫她小红帽。她总是戴着一顶奶奶送给她的红色天鹅绒小帽，所以大家都叫她小红帽。',
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
        content: '环境保护是当今世界面临的重要问题之一。随着工业化的快速发展，环境污染问题日益严重。',
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
        content: 'A: 你好，请问有什么可以帮助您的吗？B: 我想看看这件衣服，请问多少钱？A: 这件衣服是新的款式，质量很好。',
        category: '对话',
        difficulty: 2,
        status: 'draft',
        source: 'manual',
        tags: ['日常', '购物', '实用'],
        createdAt: '2024-01-25T16:45:00Z',
        updatedAt: '2024-01-25T16:45:00Z'
      },
      {
        id: '4',
        title: '科学探索：宇宙的奥秘',
        content: '宇宙是一个广阔而神秘的地方，包含着无数的星系、恒星和行星。人类对宇宙的探索从未停止。',
        category: '科普',
        difficulty: 4,
        audioUrl: 'https://example.com/audio4.mp3',
        duration: 300,
        status: 'published',
        source: 'feishu',
        tags: ['宇宙', '科学', '探索'],
        createdAt: '2024-01-28T11:20:00Z',
        updatedAt: '2024-01-28T11:20:00Z',
        publishedAt: '2024-01-29T08:00:00Z'
      },
      {
        id: '5',
        title: '英语小对话：问候',
        content: 'Hello! How are you today? I\'m fine, thank you. And you? I\'m doing well. Nice weather today!',
        category: '对话',
        difficulty: 1,
        status: 'draft',
        source: 'manual',
        tags: ['英语', '问候', '基础'],
        createdAt: '2024-02-01T09:30:00Z',
        updatedAt: '2024-02-01T09:30:00Z'
      }
    ];

    return {
      items: mockMaterials,
      total: mockMaterials.length
    };
  };

  // 处理搜索
  const handleSearch = () => {
    setSearchParams(prev => ({
      ...prev,
      page: 1,
      ...filters
    }));
  };

  // 重置搜索
  const handleResetSearch = () => {
    setFilters({
      keyword: '',
      category: '',
      difficulty: undefined,
      status: '',
      hasAudio: '',
      dateRange: undefined
    });
    setSearchParams({
      page: 1,
      pageSize: 10
    });
  };

  // 编辑素材
  const handleEditMaterial = (material: ListeningMaterial) => {
    setSelectedMaterial(material);
    form.setFieldsValue(material);
    setEditModalVisible(true);
  };

  // 查看素材
  const handleViewMaterial = (material: ListeningMaterial) => {
    setSelectedMaterial(material);
    setViewDrawerVisible(true);
  };

  // 删除素材
  const handleDeleteMaterial = async (material: ListeningMaterial) => {
    try {
      await listeningService.deleteMaterial(material.id);
      message.success('删除成功');
      fetchMaterials();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete material:', error);
      message.error('删除失败');
    }
  };

  // 保存素材
  const handleSaveMaterial = async (values: any) => {
    try {
      if (selectedMaterial) {
        await listeningService.updateMaterial(selectedMaterial.id, values);
        message.success('更新成功');
      } else {
        await listeningService.createMaterial(values);
        message.success('创建成功');
      }
      setEditModalVisible(false);
      setSelectedMaterial(null);
      form.resetFields();
      fetchMaterials();
      fetchStats();
    } catch (error) {
      console.error('Failed to save material:', error);
      message.error('保存失败');
    }
  };

  // 批量操作
  const handleBatchPublish = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要发布的素材');
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
      message.warning('请选择要删除的素材');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个素材吗？此操作不可恢复。`,
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
      title: '素材信息',
      key: 'materialInfo',
      render: (record: ListeningMaterial) => (
        <div className={styles.materialInfo}>
          <div className={styles.materialTitle}>
            <Space>
              {record.title}
              {record.status === 'published' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              {record.status === 'draft' && <ClockCircleOutlined style={{ color: '#faad14' }} />}
            </Space>
          </div>
          <div className={styles.materialExcerpt}>
            {record.content.substring(0, 80)}{record.content.length > 80 ? '...' : ''}
          </div>
          <div className={styles.materialMeta}>
            <Space split={<span>•</span>}>
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
      width: 100,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (difficulty: number) => {
        const colors = ['green', 'blue', 'orange', 'red', 'purple'];
        return <Tag color={colors[difficulty - 1]}>难度 {difficulty}</Tag>;
      },
    },
    {
      title: '音频',
      key: 'audio',
      width: 100,
      render: (record: ListeningMaterial) => (
        record.audioUrl ? (
          <Badge status="success" text="有音频" />
        ) : (
          <Badge status="warning" text="无音频" />
        )
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
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
      title: '操作',
      key: 'actions',
      width: 200,
      render: (record: ListeningMaterial) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewMaterial(record)}
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
            <Tooltip title="播放">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => {
                  if (onMaterialSelect) {
                    onMaterialSelect(record);
                  } else {
                    window.open(record.audioUrl, '_blank');
                  }
                }}
              />
            </Tooltip>
          )}
          {!record.audioUrl && (
            <Tooltip title="匹配音频">
              <Button
                type="text"
                icon={<SoundOutlined />}
                onClick={() => message.info('音频匹配功能将在后续版本中实现')}
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

  // 卡片视图渲染
  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {materials.map(material => (
        <Col xs={24} sm={12} md={8} lg={6} key={material.id}>
          <Card
            hoverable
            className={styles.materialCard}
            actions={[
              <Tooltip title="查看" key="view">
                <EyeOutlined onClick={() => handleViewMaterial(material)} />
              </Tooltip>,
              <Tooltip title="编辑" key="edit">
                <EditOutlined onClick={() => handleEditMaterial(material)} />
              </Tooltip>,
              <Tooltip title="播放" key="play">
                {material.audioUrl ? (
                  <PlayCircleOutlined onClick={() => {
                    if (onMaterialSelect) {
                      onMaterialSelect(material);
                    } else {
                      window.open(material.audioUrl, '_blank');
                    }
                  }} />
                ) : (
                  <SoundOutlined onClick={() => message.info('音频匹配功能将在后续版本中实现')} />
                )}
              </Tooltip>
            ]}
          >
            <Card.Meta
              title={
                <div className={styles.cardTitle}>
                  <Text ellipsis style={{ maxWidth: '100%' }}>{material.title}</Text>
                  {material.status === 'published' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                </div>
              }
              description={
                <div>
                  <div className={styles.cardExcerpt}>
                    {material.content.substring(0, 60)}{material.content.length > 60 ? '...' : ''}
                  </div>
                  <div className={styles.cardMeta}>
                    <Space split={<span>•</span>}>
                      <Tag size="small" color="blue">{material.category}</Tag>
                      <Tag size="small" color="green">难度 {material.difficulty}</Tag>
                      {material.audioUrl ? (
                        <Tag size="small" color="success">有音频</Tag>
                      ) : (
                        <Tag size="small" color="warning">无音频</Tag>
                      )}
                    </Space>
                  </div>
                </div>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div className={styles.materialManager}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="总素材数"
              value={stats.total}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#8B5CF6' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="已发布"
              value={stats.published}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="有音频"
              value={stats.withAudio}
              prefix={<SoundOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="无音频"
              value={stats.withoutAudio}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索筛选区域 */}
      <Card className={styles.filterCard}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="搜索标题或内容"
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="分类"
              value={filters.category}
              onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="故事">故事</Option>
              <Option value="新闻">新闻</Option>
              <Option value="科普">科普</Option>
              <Option value="对话">对话</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="难度"
              value={filters.difficulty}
              onChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value={1}>难度 1</Option>
              <Option value={2}>难度 2</Option>
              <Option value={3}>难度 3</Option>
              <Option value={4}>难度 4</Option>
              <Option value={5}>难度 5</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="状态"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Select
              placeholder="音频"
              value={filters.hasAudio}
              onChange={(value) => setFilters(prev => ({ ...prev, hasAudio: value }))}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="true">有音频</Option>
              <Option value="false">无音频</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={3}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleResetSearch}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 操作区域 */}
      <Card className={styles.actionCard}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedMaterial(null);
                  form.resetFields();
                  setEditModalVisible(true);
                }}
              >
                新建素材
              </Button>
              <Button icon={<UploadOutlined />}>
                导入文件
              </Button>
              <Button icon={<DownloadOutlined />}>
                导出数据
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { label: '表格视图', value: 'table' },
                  { label: '卡片视图', value: 'card' }
                ]}
              />
              {selectedRowKeys.length > 0 && (
                <>
                  <span>已选择 {selectedRowKeys.length} 项</span>
                  <Button
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

      {/* 内容展示区域 */}
      <Card className={styles.contentCard}>
        {materials.length === 0 ? (
          <Empty description="暂无数据" />
        ) : (
          <>
            {viewMode === 'table' ? (
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
                  onChange: (page, pageSize) => {
                    setSearchParams(prev => ({ ...prev, page, pageSize }));
                  }
                }}
                className={styles.materialTable}
              />
            ) : (
              renderCardView()
            )}
          </>
        )}
      </Card>

      {/* 编辑模态框 */}
      <Modal
        title={selectedMaterial ? '编辑素材' : '新建素材'}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedMaterial(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveMaterial}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="素材标题"
                rules={[{ required: true, message: '请输入素材标题' }]}
              >
                <Input placeholder="请输入素材标题" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入素材内容' }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="请输入听力材料内容"
            />
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

      {/* 查看抽屉 */}
      <Drawer
        title="素材详情"
        placement="right"
        size="large"
        open={viewDrawerVisible}
        onClose={() => setViewDrawerVisible(false)}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                if (selectedMaterial) {
                  handleEditMaterial(selectedMaterial);
                  setViewDrawerVisible(false);
                }
              }}
            >
              编辑
            </Button>
          </Space>
        }
      >
        {selectedMaterial && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="标题">{selectedMaterial.title}</Descriptions.Item>
              <Descriptions.Item label="分类">
                <Tag color="blue">{selectedMaterial.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="难度">
                <Tag color="green">难度 {selectedMaterial.difficulty}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedMaterial.status === 'published' ? 'green' : 'orange'}>
                  {selectedMaterial.status === 'published' ? '已发布' : '草稿'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="音频">
                {selectedMaterial.audioUrl ? (
                  <Space>
                    <Badge status="success" text="有音频" />
                    <Button size="small" icon={<PlayCircleOutlined />}>
                      播放
                    </Button>
                  </Space>
                ) : (
                  <Badge status="warning" text="无音频" />
                )}
              </Descriptions.Item>
              <Descriptions.Item label="时长">
                {selectedMaterial.duration
                  ? `${Math.floor(selectedMaterial.duration / 60)}:${(selectedMaterial.duration % 60).toString().padStart(2, '0')}`
                  : '-'
                }
              </Descriptions.Item>
              <Descriptions.Item label="标签">
                <Space wrap>
                  {selectedMaterial.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="来源">
                {selectedMaterial.source === 'manual' ? '手动添加' :
                 selectedMaterial.source === 'feishu' ? '飞书导入' : '文件导入'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(selectedMaterial.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(selectedMaterial.updatedAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="内容">
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {selectedMaterial.content}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MaterialManager;