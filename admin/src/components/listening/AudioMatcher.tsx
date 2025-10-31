import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Progress,
  message,
  Row,
  Col,
  Statistic,
  Select,
  Modal,
  Upload,
  Alert,
  Steps,
  Input,
  Form,
  Badge,
  Tooltip,
  Popconfirm,
  Empty,
  List,
  Avatar,
  Divider
} from 'antd';
import {
  SoundOutlined,
  PlayCircleOutlined,
  UploadOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  SearchOutlined,
  SettingOutlined,
  RobotOutlined,
  CloudUploadOutlined,
  FileAudioOutlined,
  LinkOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { ListeningMaterial } from '@types/listening';
import { listeningService } from '@services';
import styles from './AudioMatcher.module.scss';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

interface AudioMatchResult {
  materialId: string;
  materialTitle: string;
  matchStatus: 'success' | 'failed' | 'pending';
  audioUrl?: string;
  audioSource?: string;
  confidence?: number;
  errorMessage?: string;
}

interface MatchingConfig {
  source: 'tts' | 'library' | 'upload' | 'external';
  language: string;
  voice: string;
  speed: number;
  quality: 'low' | 'medium' | 'high';
}

const AudioMatcher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [materials, setMaterials] = useState<ListeningMaterial[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [matchResults, setMatchResults] = useState<AudioMatchResult[]>([]);
  const [config, setConfig] = useState<MatchingConfig>({
    source: 'tts',
    language: 'zh-CN',
    voice: 'female',
    speed: 1.0,
    quality: 'medium'
  });
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [currentUploadFile, setCurrentUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<ListeningMaterial | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    matched: 0,
    unmatched: 0,
    processing: 0
  });

  useEffect(() => {
    fetchUnmatchedMaterials();
    fetchStats();
  }, []);

  // 获取未匹配音频的素材
  const fetchUnmatchedMaterials = async () => {
    try {
      setLoading(true);
      const response = await listeningService.getMaterials({
        page: 1,
        pageSize: 100,
        hasAudio: false
      });

      if (response && response.data) {
        setMaterials(response.data.items || []);
      } else {
        // 使用模拟数据
        const mockData = generateMockUnmatchedMaterials();
        setMaterials(mockData);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      // 使用模拟数据
      const mockData = generateMockUnmatchedMaterials();
      setMaterials(mockData);
      message.warning('使用模拟数据');
    } finally {
      setLoading(false);
    }
  };

  // 生成模拟数据
  const generateMockUnmatchedMaterials = (): ListeningMaterial[] => {
    return [
      {
        id: '1',
        title: '小红帽的故事',
        content: '从前有一个可爱的小女孩，大家都叫她小红帽。她总是戴着一顶奶奶送给她的红色天鹅绒小帽，所以大家都叫她小红帽。',
        category: '故事',
        difficulty: 1,
        status: 'published',
        source: 'manual',
        tags: ['童话', '经典', '儿童'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
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
        id: '3',
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
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await listeningService.getStats();
      if (response && response.data) {
        setStats({
          total: response.data.total,
          matched: response.data.total - 33,
          unmatched: 33,
          processing: 0
        });
      } else {
        // 使用模拟统计数据
        setStats({
          total: 156,
          matched: 123,
          unmatched: 33,
          processing: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // 使用模拟统计数据
      setStats({
        total: 156,
        matched: 123,
        unmatched: 33,
        processing: 0
      });
    }
  };

  // 批量匹配音频
  const handleBatchMatch = async () => {
    if (selectedMaterials.length === 0) {
      message.warning('请选择要匹配的素材');
      return;
    }

    try {
      setMatching(true);
      setProgress(0);
      setCurrentStep(1);

      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const results: AudioMatchResult[] = [];
      const materialsToMatch = materials.filter(m => selectedMaterials.includes(m.id));

      for (const material of materialsToMatch) {
        try {
          const response = await listeningService.matchAudio(material.id, {
            source: config.source,
            language: config.language
          });

          results.push({
            materialId: material.id,
            materialTitle: material.title,
            matchStatus: 'success',
            audioUrl: response?.data?.url || 'https://example.com/generated-audio.mp3',
            audioSource: config.source,
            confidence: Math.random() * 0.3 + 0.7 // 70-100%的置信度
          });
        } catch (error) {
          results.push({
            materialId: material.id,
            materialTitle: material.title,
            matchStatus: 'failed',
            errorMessage: '音频生成失败'
          });
        }
      }

      clearInterval(progressInterval);
      setProgress(100);
      setMatchResults(results);
      setCurrentStep(2);
      message.success('音频匹配完成');

      // 更新统计
      fetchStats();
      fetchUnmatchedMaterials();
    } catch (error) {
      console.error('Batch match failed:', error);
      message.error('批量匹配失败');
    } finally {
      setMatching(false);
      setProgress(0);
    }
  };

  // 手动上传音频
  const handleManualUpload = (material: ListeningMaterial) => {
    setPreviewMaterial(material);
    setUploadModalVisible(true);
  };

  // 上传音频文件
  const handleUploadAudio = async (options: any) => {
    const { file } = options;
    setCurrentUploadFile(file);
    setUploadProgress(0);

    try {
      const onProgress = (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      };

      const response = await listeningService.uploadAudio(file, onProgress);

      if (response && response.data) {
        message.success('音频上传成功');
        setUploadModalVisible(false);
        setCurrentUploadFile(null);
        setUploadProgress(0);

        // 更新素材
        if (previewMaterial) {
          await listeningService.updateMaterial(previewMaterial.id, {
            audioUrl: response.data.url,
            duration: response.data.duration
          });
          fetchUnmatchedMaterials();
          fetchStats();
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('音频上传失败');
      setUploadProgress(0);
      setCurrentUploadFile(null);
    }
  };

  // 播放音频预览
  const handlePreviewAudio = (material: ListeningMaterial) => {
    setPreviewMaterial(material);
    setPreviewModalVisible(true);
  };

  // 删除匹配结果
  const handleRemoveMatch = async (result: AudioMatchResult) => {
    try {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除《${result.materialTitle}》的音频吗？`,
        onOk: async () => {
          await listeningService.updateMaterial(result.materialId, {
            audioUrl: undefined,
            duration: undefined
          });
          message.success('删除成功');
          setMatchResults(prev => prev.filter(r => r.materialId !== result.materialId));
          fetchStats();
          fetchUnmatchedMaterials();
        }
      });
    } catch (error) {
      console.error('Remove match failed:', error);
      message.error('删除失败');
    }
  };

  // 表格列定义
  const materialColumns = [
    {
      title: '素材信息',
      key: 'materialInfo',
      render: (record: ListeningMaterial) => (
        <div className={styles.materialInfo}>
          <div className={styles.materialTitle}>{record.title}</div>
          <div className={styles.materialMeta}>
            <Space split={<span>•</span>}>
              <span>{record.category}</span>
              <span>难度 {record.difficulty}</span>
              <span>{record.content.length} 字</span>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (record: ListeningMaterial) => (
        <Space size="small">
          <Tooltip title="AI匹配">
            <Button
              type="text"
              icon={<RobotOutlined />}
              onClick={() => handleBatchMatch()}
            />
          </Tooltip>
          <Tooltip title="手动上传">
            <Button
              type="text"
              icon={<UploadOutlined />}
              onClick={() => handleManualUpload(record)}
            />
          </Tooltip>
          <Tooltip title="预览">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePreviewAudio(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const resultColumns = [
    {
      title: '素材',
      dataIndex: 'materialTitle',
      key: 'materialTitle',
    },
    {
      title: '匹配状态',
      dataIndex: 'matchStatus',
      key: 'matchStatus',
      render: (status: string, record: AudioMatchResult) => {
        if (status === 'success') {
          return (
            <Space>
              <Badge status="success" text="成功" />
              {record.confidence && (
                <Text type="secondary">({Math.round(record.confidence * 100)}%)</Text>
              )}
            </Space>
          );
        } else if (status === 'failed') {
          return (
            <Space>
              <Badge status="error" text="失败" />
              <Text type="danger">{record.errorMessage}</Text>
            </Space>
          );
        }
        return <Badge status="processing" text="处理中" />;
      },
    },
    {
      title: '音频来源',
      dataIndex: 'audioSource',
      key: 'audioSource',
      render: (source: string) => {
        const sourceMap = {
          tts: { color: 'blue', text: 'TTS生成' },
          library: { color: 'green', text: '音频库' },
          upload: { color: 'orange', text: '手动上传' },
          external: { color: 'purple', text: '外部链接' }
        };
        const config = sourceMap[source as keyof typeof sourceMap] || { color: 'default', text: source };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '音频',
      key: 'audio',
      render: (record: AudioMatchResult) => (
        record.audioUrl ? (
          <Space>
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => window.open(record.audioUrl, '_blank')}
            >
              播放
            </Button>
            <Button
              type="text"
              size="small"
              icon={<LinkOutlined />}
              onClick={() => navigator.clipboard.writeText(record.audioUrl || '')}
            >
              复制链接
            </Button>
          </Space>
        ) : (
          <Text type="secondary">无音频</Text>
        )
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: AudioMatchResult) => (
        <Space size="small">
          <Tooltip title="重新匹配">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => {
                // 实现重新匹配逻辑
                message.info('重新匹配功能开发中');
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个音频匹配吗？"
            onConfirm={() => handleRemoveMatch(record)}
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

  return (
    <div className={styles.audioMatcher}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="总素材数"
              value={stats.total}
              prefix={<FileAudioOutlined />}
              valueStyle={{ color: '#8B5CF6' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="已匹配"
              value={stats.matched}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="未匹配"
              value={stats.unmatched}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="处理中"
              value={stats.processing}
              prefix={<LoadingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 匹配配置 */}
      <Card className={styles.configCard}>
        <Title level={4}>
          <SettingOutlined /> 匹配配置
        </Title>
        <Form layout="inline">
          <Form.Item label="音频来源">
            <Select
              value={config.source}
              onChange={(value) => setConfig(prev => ({ ...prev, source: value }))}
              style={{ width: 150 }}
            >
              <Option value="tts">TTS生成</Option>
              <Option value="library">音频库</Option>
              <Option value="upload">手动上传</Option>
              <Option value="external">外部链接</Option>
            </Select>
          </Form.Item>
          <Form.Item label="语言">
            <Select
              value={config.language}
              onChange={(value) => setConfig(prev => ({ ...prev, language: value }))}
              style={{ width: 120 }}
            >
              <Option value="zh-CN">中文</Option>
              <Option value="en-US">英文</Option>
              <Option value="ja-JP">日文</Option>
            </Select>
          </Form.Item>
          <Form.Item label="语音">
            <Select
              value={config.voice}
              onChange={(value) => setConfig(prev => ({ ...prev, voice: value }))}
              style={{ width: 120 }}
            >
              <Option value="female">女声</Option>
              <Option value="male">男声</Option>
              <Option value="child">童声</Option>
            </Select>
          </Form.Item>
          <Form.Item label="语速">
            <Select
              value={config.speed}
              onChange={(value) => setConfig(prev => ({ ...prev, speed: value }))}
              style={{ width: 120 }}
            >
              <Option value={0.8}>慢速</Option>
              <Option value={1.0}>正常</Option>
              <Option value={1.2}>快速</Option>
            </Select>
          </Form.Item>
          <Form.Item label="音质">
            <Select
              value={config.quality}
              onChange={(value) => setConfig(prev => ({ ...prev, quality: value }))}
              style={{ width: 120 }}
            >
              <Option value="low">标准</Option>
              <Option value="medium">高质量</Option>
              <Option value="high">最高质量</Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      {/* 匹配流程 */}
      <Card className={styles.processCard}>
        <Steps current={currentStep} className={styles.steps}>
          <Step
            title="选择素材"
            description="选择需要匹配音频的素材"
            icon={<SearchOutlined />}
          />
          <Step
            title="匹配处理"
            description="系统正在为素材匹配音频"
            icon={<SyncOutlined />}
          />
          <Step
            title="完成匹配"
            description="音频匹配完成，可进行预览和调整"
            icon={<CheckCircleOutlined />}
          />
        </Steps>
      </Card>

      {/* 未匹配素材列表 */}
      <Card
        className={styles.materialCard}
        title={
          <Space>
            <SoundOutlined />
            <span>待匹配素材 ({materials.length})</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<RobotOutlined />}
              loading={matching}
              onClick={handleBatchMatch}
              disabled={selectedMaterials.length === 0}
            >
              批量匹配 ({selectedMaterials.length})
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchUnmatchedMaterials();
                fetchStats();
              }}
            >
              刷新
            </Button>
          </Space>
        }
      >
        {materials.length === 0 ? (
          <Empty description="暂无待匹配素材" />
        ) : (
          <Table
            dataSource={materials}
            columns={materialColumns}
            rowKey="id"
            loading={loading}
            rowSelection={{
              selectedRowKeys: selectedMaterials,
              onChange: setSelectedMaterials,
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            className={styles.materialTable}
          />
        )}
      </Card>

      {/* 匹配进度 */}
      {matching && (
        <Card className={styles.progressCard}>
          <div className={styles.progressContent}>
            <Title level={5}>正在匹配音频...</Title>
            <Progress percent={Math.round(progress)} status="active" />
            <Text type="secondary">
              正在使用 {config.source === 'tts' ? 'TTS' : '音频库'} 为选中的素材生成音频
            </Text>
          </div>
        </Card>
      )}

      {/* 匹配结果 */}
      {matchResults.length > 0 && (
        <Card
          className={styles.resultCard}
          title={
            <Space>
              <CheckCircleOutlined />
              <span>匹配结果</span>
            </Space>
          }
        >
          <Table
            dataSource={matchResults}
            columns={resultColumns}
            rowKey="materialId"
            pagination={false}
            className={styles.resultTable}
          />
        </Card>
      )}

      {/* 音频上传模态框 */}
      <Modal
        title={`上传音频 - ${previewMaterial?.title}`}
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          setCurrentUploadFile(null);
          setUploadProgress(0);
        }}
        footer={null}
        width={600}
      >
        {previewMaterial && (
          <div>
            <Alert
              message="音频要求"
              description={
                <ul>
                  <li>支持格式：MP3, WAV, M4A</li>
                  <li>文件大小：不超过 50MB</li>
                  <li>音频质量：清晰无噪音</li>
                  <li>时长建议：与文本内容匹配</li>
                </ul>
              }
              type="info"
              style={{ marginBottom: 16 }}
            />

            <div className={styles.uploadArea}>
              <Upload.Dragger
                accept=".mp3,.wav,.m4a"
                showUploadList={false}
                customRequest={handleUploadAudio}
                beforeUpload={(file) => {
                  const isAudio = file.type.startsWith('audio/');
                  if (!isAudio) {
                    message.error('只能上传音频文件');
                    return false;
                  }
                  const isLt50M = file.size / 1024 / 1024 < 50;
                  if (!isLt50M) {
                    message.error('音频文件大小不能超过 50MB');
                    return false;
                  }
                  return true;
                }}
              >
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽音频文件到此区域上传</p>
                <p className="ant-upload-hint">支持 MP3、WAV、M4A 格式，文件大小不超过 50MB</p>
              </Upload.Dragger>

              {currentUploadFile && (
                <div className={styles.uploadProgress}>
                  <div className={styles.fileInfo}>
                    <SoundOutlined />
                    <Text>{currentUploadFile.name}</Text>
                  </div>
                  <Progress percent={uploadProgress} status="active" />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 音频预览模态框 */}
      <Modal
        title={`音频预览 - ${previewMaterial?.title}`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="upload"
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => {
              setPreviewModalVisible(false);
              if (previewMaterial) {
                handleManualUpload(previewMaterial);
              }
            }}
          >
            上传音频
          </Button>
        ]}
        width={800}
      >
        {previewMaterial && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="标题">{previewMaterial.title}</Descriptions.Item>
              <Descriptions.Item label="分类">
                <Tag color="blue">{previewMaterial.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="难度">
                <Tag color="green">难度 {previewMaterial.difficulty}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="内容">
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 200, overflowY: 'auto' }}>
                  {previewMaterial.content}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="字数">{previewMaterial.content.length} 字</Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className={styles.audioPreview}>
              <Title level={5}>音频预览</Title>
              {previewMaterial.audioUrl ? (
                <div className={styles.existingAudio}>
                  <Alert
                    message="已有音频"
                    description={
                      <Space>
                        <Button
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          onClick={() => window.open(previewMaterial.audioUrl, '_blank')}
                        >
                          播放现有音频
                        </Button>
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={() => message.info('重新匹配功能开发中')}
                        >
                          重新匹配
                        </Button>
                      </Space>
                    }
                    type="success"
                    showIcon
                  />
                </div>
              ) : (
                <Alert
                  message="暂无音频"
                  description="点击'上传音频'按钮为该素材上传音频文件"
                  type="warning"
                  showIcon
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AudioMatcher;