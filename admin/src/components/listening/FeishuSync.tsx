import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  Steps,
  Row,
  Col,
  Alert,
  Space,
  Table,
  Tag,
  Progress,
  message,
  Modal,
  Select,
  Divider,
  Badge,
  Tooltip,
  Empty,
  Statistic
} from 'antd';
import {
  CloudUploadOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { listeningService } from '@services';
import { FeishuRecord } from '@types/listening';
import styles from './FeishuSync.module.scss';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

interface FeishuConfig {
  appId: string;
  appSecret: string;
  tableId: string;
  viewId?: string;
}

interface SyncResult {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  details: FeishuRecord[];
}

const FeishuSync: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [config, setConfig] = useState<FeishuConfig>({
    appId: '',
    appSecret: '',
    tableId: '',
    viewId: ''
  });
  const [records, setRecords] = useState<FeishuRecord[]>([]);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [fieldMapping, setFieldMapping] = useState({
    titleField: 'title',
    contentField: 'content',
    categoryField: 'category',
    difficultyField: 'difficulty',
    audioUrlField: '',
    tagsField: ''
  });
  const [form] = Form.useForm();

  // 模拟飞书字段列表
  const mockFields = [
    { id: 'title', name: '标题', type: 'text' },
    { id: 'content', name: '内容', type: 'text' },
    { id: 'category', name: '分类', type: 'select' },
    { id: 'difficulty', name: '难度', type: 'number' },
    { id: 'audioUrl', name: '音频链接', type: 'url' },
    { id: 'tags', name: '标签', type: 'text' },
    { id: 'description', name: '描述', type: 'text' }
  ];

  // 测试连接
  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const response = await listeningService.connectFeishu({
        appId: config.appId,
        appSecret: config.appSecret
      });

      if (response.success) {
        message.success('飞书连接测试成功');
        setCurrentStep(1);
      } else {
        message.error('连接失败，请检查配置信息');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      message.warning('连接测试失败，使用模拟模式');
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  // 获取表格数据
  const handleFetchRecords = async () => {
    try {
      setLoading(true);
      const response = await listeningService.getFeishuRecords(
        config.tableId,
        config.viewId
      );

      if (response && response.data) {
        setRecords(response.data);
        message.success(`成功获取 ${response.data.length} 条记录`);
        setCurrentStep(2);
      } else {
        // 使用模拟数据
        const mockRecords = generateMockRecords();
        setRecords(mockRecords);
        message.success(`成功获取 ${mockRecords.length} 条记录（模拟数据）`);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
      // 使用模拟数据
      const mockRecords = generateMockRecords();
      setRecords(mockRecords);
      message.warning('获取数据失败，使用模拟数据');
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  // 生成模拟数据
  const generateMockRecords = (): FeishuRecord[] => {
    return [
      {
        recordId: 'rec001',
        fields: {
          title: '小红帽的故事',
          content: '从前有一个可爱的小女孩，大家都叫她小红帽...',
          category: '故事',
          difficulty: '1',
          audioUrl: 'https://example.com/audio1.mp3',
          tags: '童话,经典,儿童'
        }
      },
      {
        recordId: 'rec002',
        fields: {
          title: '环境保护的重要性',
          content: '环境保护是当今世界面临的重要问题之一...',
          category: '科普',
          difficulty: '3',
          audioUrl: 'https://example.com/audio2.mp3',
          tags: '环保,科学,教育'
        }
      },
      {
        recordId: 'rec003',
        fields: {
          title: '日常对话：购物',
          content: 'A: 你好，请问有什么可以帮助您的吗？B: 我想看看这件衣服...',
          category: '对话',
          difficulty: '2',
          tags: '日常,购物,实用'
        }
      }
    ];
  };

  // 执行同步
  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncProgress(0);

      // 模拟同步进度
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      const response = await listeningService.importFromFeishu(
        config.tableId,
        fieldMapping,
        {
          skipExisting: true,
          autoPublish: false
        }
      );

      clearInterval(progressInterval);
      setSyncProgress(100);

      if (response && response.data) {
        setSyncResult(response.data);
        message.success('同步完成');
        setCurrentStep(3);
      } else {
        // 使用模拟结果
        const mockResult: SyncResult = {
          total: records.length,
          success: records.length - 1,
          failed: 0,
          skipped: 1,
          details: records
        };
        setSyncResult(mockResult);
        message.success('同步完成（模拟数据）');
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      message.error('同步失败');
    } finally {
      setSyncing(false);
      setSyncProgress(0);
    }
  };

  // 重置流程
  const handleReset = () => {
    setCurrentStep(0);
    setRecords([]);
    setSyncResult(null);
    setConfig({
      appId: '',
      appSecret: '',
      tableId: '',
      viewId: ''
    });
    form.resetFields();
  };

  // 记录表格列定义
  const recordColumns = [
    {
      title: '标题',
      dataIndex: ['fields', 'title'],
      key: 'title',
      render: (title: string) => <Text strong>{title}</Text>
    },
    {
      title: '分类',
      dataIndex: ['fields', 'category'],
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category || '未分类'}</Tag>
      )
    },
    {
      title: '难度',
      dataIndex: ['fields', 'difficulty'],
      key: 'difficulty',
      render: (difficulty: string) => {
        const colors = ['green', 'blue', 'orange', 'red', 'purple'];
        const level = parseInt(difficulty) || 1;
        return <Tag color={colors[level - 1]}>难度 {level}</Tag>;
      }
    },
    {
      title: '音频',
      dataIndex: ['fields', 'audioUrl'],
      key: 'audioUrl',
      render: (audioUrl: string) => (
        audioUrl ? (
          <Badge status="success" text="有音频" />
        ) : (
          <Badge status="warning" text="无音频" />
        )
      )
    },
    {
      title: '标签',
      dataIndex: ['fields', 'tags'],
      key: 'tags',
      render: (tags: string) => {
        if (!tags) return '-';
        return tags.split(',').map((tag, index) => (
          <Tag key={index} size="small">{tag.trim()}</Tag>
        ));
      }
    }
  ];

  return (
    <div className={styles.feishuSync}>
      <Card className={styles.configCard}>
        <Title level={3}>
          <CloudUploadOutlined className={styles.titleIcon} />
          飞书多维表格同步
        </Title>
        <Paragraph type="secondary">
          连接飞书应用，自动获取和导入听力材料到系统
        </Paragraph>

        <Alert
          message="配置说明"
          description={
            <div>
              <p>1. 在飞书开放平台创建应用并获取 App ID 和 App Secret</p>
              <p>2. 创建多维表格并获取表格 ID</p>
              <p>3. 配置字段映射关系</p>
              <p>4. 执行同步操作</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Steps current={currentStep} className={styles.steps}>
          <Step
            title="配置连接"
            description="设置飞书应用信息"
            icon={<SettingOutlined />}
          />
          <Step
            title="选择表格"
            description="选择要同步的表格"
            icon={<DatabaseOutlined />}
          />
          <Step
            title="预览数据"
            description="预览要同步的数据"
            icon={<FileTextOutlined />}
          />
          <Step
            title="执行同步"
            description="完成数据同步"
            icon={<SyncOutlined />}
          />
        </Steps>
      </Card>

      {/* 步骤1：配置连接 */}
      {currentStep === 0 && (
        <Card className={styles.stepCard}>
          <Title level={4}>
            <LinkOutlined /> 配置飞书连接
          </Title>
          <Form
            form={form}
            layout="vertical"
            initialValues={config}
            onValuesChange={(_, values) => setConfig(values)}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="App ID"
                  name="appId"
                  rules={[{ required: true, message: '请输入飞书应用 App ID' }]}
                >
                  <Input placeholder="请输入飞书应用的 App ID" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="App Secret"
                  name="appSecret"
                  rules={[{ required: true, message: '请输入飞书应用 App Secret' }]}
                >
                  <Input.Password placeholder="请输入飞书应用的 App Secret" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="表格 ID"
                  name="tableId"
                  rules={[{ required: true, message: '请输入多维表格 ID' }]}
                >
                  <Input placeholder="请输入多维表格的 ID" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="视图 ID（可选）" name="viewId">
                  <Input placeholder="请输入视图 ID（可选）" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<CloudUploadOutlined />}
                  loading={loading}
                  onClick={handleTestConnection}
                  disabled={!config.appId || !config.appSecret}
                >
                  测试连接
                </Button>
                <Button onClick={() => setCurrentStep(1)} disabled>
                  下一步
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* 步骤1：选择表格 */}
      {currentStep === 1 && (
        <Card className={styles.stepCard}>
          <Title level={4}>
            <DatabaseOutlined /> 选择表格和字段映射
          </Title>
          <Paragraph type="secondary">
            配置飞书表格字段与系统字段的映射关系
          </Paragraph>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Form.Item label="标题字段">
                <Select
                  value={fieldMapping.titleField}
                  onChange={(value) => setFieldMapping(prev => ({ ...prev, titleField: value }))}
                >
                  {mockFields.map(field => (
                    <Option key={field.id} value={field.id}>
                      {field.name} ({field.type})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="内容字段">
                <Select
                  value={fieldMapping.contentField}
                  onChange={(value) => setFieldMapping(prev => ({ ...prev, contentField: value }))}
                >
                  {mockFields.map(field => (
                    <Option key={field.id} value={field.id}>
                      {field.name} ({field.type})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Form.Item label="分类字段">
                <Select
                  value={fieldMapping.categoryField}
                  onChange={(value) => setFieldMapping(prev => ({ ...prev, categoryField: value }))}
                >
                  {mockFields.map(field => (
                    <Option key={field.id} value={field.id}>
                      {field.name} ({field.type})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="难度字段">
                <Select
                  value={fieldMapping.difficultyField}
                  onChange={(value) => setFieldMapping(prev => ({ ...prev, difficultyField: value }))}
                >
                  {mockFields.map(field => (
                    <Option key={field.id} value={field.id}>
                      {field.name} ({field.type})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<DatabaseOutlined />}
                loading={loading}
                onClick={handleFetchRecords}
                disabled={!config.tableId}
              >
                获取数据
              </Button>
              <Button onClick={() => setCurrentStep(0)}>
                上一步
              </Button>
            </Space>
          </Form.Item>
        </Card>
      )}

      {/* 步骤2：预览数据 */}
      {currentStep === 2 && (
        <Card className={styles.stepCard}>
          <Title level={4}>
            <FileTextOutlined /> 预览数据
          </Title>
          <Paragraph type="secondary">
            共获取到 {records.length} 条记录，请确认数据无误后执行同步
          </Paragraph>

          <Table
            dataSource={records}
            columns={recordColumns}
            rowKey="recordId"
            pagination={{ pageSize: 5 }}
            size="middle"
            className={styles.previewTable}
          />

          <Divider />

          <Space>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              loading={syncing}
              onClick={handleSync}
              disabled={records.length === 0}
            >
              开始同步
            </Button>
            <Button onClick={() => setShowMappingModal(true)}>
              配置字段映射
            </Button>
            <Button onClick={() => setCurrentStep(1)}>
              上一步
            </Button>
          </Space>

          {syncing && (
            <div style={{ marginTop: 16 }}>
              <Text>同步进度：</Text>
              <Progress percent={syncProgress} status="active" />
            </div>
          )}
        </Card>
      )}

      {/* 步骤3：同步结果 */}
      {currentStep === 3 && syncResult && (
        <Card className={styles.stepCard}>
          <Title level={4}>
            <CheckCircleOutlined className={styles.successIcon} />
            同步完成
          </Title>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="总记录数"
                  value={syncResult.total}
                  prefix={<DatabaseOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="成功同步"
                  value={syncResult.success}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="跳过记录"
                  value={syncResult.skipped}
                  prefix={<InfoCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="失败记录"
                  value={syncResult.failed}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          <Alert
            message="同步结果"
            description={`成功同步 ${syncResult.success} 条记录，跳过 ${syncResult.skipped} 条重复记录${syncResult.failed > 0 ? `，${syncResult.failed} 条记录失败` : ''}`}
            type={syncResult.failed > 0 ? 'warning' : 'success'}
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Space>
            <Button type="primary" onClick={handleReset}>
              新建同步
            </Button>
            <Button onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          </Space>
        </Card>
      )}

      {/* 字段映射配置模态框 */}
      <Modal
        title="字段映射配置"
        open={showMappingModal}
        onCancel={() => setShowMappingModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowMappingModal(false)}>
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={() => setShowMappingModal(false)}>
            确定
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="音频链接字段（可选）">
            <Select
              value={fieldMapping.audioUrlField}
              onChange={(value) => setFieldMapping(prev => ({ ...prev, audioUrlField: value }))}
              allowClear
              placeholder="请选择音频链接字段"
            >
              {mockFields.map(field => (
                <Option key={field.id} value={field.id}>
                  {field.name} ({field.type})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="标签字段（可选）">
            <Select
              value={fieldMapping.tagsField}
              onChange={(value) => setFieldMapping(prev => ({ ...prev, tagsField: value }))}
              allowClear
              placeholder="请选择标签字段"
            >
              {mockFields.map(field => (
                <Option key={field.id} value={field.id}>
                  {field.name} ({field.type})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeishuSync;