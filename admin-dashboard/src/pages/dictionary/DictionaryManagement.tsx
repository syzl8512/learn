import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  message,
  Tabs,
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
  Popconfirm,
  Upload,
  Form,
  Drawer,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
  ExportOutlined,
  TranslationOutlined,
  FileTextOutlined,
  SoundOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { DictionaryService } from '@services/dictionary';
import type {
  Word,
  DictionaryStats,
  DictionarySearchOptions,
  TranslationRequest,
  VocabularyBatch,
  WordImportResult,
} from '@/types/dictionary';
import { WordForm } from './WordForm';
import { TranslationTool } from './TranslationTool';
import { ExampleManager } from './ExampleManager';
import { BatchImport } from './BatchImport';

const { Search } = Input;
const { Option } = Select;

export const DictionaryManagement: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [stats, setStats] = useState<DictionaryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchOptions, setSearchOptions] = useState<DictionarySearchOptions>({
    page: 1,
    pageSize: 20,
    sortBy: 'wordRank',
    sortOrder: 'asc',
  });
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [wordFormVisible, setWordFormVisible] = useState(false);
  const [translationVisible, setTranslationVisible] = useState(false);
  const [exampleVisible, setExampleVisible] = useState(false);
  const [batchImportVisible, setBatchImportVisible] = useState(false);
  const [batches, setBatches] = useState<VocabularyBatch[]>([]);
  const [activeTab, setActiveTab] = useState('words');

  const dictionaryService = new DictionaryService();

  useEffect(() => {
    loadWords();
    loadStats();
    if (activeTab === 'batches') {
      loadBatches();
    }
  }, [searchOptions, activeTab]);

  const loadWords = async () => {
    try {
      setLoading(true);
      const response = await dictionaryService.getWords(searchOptions);
      setWords(response.words);
      setTotal(response.total);
    } catch (error) {
      message.error('加载词汇列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await dictionaryService.getStats();
      setStats(statsData);
    } catch (error) {
      message.error('加载统计数据失败');
    }
  };

  const loadBatches = async () => {
    try {
      const batchesData = await dictionaryService.getBatches();
      setBatches(batchesData);
    } catch (error) {
      message.error('加载批次列表失败');
    }
  };

  const handleSearch = (keyword: string) => {
    setSearchOptions(prev => ({
      ...prev,
      keyword,
      page: 1,
    }));
  };

  const handleFilterChange = (field: string, value: any) => {
    setSearchOptions(prev => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  const handleEdit = (word: Word) => {
    setSelectedWord(word);
    setWordFormVisible(true);
  };

  const handleDelete = async (wordId: string) => {
    try {
      await dictionaryService.deleteWord(wordId);
      message.success('删除成功');
      loadWords();
      loadStats();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleAdd = () => {
    setSelectedWord(null);
    setWordFormVisible(true);
  };

  const handleWordFormSave = async () => {
    setWordFormVisible(false);
    setSelectedWord(null);
    loadWords();
    loadStats();
  };

  const handlePlayPronunciation = (word: string, type: 'us' | 'uk') => {
    const audio = new Audio(
      `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`
    );
    audio.play().catch(() => {
      message.warning('发音播放失败');
    });
  };

  const handleExport = async () => {
    try {
      const blob = await dictionaryService.exportWords(searchOptions);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dictionary_export_${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  const handleBatchImport = async (result: WordImportResult) => {
    if (result.success) {
      message.success(`成功导入 ${result.importedCount} 个词汇`);
      setBatchImportVisible(false);
      loadWords();
      loadStats();
    } else {
      message.error(`导入失败: ${result.message}`);
    }
  };

  const columns: ColumnsType<Word> = [
    {
      title: '排名',
      dataIndex: 'wordRank',
      key: 'wordRank',
      width: 80,
      sorter: true,
    },
    {
      title: '单词',
      dataIndex: 'headWord',
      key: 'headWord',
      width: 150,
      render: (text: string, record: Word) => (
        <Space>
          <span style={{ fontWeight: 'bold', color: '#8B5CF6' }}>{text}</span>
          <Space size="small">
            <Tooltip title="美式发音">
              <SoundOutlined
                onClick={() => handlePlayPronunciation(text, 'us')}
                style={{ cursor: 'pointer', color: '#8B5CF6' }}
              />
            </Tooltip>
            <Tooltip title="英式发音">
              <SoundOutlined
                onClick={() => handlePlayPronunciation(text, 'uk')}
                style={{ cursor: 'pointer', color: '#A78BFA' }}
              />
            </Tooltip>
          </Space>
        </Space>
      ),
    },
    {
      title: '音标',
      key: 'phonetic',
      width: 120,
      render: (_, record: Word) => (
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div>US: {record.content.word.usphone}</div>
          <div>UK: {record.content.word.ukphone}</div>
        </div>
      ),
    },
    {
      title: '释义',
      key: 'translation',
      width: 250,
      render: (_, record: Word) => (
        <div style={{ fontSize: '12px' }}>
          {record.content.word.trans.map((trans, index) => (
            <div key={index}>
              {Object.entries(trans).map(([key, value]) => (
                <div key={key}>
                  <Tag color="purple" size="small">{key}</Tag>
                  {value.join('; ')}
                </div>
              ))}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '例句',
      key: 'sentence',
      width: 200,
      ellipsis: true,
      render: (_, record: Word) => (
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div>{record.content.word.sent.orig}</div>
          <div>{record.content.word.sent.trans}</div>
        </div>
      ),
    },
    {
      title: '考试类型',
      dataIndex: 'examType',
      key: 'examType',
      width: 120,
      render: (text: string) => {
        const colorMap: Record<string, string> = {
          cet4: 'blue',
          cet6: 'green',
          toefl: 'orange',
          ielts: 'red',
          gre: 'purple',
        };
        return <Tag color={colorMap[text] || 'default'}>{text.toUpperCase()}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record: Word) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: '#8B5CF6' }}
            />
          </Tooltip>
          <Tooltip title="例句管理">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => {
                setSelectedWord(record);
                setExampleVisible(true);
              }}
              style={{ color: '#10B981' }}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这个词汇吗？"
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

  const batchColumns: ColumnsType<VocabularyBatch> = [
    {
      title: '批次名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '考试类型',
      dataIndex: 'examType',
      key: 'examType',
      render: (text: string) => (
        <Tag color="purple">{text.toUpperCase()}</Tag>
      ),
    },
    {
      title: '词汇数量',
      dataIndex: 'wordCount',
      key: 'wordCount',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          processing: { color: 'processing', text: '处理中' },
          completed: { color: 'success', text: '已完成' },
          failed: { color: 'error', text: '失败' },
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'words',
              label: '词汇管理',
              children: (
                <div>
            {/* 统计卡片 */}
            {stats && (
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="总词汇数"
                      value={stats.totalWords}
                      valueStyle={{ color: '#8B5CF6' }}
                    />
                  </Card>
                </Col>
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="CET4"
                      value={stats.cet4Count}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="CET6"
                      value={stats.cet6Count}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="TOEFL"
                      value={stats.toeflCount}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="IELTS"
                      value={stats.ieltsCount}
                      valueStyle={{ color: '#eb2f96' }}
                    />
                  </Card>
                </Col>
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="GRE"
                      value={stats.greCount}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {/* 搜索和操作栏 */}
            <Space style={{ marginBottom: 16, width: '100%' }} wrap>
              <Search
                placeholder="搜索单词"
                allowClear
                style={{ width: 300 }}
                onSearch={handleSearch}
              />
              <Select
                placeholder="考试类型"
                allowClear
                style={{ width: 120 }}
                onChange={(value) => handleFilterChange('examType', value)}
              >
                <Option value="cet4">CET4</Option>
                <Option value="cet6">CET6</Option>
                <Option value="toefl">TOEFL</Option>
                <Option value="ielts">IELTS</Option>
                <Option value="gre">GRE</Option>
              </Select>
              <Select
                placeholder="排序方式"
                style={{ width: 150 }}
                value={`${searchOptions.sortBy}_${searchOptions.sortOrder}`}
                onChange={(value) => {
                  const [sortBy, sortOrder] = value.split('_');
                  setSearchOptions(prev => ({
                    ...prev,
                    sortBy: sortBy as any,
                    sortOrder: sortOrder as any,
                  }));
                }}
              >
                <Option value="wordRank_asc">排名升序</Option>
                <Option value="wordRank_desc">排名降序</Option>
                <Option value="headWord_asc">单词A-Z</Option>
                <Option value="headWord_desc">单词Z-A</Option>
                <Option value="createdAt_desc">最新添加</Option>
                <Option value="createdAt_asc">最早添加</Option>
              </Select>
              <Button icon={<ReloadOutlined />} onClick={loadWords}>
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
              >
                添加词汇
              </Button>
              <Button
                icon={<ImportOutlined />}
                onClick={() => setBatchImportVisible(true)}
              >
                批量导入
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出词汇
              </Button>
              <Button
                icon={<TranslationOutlined />}
                onClick={() => setTranslationVisible(true)}
              >
                翻译工具
              </Button>
            </Space>

            {/* 词汇表格 */}
            <Table
              columns={columns}
              dataSource={words}
              rowKey="id"
              loading={loading}
              pagination={{
                current: searchOptions.page,
                pageSize: searchOptions.pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                onChange: (page, pageSize) => {
                  setSearchOptions(prev => ({
                    ...prev,
                    page,
                    pageSize: pageSize || 20,
                  }));
                },
              }}
              scroll={{ x: 1200 }}
            />
                </div>
              ),
            },
            {
              key: 'batches',
              label: '批次管理',
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => setBatchImportVisible(true)}
                style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
              >
                新建导入批次
              </Button>
              <Button
                icon={<SyncOutlined />}
                onClick={loadBatches}
                style={{ marginLeft: 8 }}
              >
                刷新
              </Button>
            </div>
            <Table
              columns={batchColumns}
              dataSource={batches}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
              </div>
            ),
          },
        ]}
        />
      </Card>

      {/* 词汇编辑表单 */}
      <Modal
        title={selectedWord ? '编辑词汇' : '添加词汇'}
        open={wordFormVisible}
        onCancel={() => setWordFormVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <WordForm
          word={selectedWord}
          onSave={handleWordFormSave}
          onCancel={() => setWordFormVisible(false)}
        />
      </Modal>

      {/* 翻译工具 */}
      <Modal
        title="智能翻译工具"
        open={translationVisible}
        onCancel={() => setTranslationVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <TranslationTool />
      </Modal>

      {/* 例句管理 */}
      <Modal
        title={`例句管理 - ${selectedWord?.headWord}`}
        open={exampleVisible}
        onCancel={() => setExampleVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedWord && (
          <ExampleManager
            word={selectedWord}
            onClose={() => setExampleVisible(false)}
          />
        )}
      </Modal>

      {/* 批量导入 */}
      <Modal
        title="批量导入词汇"
        open={batchImportVisible}
        onCancel={() => setBatchImportVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <BatchImport
          onImportComplete={handleBatchImport}
          onCancel={() => setBatchImportVisible(false)}
        />
      </Modal>
    </div>
  );
};