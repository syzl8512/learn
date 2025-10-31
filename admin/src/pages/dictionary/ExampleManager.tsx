import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Form,
  Modal,
  message,
  Space,
  Tooltip,
  Popconfirm,
  Tag,
  Select,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SoundOutlined,
  CopyOutlined,
  StarOutlined,
  StarFilled,
  FileTextOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { DictionaryService } from '../services/dictionary';
import { Word, Sentence } from './types';

const { TextArea } = Input;
const { Option } = Select;

interface ExampleManagerProps {
  word: Word;
  onClose: () => void;
}

interface ExampleItem {
  id: string;
  wordId: string;
  orig: string;
  trans: string;
  source: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const ExampleManager: React.FC<ExampleManagerProps> = ({ word, onClose }) => {
  const [examples, setExamples] = useState<ExampleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExample, setEditingExample] = useState<ExampleItem | null>(null);
  const [form] = Form.useForm();
  const [filterSource, setFilterSource] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');

  const dictionaryService = new DictionaryService();

  useEffect(() => {
    loadExamples();
  }, []);

  const loadExamples = async () => {
    try {
      setLoading(true);
      const response = await dictionaryService.getWordExamples(word.id);
      setExamples(response);
    } catch (error) {
      message.error('加载例句失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingExample(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (example: ExampleItem) => {
    setEditingExample(example);
    form.setFieldsValue(example);
    setModalVisible(true);
  };

  const handleDelete = async (exampleId: string) => {
    try {
      await dictionaryService.deleteExample(exampleId);
      message.success('删除成功');
      loadExamples();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSave = async (values: any) => {
    try {
      if (editingExample) {
        await dictionaryService.updateExample(editingExample.id, values);
        message.success('更新成功');
      } else {
        await dictionaryService.createExample({
          ...values,
          wordId: word.id,
        });
        message.success('添加成功');
      }
      setModalVisible(false);
      loadExamples();
    } catch (error) {
      message.error(editingExample ? '更新失败' : '添加失败');
    }
  };

  const handlePlayPronunciation = (text: string) => {
    const audio = new Audio(
      `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=1`
    );
    audio.play().catch(() => {
      message.warning('发音播放失败');
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('已复制到剪贴板');
    });
  };

  const handleToggleFeatured = async (example: ExampleItem) => {
    try {
      await dictionaryService.updateExample(example.id, {
        isFeatured: !example.isFeatured,
      });
      message.success(example.isFeatured ? '已取消推荐' : '已设为推荐');
      loadExamples();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleBatchImport = () => {
    Modal.info({
      title: '批量导入例句',
      content: (
        <div>
          <p>请按以下格式准备数据：</p>
          <pre style={{
            background: '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
{`英文例句1\\t中文翻译1
英文例句2\\t中文翻译2
英文例句3\\t中文翻译3`}
          </pre>
          <p>每行一个例句，用制表符(Tab)分隔英文和中文。</p>
        </div>
      ),
      width: 600,
    });
  };

  const filteredExamples = examples.filter(example => {
    if (filterSource && example.source !== filterSource) return false;
    if (filterDifficulty && example.difficulty !== filterDifficulty) return false;
    return true;
  });

  const columns: ColumnsType<ExampleItem> = [
    {
      title: '英文例句',
      dataIndex: 'orig',
      key: 'orig',
      width: 300,
      render: (text: string, record: ExampleItem) => (
        <div>
          <div style={{ marginBottom: 4 }}>{text}</div>
          <Space size="small">
            <Tooltip title="播放发音">
              <SoundOutlined
                onClick={() => handlePlayPronunciation(text)}
                style={{ cursor: 'pointer', color: '#8B5CF6' }}
              />
            </Tooltip>
            <Tooltip title="复制">
              <CopyOutlined
                onClick={() => handleCopy(text)}
                style={{ cursor: 'pointer', color: '#666' }}
              />
            </Tooltip>
            {record.isFeatured && (
              <StarFilled style={{ color: '#faad14' }} />
            )}
          </Space>
        </div>
      ),
    },
    {
      title: '中文翻译',
      dataIndex: 'trans',
      key: 'trans',
      width: 250,
      render: (text: string) => (
        <div>
          <div>{text}</div>
          <Space size="small">
            <Tooltip title="复制">
              <CopyOutlined
                onClick={() => handleCopy(text)}
                style={{ cursor: 'pointer', color: '#666' }}
              />
            </Tooltip>
          </Space>
        </div>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (text: string) => {
        const colorMap: Record<string, string> = {
          system: 'blue',
          manual: 'green',
          import: 'orange',
          ai: 'purple',
        };
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
      },
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (difficulty: string) => {
        const colorMap = {
          easy: 'green',
          medium: 'orange',
          hard: 'red',
        };
        const textMap = {
          easy: '简单',
          medium: '中等',
          hard: '困难',
        };
        return (
          <Tag color={colorMap[difficulty as keyof typeof colorMap]}>
            {textMap[difficulty as keyof typeof textMap]}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: Date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record: ExampleItem) => (
        <Space size="small">
          <Tooltip title={record.isFeatured ? '取消推荐' : '设为推荐'}>
            <Button
              type="text"
              icon={record.isFeatured ? <StarFilled /> : <StarOutlined />}
              onClick={() => handleToggleFeatured(record)}
              style={{ color: record.isFeatured ? '#faad14' : '#666' }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: '#8B5CF6' }}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这个例句吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  单词：<span style={{ color: '#8B5CF6' }}>{word.headWord}</span>
                </span>
                <Tag color="purple">{word.examType.toUpperCase()}</Tag>
                <span style={{ color: '#666' }}>
                  共 {filteredExamples.length} 个例句
                </span>
              </Space>
            </Col>
            <Col>
              <Space>
                <Select
                  placeholder="来源筛选"
                  allowClear
                  style={{ width: 120 }}
                  value={filterSource}
                  onChange={setFilterSource}
                >
                  <Option value="system">系统</Option>
                  <Option value="manual">手动</Option>
                  <Option value="import">导入</Option>
                  <Option value="ai">AI生成</Option>
                </Select>
                <Select
                  placeholder="难度筛选"
                  allowClear
                  style={{ width: 100 }}
                  value={filterDifficulty}
                  onChange={setFilterDifficulty}
                >
                  <Option value="easy">简单</Option>
                  <Option value="medium">中等</Option>
                  <Option value="hard">困难</Option>
                </Select>
                <Button
                  icon={<FileTextOutlined />}
                  onClick={handleBatchImport}
                >
                  批量导入
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
                >
                  添加例句
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredExamples}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 例句编辑模态框 */}
      <Modal
        title={editingExample ? '编辑例句' : '添加例句'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            source: 'manual',
            difficulty: 'medium',
            isFeatured: false,
          }}
        >
          <Form.Item
            name="orig"
            label="英文例句"
            rules={[{ required: true, message: '请输入英文例句' }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入英文例句"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="trans"
            label="中文翻译"
            rules={[{ required: true, message: '请输入中文翻译' }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入中文翻译"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="source"
                label="来源"
                rules={[{ required: true, message: '请选择来源' }]}
              >
                <Select>
                  <Option value="system">系统</Option>
                  <Option value="manual">手动</Option>
                  <Option value="import">导入</Option>
                  <Option value="ai">AI生成</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="difficulty"
                label="难度"
                rules={[{ required: true, message: '请选择难度' }]}
              >
                <Select>
                  <Option value="easy">简单</Option>
                  <Option value="medium">中等</Option>
                  <Option value="hard">困难</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isFeatured" valuePropName="checked">
            <label>
              <input type="checkbox" /> 设为推荐例句
            </label>
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
              >
                {editingExample ? '更新' : '添加'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};