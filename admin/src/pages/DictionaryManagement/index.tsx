import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Space, Table, Tag, Modal, Form, Input, Select, message, Tabs, Badge, Upload } from 'antd';
import { PlusOutlined, ImportOutlined, ExportOutlined, TranslationOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useApp } from '@contexts/AuthContext';
import { Vocabulary, VocabularySearchParams, VocabularyImportParams } from '@/types/dictionary';
import { dictionaryService } from '@services';
import styles from './DictionaryManagement.module.scss';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const DictionaryManagement: React.FC = () => {
  const { setPageTitle, setPageDescription } = useApp();
  const [loading, setLoading] = useState(false);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('vocabulary');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [optimizeModalVisible, setOptimizeModalVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null);
  const [form] = Form.useForm();

  const [searchParams, setSearchParams] = useState<VocabularySearchParams>({
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    setPageTitle('词典管理');
    setPageDescription('管理词汇库、翻译优化和智能匹配');
    fetchVocabulary();
  }, [setPageTitle, setPageDescription]);

  // 获取词汇列表
  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      const response = await dictionaryService.getVocabulary(searchParams);
      const { data } = response;

      if (data.success && data.data) {
        setVocabulary(data.data.items);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error);
      message.error('获取词汇列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索参数变化
  useEffect(() => {
    fetchVocabulary();
  }, [searchParams]);

  // 表格列定义
  const columns = [
    {
      title: '单词',
      dataIndex: 'word',
      key: 'word',
      render: (word: string, record: Vocabulary) => (
        <div className={styles.wordInfo}>
          <div className={styles.word}>{word}</div>
          {record.phonetic && (
            <div className={styles.phonetic}>[{record.phonetic}]</div>
          )}
        </div>
      ),
    },
    {
      title: '翻译',
      dataIndex: 'translation',
      key: 'translation',
      render: (translation: string) => (
        <div className={styles.translation}>{translation}</div>
      ),
    },
    {
      title: '释义',
      dataIndex: 'definition',
      key: 'definition',
      render: (definition: string) => (
        <div className={styles.definition}>
          {definition.length > 50 ? `${definition.substring(0, 50)}...` : definition}
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        category ? <Tag color="blue">{category}</Tag> : '-'
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
      title: '频率',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (frequency: number) => (
        <Badge
          count={frequency}
          style={{ backgroundColor: '#52c41a' }}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'green', text: '活跃' },
          inactive: { color: 'gray', text: '停用' },
          pending: { color: 'orange', text: '待审核' },
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
      render: (record: Vocabulary) => (
        <Space size="small">
          <Button
            type="text"
            icon={<TranslationOutlined />}
            onClick={() => handleOptimizeTranslation(record)}
          >
            优化翻译
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditWord(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteWord(record)}
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

  // 编辑单词
  const handleEditWord = (word: Vocabulary) => {
    setCurrentWord(word);
    form.setFieldsValue(word);
    setEditModalVisible(true);
  };

  // 删除单词
  const handleDeleteWord = (word: Vocabulary) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除单词"${word.word}"吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await dictionaryService.deleteWord(word.id);
          message.success('删除成功');
          fetchVocabulary();
        } catch (error) {
          console.error('Failed to delete word:', error);
          message.error('删除失败');
        }
      },
    });
  };

  // 优化翻译
  const handleOptimizeTranslation = (word: Vocabulary) => {
    setCurrentWord(word);
    form.setFieldsValue({
      word: word.word,
      originalTranslation: word.translation,
    });
    setOptimizeModalVisible(true);
  };

  // 保存单词
  const handleSaveWord = async (values: any) => {
    try {
      if (currentWord) {
        await dictionaryService.updateWord(currentWord.id, values);
        message.success('更新成功');
      } else {
        await dictionaryService.createWord(values);
        message.success('创建成功');
      }
      setEditModalVisible(false);
      setCurrentWord(null);
      form.resetFields();
      fetchVocabulary();
    } catch (error) {
      console.error('Failed to save word:', error);
      message.error('保存失败');
    }
  };

  // 执行翻译优化
  const handleExecuteOptimization = async (values: any) => {
    if (!currentWord) return;

    try {
      const response = await dictionaryService.optimizeTranslation({
        word: currentWord.word,
        originalTranslation: currentWord.translation,
        context: values.context,
        targetAudience: values.targetAudience,
        optimizationType: values.optimizationType,
      });

      const { data } = response;
      if (data.success && data.data) {
        message.success('翻译优化完成');
        setOptimizeModalVisible(false);

        // 可以选择是否自动应用优化结果
        Modal.confirm({
          title: '应用优化结果',
          content: `优化后的翻译：${data.data.optimizedTranslation}`,
          onOk: async () => {
            await dictionaryService.updateWord(currentWord.id, {
              translation: data.data.optimizedTranslation,
            });
            fetchVocabulary();
          },
        });
      }
    } catch (error) {
      console.error('Failed to optimize translation:', error);
      message.error('翻译优化失败');
    }
  };

  // 导入词汇
  const handleImportVocabulary = () => {
    setImportModalVisible(true);
  };

  // 导出词汇
  const handleExportVocabulary = async (format: 'excel' | 'csv' | 'json' = 'excel') => {
    try {
      setLoading(true);
      await dictionaryService.exportWords({ format, filters: searchParams });
      message.success(`词汇库已导出为 ${format.toUpperCase()} 格式`);
    } catch (error) {
      console.error('Export failed:', error);
      message.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      const params: VocabularyImportParams = {
        source: file.name.endsWith('.csv') ? 'csv' : 'excel',
        file,
        mapping: {
          wordField: 'word',
          definitionField: 'definition',
          translationField: 'translation',
          phoneticField: 'phonetic',
          exampleField: 'example',
          exampleTranslationField: 'exampleTranslation',
          categoryField: 'category',
          difficultyField: 'difficulty',
          tagsField: 'tags',
        },
        options: {
          skipFirstRow: true,
          updateExisting: false,
          defaultCategory: '其他',
          defaultDifficulty: 3,
        },
      };

      await dictionaryService.importWords(params, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        message.info(`导入进度: ${progress}%`);
      });

      message.success('词汇导入成功');
      setImportModalVisible(false);
      fetchVocabulary();
    } catch (error) {
      console.error('Import failed:', error);
      message.error('导入失败，请检查文件格式');
    } finally {
      setLoading(false);
    }
    return false; // 阻止默认上传行为
  };

  return (
    <div className={styles.dictionaryManagement}>
      {/* 页面标题区域 */}
      <div className={styles.pageHeader}>
        <Title level={2}>词典管理</Title>
        <Paragraph type="secondary">
          管理词汇库、翻译优化、智能匹配和批量操作
        </Paragraph>
      </div>

      {/* 操作区域 */}
      <div className={styles.actionBar}>
        <Space size="middle">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentWord(null);
              form.resetFields();
              setEditModalVisible(true);
            }}
          >
            新建词汇
          </Button>
          <Button
            icon={<ImportOutlined />}
            onClick={handleImportVocabulary}
          >
            导入词汇
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExportVocabulary}
          >
            导出词汇
          </Button>
          <Button
            icon={<SearchOutlined />}
            onClick={() => message.info('高级搜索功能将在后续版本中实现')}
          >
            高级搜索
          </Button>
        </Space>
      </div>

      {/* 内容区域 */}
      <Card className={styles.contentCard}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="词汇管理" key="vocabulary">
            <Table
              columns={columns}
              dataSource={vocabulary}
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
              className={styles.vocabularyTable}
            />
          </TabPane>

          <TabPane tab="翻译优化" key="optimization">
            <div className={styles.translationOptimization}>
              <div className={styles.optimizationPlaceholder}>
                <h3>智能翻译优化</h3>
                <p>使用AI技术优化词汇翻译，提供更适合儿童的解释</p>
                <Button type="primary" icon={<TranslationOutlined />}>
                  开始批量优化
                </Button>
              </div>
            </div>
          </TabPane>

          <TabPane tab="词汇库" key="libraries">
            <div className={styles.vocabularyLibraries}>
              <div className={styles.librariesPlaceholder}>
                <h3>词汇库管理</h3>
                <p>创建和管理不同主题和难度的词汇库</p>
                <Button type="primary">创建词汇库</Button>
              </div>
            </div>
          </TabPane>

          <TabPane tab="统计分析" key="analytics">
            <div className={styles.analytics}>
              <div className={styles.analyticsPlaceholder}>
                <h3>词汇统计分析</h3>
                <p>查看词汇使用频率、难度分布等统计数据</p>
                <Button type="primary">查看统计</Button>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* 新建/编辑词汇模态框 */}
      <Modal
        title={currentWord ? '编辑词汇' : '新建词汇'}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentWord(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveWord}
        >
          <Form.Item
            name="word"
            label="单词"
            rules={[{ required: true, message: '请输入单词' }]}
          >
            <Input placeholder="请输入单词" />
          </Form.Item>

          <Form.Item
            name="phonetic"
            label="音标"
          >
            <Input placeholder="请输入音标" />
          </Form.Item>

          <Form.Item
            name="translation"
            label="翻译"
            rules={[{ required: true, message: '请输入翻译' }]}
          >
            <Input placeholder="请输入中文翻译" />
          </Form.Item>

          <Form.Item
            name="definition"
            label="释义"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入单词释义"
            />
          </Form.Item>

          <Form.Item
            name="example"
            label="例句"
          >
            <Input.TextArea
              rows={2}
              placeholder="请输入例句"
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
          >
            <Select placeholder="请选择分类">
              <Option value="名词">名词</Option>
              <Option value="动词">动词</Option>
              <Option value="形容词">形容词</Option>
              <Option value="副词">副词</Option>
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

      {/* 翻译优化模态框 */}
      <Modal
        title="翻译优化"
        open={optimizeModalVisible}
        onCancel={() => setOptimizeModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleExecuteOptimization}
        >
          <Form.Item
            name="word"
            label="单词"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="originalTranslation"
            label="原翻译"
          >
            <Input.TextArea rows={2} disabled />
          </Form.Item>

          <Form.Item
            name="context"
            label="上下文"
          >
            <Input.TextArea
              rows={3}
              placeholder="请提供上下文（可选）"
            />
          </Form.Item>

          <Form.Item
            name="targetAudience"
            label="目标受众"
            initialValue="children"
          >
            <Select>
              <Option value="children">儿童 (6-12岁)</Option>
              <Option value="teenagers">青少年 (13-18岁)</Option>
              <Option value="adults">成人</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="optimizationType"
            label="优化类型"
            initialValue="simplify"
          >
            <Select>
              <Option value="simplify">简化翻译</Option>
              <Option value="expand">扩展解释</Option>
              <Option value="contextualize">情景化翻译</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 导入模态框 */}
      <Modal
        title="导入词汇"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="download"
            type="default"
            onClick={async () => {
              try {
                await dictionaryService.downloadImportTemplate();
                message.success('模板下载成功');
              } catch (error) {
                message.error('模板下载失败');
              }
            }}
          >
            下载模板
          </Button>,
        ]}
        width={600}
      >
        <div className={styles.importContent}>
          <p>支持导入 Excel (.xlsx) 和 CSV (.csv) 格式的文件</p>
          <p>请确保文件包含以下列：单词、翻译、音标、释义、例句等</p>
          <div className={styles.uploadArea}>
            <Upload.Dragger
              accept=".xlsx,.csv"
              showUploadList={false}
              beforeUpload={handleFileUpload}
              multiple={false}
            >
              <p className="ant-upload-drag-icon">
                <ImportOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持单个文件上传，文件大小不超过 10MB</p>
            </Upload.Dragger>
          </div>
          <div className={styles.importOptions}>
            <h4>导入选项：</h4>
            <ul>
              <li>跳过首行（表头）</li>
              <li>不更新已存在的词汇</li>
              <li>默认分类：其他</li>
              <li>默认难度：3（中级）</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DictionaryManagement;