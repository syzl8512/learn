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
  message,
  Row,
  Col,
  Statistic,
  Alert,
  Badge,
  Tooltip,
  Popconfirm,
  Empty,
  List,
  Avatar,
  Rate,
  Select,
  Tabs,
  Divider,
  Descriptions,
  Steps
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  StarOutlined,
  CommentOutlined,
  SettingOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { ListeningMaterial } from '@types/listening';
import { listeningService } from '@services';
import styles from './MaterialReview.module.scss';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface ReviewRecord {
  id: string;
  materialId: string;
  materialTitle: string;
  reviewerId: string;
  reviewerName: string;
  status: 'approved' | 'rejected' | 'pending';
  rating?: number;
  feedback?: string;
  reviewedAt?: string;
  createdAt: string;
}

interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  totalReviewed: number;
  avgRating: number;
}

const MaterialReview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [pendingMaterials, setPendingMaterials] = useState<ListeningMaterial[]>([]);
  const [reviewRecords, setReviewRecords] = useState<ReviewRecord[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState<ListeningMaterial | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    pending: 22,
    approved: 89,
    rejected: 12,
    totalReviewed: 101,
    avgRating: 4.2
  });
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewForm] = Form.useForm();

  useEffect(() => {
    fetchPendingMaterials();
    fetchReviewRecords();
    fetchStats();
  }, []);

  // 获取待审核素材
  const fetchPendingMaterials = async () => {
    try {
      setLoading(true);
      const response = await listeningService.getMaterials({
        page: 1,
        pageSize: 100,
        status: 'pending'
      });

      if (response && response.data) {
        setPendingMaterials(response.data.items || []);
      } else {
        // 使用模拟数据
        const mockData = generateMockPendingMaterials();
        setPendingMaterials(mockData);
      }
    } catch (error) {
      console.error('Failed to fetch pending materials:', error);
      // 使用模拟数据
      const mockData = generateMockPendingMaterials();
      setPendingMaterials(mockData);
      message.warning('使用模拟数据');
    } finally {
      setLoading(false);
    }
  };

  // 获取审核记录
  const fetchReviewRecords = async () => {
    try {
      // 这里应该调用获取审核记录的API
      const mockData = generateMockReviewRecords();
      setReviewRecords(mockData);
    } catch (error) {
      console.error('Failed to fetch review records:', error);
      const mockData = generateMockReviewRecords();
      setReviewRecords(mockData);
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      // 这里应该调用获取统计数据的API
      // 使用模拟统计数据
      setStats({
        pending: 22,
        approved: 89,
        rejected: 12,
        totalReviewed: 101,
        avgRating: 4.2
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // 生成模拟数据
  const generateMockPendingMaterials = (): ListeningMaterial[] => {
    return [
      {
        id: '1',
        title: '小王子的冒险',
        content: '小王子住在一个很小的星球上，每天都认真地清理火山和照顾玫瑰花。有一天，他决定离开自己的星球去探索宇宙。',
        category: '故事',
        difficulty: 2,
        audioUrl: 'https://example.com/audio1.mp3',
        duration: 220,
        status: 'draft',
        source: 'feishu',
        tags: ['童话', '冒险', '经典'],
        createdAt: '2024-02-10T10:00:00Z',
        updatedAt: '2024-02-10T10:00:00Z'
      },
      {
        id: '2',
        title: '科技改变生活',
        content: '现代科技正在深刻地改变着我们的生活方式。从智能手机到人工智能，科技让我们的生活变得更加便利和高效。',
        category: '科普',
        difficulty: 3,
        status: 'draft',
        source: 'manual',
        tags: ['科技', '生活', '创新'],
        createdAt: '2024-02-12T14:30:00Z',
        updatedAt: '2024-02-12T14:30:00Z'
      },
      {
        id: '3',
        title: '英语日常对话：问路',
        content: 'A: Excuse me, could you tell me how to get to the nearest subway station? B: Sure, go straight and turn left at the traffic light.',
        category: '对话',
        difficulty: 1,
        audioUrl: 'https://example.com/audio3.mp3',
        duration: 150,
        status: 'draft',
        source: 'manual',
        tags: ['英语', '问路', '实用'],
        createdAt: '2024-02-15T09:20:00Z',
        updatedAt: '2024-02-15T09:20:00Z'
      }
    ];
  };

  const generateMockReviewRecords = (): ReviewRecord[] => {
    return [
      {
        id: '1',
        materialId: '101',
        materialTitle: '森林的秘密',
        reviewerId: 'user1',
        reviewerName: '张三',
        status: 'approved',
        rating: 5,
        feedback: '内容优秀，适合儿童学习',
        reviewedAt: '2024-02-14T10:30:00Z',
        createdAt: '2024-02-14T10:00:00Z'
      },
      {
        id: '2',
        materialId: '102',
        materialTitle: '数学基础知识',
        reviewerId: 'user2',
        reviewerName: '李四',
        status: 'rejected',
        rating: 2,
        feedback: '内容过于简单，建议增加难度',
        reviewedAt: '2024-02-14T15:20:00Z',
        createdAt: '2024-02-14T15:00:00Z'
      },
      {
        id: '3',
        materialId: '103',
        materialTitle: '音乐欣赏入门',
        reviewerId: 'user1',
        reviewerName: '张三',
        status: 'approved',
        rating: 4,
        feedback: '内容很好，但音频质量需要提升',
        reviewedAt: '2024-02-15T11:45:00Z',
        createdAt: '2024-02-15T11:30:00Z'
      }
    ];
  };

  // 审核素材
  const handleReviewMaterial = (material: ListeningMaterial) => {
    setCurrentMaterial(material);
    setReviewModalVisible(true);
  };

  // 查看素材详情
  const handleViewMaterial = (material: ListeningMaterial) => {
    setCurrentMaterial(material);
    setDetailModalVisible(true);
  };

  // 提交审核
  const handleSubmitReview = async (values: any) => {
    if (!currentMaterial) return;

    try {
      setReviewing(true);

      const reviewData = {
        status: values.status,
        feedback: values.feedback,
        rating: values.rating,
        reviewerId: 'current-user' // 应该从用户上下文获取
      };

      await listeningService.reviewMaterial(currentMaterial.id, reviewData);

      message.success('审核完成');
      setReviewModalVisible(false);
      setCurrentMaterial(null);
      reviewForm.resetFields();

      // 刷新数据
      fetchPendingMaterials();
      fetchReviewRecords();
      fetchStats();
    } catch (error) {
      console.error('Review failed:', error);
      message.error('审核失败');
    } finally {
      setReviewing(false);
    }
  };

  // 批量审核
  const handleBatchReview = async (status: 'approved' | 'rejected') => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要审核的素材');
      return;
    }

    Modal.confirm({
      title: `确认批量${status === 'approved' ? '通过' : '拒绝'}`,
      content: `确定要批量${status === 'approved' ? '通过' : '拒绝'}选中的 ${selectedRowKeys.length} 个素材吗？`,
      onOk: async () => {
        try {
          await listeningService.batchReview(selectedRowKeys, {
            status,
            feedback: status === 'approved' ? '批量通过审核' : '批量拒绝审核',
            reviewerId: 'current-user'
          });

          message.success(`批量${status === 'approved' ? '通过' : '拒绝'}成功`);
          setSelectedRowKeys([]);
          fetchPendingMaterials();
          fetchStats();
        } catch (error) {
          console.error('Batch review failed:', error);
          message.error('批量审核失败');
        }
      },
    });
  };

  // 待审核素材表格列
  const pendingColumns = [
    {
      title: '素材信息',
      key: 'materialInfo',
      render: (record: ListeningMaterial) => (
        <div className={styles.materialInfo}>
          <div className={styles.materialTitle}>{record.title}</div>
          <div className={styles.materialExcerpt}>
            {record.content.substring(0, 60)}{record.content.length > 60 ? '...' : ''}
          </div>
          <div className={styles.materialMeta}>
            <Space split={<span>•</span>}>
              <span>{record.category}</span>
              <span>难度 {record.difficulty}</span>
              <span>{record.content.length} 字</span>
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
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
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
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewMaterial(record)}
            />
          </Tooltip>
          <Tooltip title="审核">
            <Button
              type="text"
              icon={<AuditOutlined />}
              onClick={() => handleReviewMaterial(record)}
            />
          </Tooltip>
          {record.audioUrl && (
            <Tooltip title="播放音频">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => window.open(record.audioUrl, '_blank')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // 审核记录表格列
  const recordColumns = [
    {
      title: '素材标题',
      dataIndex: 'materialTitle',
      key: 'materialTitle',
    },
    {
      title: '审核人',
      dataIndex: 'reviewerName',
      key: 'reviewerName',
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {name}
        </Space>
      ),
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'approved') {
          return <Badge status="success" text="已通过" />;
        } else if (status === 'rejected') {
          return <Badge status="error" text="已拒绝" />;
        }
        return <Badge status="processing" text="待审核" />;
      },
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <Rate disabled value={rating} style={{ fontSize: 14 }} />
      ),
    },
    {
      title: '审核意见',
      dataIndex: 'feedback',
      key: 'feedback',
      ellipsis: true,
      render: (feedback: string) => (
        <Tooltip title={feedback}>
          <Text type="secondary">{feedback}</Text>
        </Tooltip>
      ),
    },
    {
      title: '审核时间',
      dataIndex: 'reviewedAt',
      key: 'reviewedAt',
      render: (reviewedAt: string) => (
        reviewedAt ? new Date(reviewedAt).toLocaleString() : '-'
      ),
    },
  ];

  return (
    <div className={styles.materialReview}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="待审核"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="已通过"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="已拒绝"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="平均评分"
              value={stats.avgRating}
              precision={1}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#8B5CF6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 审核标准 */}
      <Card className={styles.standardCard}>
        <Title level={4}>
          <SettingOutlined /> 审核标准
        </Title>
        <Alert
          message="审核要点"
          description={
            <div>
              <p><strong>内容质量：</strong>文本内容准确、语言规范、适合目标年龄段</p>
              <p><strong>难度匹配：</strong>难度等级与内容复杂度相符</p>
              <p><strong>音频质量：</strong>发音清晰、语速适中、音质良好</p>
              <p><strong>教育价值：</strong>具有教育意义，有助于语言学习</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>

      {/* 内容区域 */}
      <Card className={styles.contentCard}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <Badge count={stats.pending} offset={[10, 0]}>
                <span>待审核素材</span>
              </Badge>
            }
            key="pending"
          >
            <div className={styles.toolbar}>
              <Space>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleBatchReview('approved')}
                  disabled={selectedRowKeys.length === 0}
                >
                  批量通过 ({selectedRowKeys.length})
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleBatchReview('rejected')}
                  disabled={selectedRowKeys.length === 0}
                >
                  批量拒绝 ({selectedRowKeys.length})
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    fetchPendingMaterials();
                    fetchStats();
                  }}
                >
                  刷新
                </Button>
              </Space>
            </div>

            {pendingMaterials.length === 0 ? (
              <Empty description="暂无待审核素材" />
            ) : (
              <Table
                dataSource={pendingMaterials}
                columns={pendingColumns}
                rowKey="id"
                loading={loading}
                rowSelection={{
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
                className={styles.reviewTable}
              />
            )}
          </TabPane>

          <TabPane tab="审核记录" key="records">
            <Table
              dataSource={reviewRecords}
              columns={recordColumns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              className={styles.recordTable}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 审核模态框 */}
      <Modal
        title={`审核素材 - ${currentMaterial?.title}`}
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          setCurrentMaterial(null);
          reviewForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        {currentMaterial && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="分类">
                <Tag color="blue">{currentMaterial.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="难度">
                <Tag color="green">难度 {currentMaterial.difficulty}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="字数">{currentMaterial.content.length} 字</Descriptions.Item>
              <Descriptions.Item label="音频">
                {currentMaterial.audioUrl ? (
                  <Space>
                    <Badge status="success" text="有音频" />
                    <Button
                      size="small"
                      icon={<PlayCircleOutlined />}
                      onClick={() => window.open(currentMaterial.audioUrl, '_blank')}
                    >
                      播放
                    </Button>
                  </Space>
                ) : (
                  <Badge status="warning" text="无音频" />
                )}
              </Descriptions.Item>
              <Descriptions.Item label="标签" span={2}>
                <Space wrap>
                  {currentMaterial.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="内容预览" span={2}>
                <div style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  maxHeight: 200,
                  overflowY: 'auto',
                  backgroundColor: '#f9fafb',
                  padding: 12,
                  borderRadius: 6,
                  border: '1px solid #e5e7eb'
                }}>
                  {currentMaterial.content}
                </div>
              </Descriptions.Item>
            </Descriptions>

            <Form
              form={reviewForm}
              layout="vertical"
              onFinish={handleSubmitReview}
            >
              <Form.Item
                label="审核结果"
                name="status"
                rules={[{ required: true, message: '请选择审核结果' }]}
              >
                <Select placeholder="请选择审核结果">
                  <Option value="approved">
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      通过
                    </Space>
                  </Option>
                  <Option value="rejected">
                    <Space>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      拒绝
                    </Space>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="评分"
                name="rating"
                rules={[{ required: true, message: '请给出评分' }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                label="审核意见"
                name="feedback"
                rules={[{ required: true, message: '请填写审核意见' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请填写审核意见，说明通过或拒绝的原因..."
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={reviewing}
                  >
                    提交审核
                  </Button>
                  <Button
                    onClick={() => {
                      setReviewModalVisible(false);
                      setCurrentMaterial(null);
                      reviewForm.resetFields();
                    }}
                  >
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 素材详情模态框 */}
      <Modal
        title={`素材详情 - ${currentMaterial?.title}`}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setCurrentMaterial(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="review"
            type="primary"
            icon={<AuditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              if (currentMaterial) {
                handleReviewMaterial(currentMaterial);
              }
            }}
          >
            开始审核
          </Button>
        ]}
        width={800}
      >
        {currentMaterial && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="标题">{currentMaterial.title}</Descriptions.Item>
            <Descriptions.Item label="分类">
              <Tag color="blue">{currentMaterial.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="难度">
              <Tag color="green">难度 {currentMaterial.difficulty}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="标签">
              <Space wrap>
                {currentMaterial.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color="orange">待审核</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="音频">
              {currentMaterial.audioUrl ? (
                <Space>
                  <Badge status="success" text="有音频" />
                  <Button
                    size="small"
                    icon={<PlayCircleOutlined />}
                    onClick={() => window.open(currentMaterial.audioUrl, '_blank')}
                  >
                    播放
                  </Button>
                </Space>
              ) : (
                <Badge status="warning" text="无音频" />
              )}
            </Descriptions.Item>
            <Descriptions.Item label="字数">{currentMaterial.content.length} 字</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(currentMaterial.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="内容">
              <div style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                maxHeight: 300,
                overflowY: 'auto',
                backgroundColor: '#f9fafb',
                padding: 16,
                borderRadius: 6,
                border: '1px solid #e5e7eb'
              }}>
                {currentMaterial.content}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MaterialReview;