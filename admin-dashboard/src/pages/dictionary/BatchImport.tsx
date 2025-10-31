import React, { useState, useRef } from 'react';
import {
  Card,
  Upload,
  Button,
  Form,
  Input,
  Select,
  Progress,
  Table,
  message,
  Space,
  Row,
  Col,
  Alert,
  Divider,
  Typography,
  Tabs,
} from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ImportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import type { ColumnsType } from 'antd/es/table';
import { DictionaryService } from '@services/dictionary';
import { WordImportResult, Word } from './types';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

interface BatchImportProps {
  onImportComplete: (result: WordImportResult) => void;
  onCancel: () => void;
}

interface ParsedWord {
  headWord: string;
  wordRank: number;
  examType: string;
  usphone?: string;
  ukphone?: string;
  translation: string;
  example?: string;
}

interface ImportError {
  row: number;
  word: string;
  error: string;
  data?: any;
}

export const BatchImport: React.FC<BatchImportProps> = ({ onImportComplete, onCancel }) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('file');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedWords, setParsedWords] = useState<ParsedWord[]>([]);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dictionaryService = new DictionaryService();

  const examTypes = [
    { value: 'cet4', label: 'CET4 四级' },
    { value: 'cet6', label: 'CET6 六级' },
    { value: 'toefl', label: 'TOEFL 托福' },
    { value: 'ielts', label: 'IELTS 雅思' },
    { value: 'gre', label: 'GRE' },
    { value: 'custom', label: '自定义' },
  ];

  const handleFileUpload: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  const parseTextData = (text: string, format: string): ParsedWord[] => {
    const words: ParsedWord[] = [];
    const lines = text.split('\n').filter(line => line.trim());

    lines.forEach((line, index) => {
      try {
        if (format === 'simple') {
          // 格式: word [phonetic] translation
          const match = line.match(/^(\w+)\s*\[([^\]]+)\]\s*(.+)$/);
          if (match) {
            words.push({
              headWord: match[1],
              wordRank: index + 1,
              examType: form.getFieldValue('examType') || 'custom',
              usphone: match[2],
              translation: match[3],
            });
          }
        } else if (format === 'tab') {
          // 格式: word\tphonetic\ttranslation
          const parts = line.split('\t');
          if (parts.length >= 3) {
            words.push({
              headWord: parts[0].trim(),
              wordRank: index + 1,
              examType: form.getFieldValue('examType') || 'custom',
              usphone: parts[1].trim(),
              translation: parts[2].trim(),
              example: parts[3]?.trim(),
            });
          }
        } else if (format === 'json') {
          // JSON格式
          const data = JSON.parse(line);
          words.push({
            headWord: data.headWord || data.word,
            wordRank: data.wordRank || index + 1,
            examType: data.examType || 'custom',
            usphone: data.usphone || data.phonetic,
            ukphone: data.ukphone,
            translation: data.translation || data.trans,
            example: data.example,
          });
        }
      } catch (error) {
        setImportErrors(prev => [...prev, {
          row: index + 1,
          word: line.split(/\t|\s/)[0] || 'unknown',
          error: `解析失败: ${error}`,
          data: line,
        }]);
      }
    });

    return words;
  };

  const handleTextImport = async () => {
    const text = form.getFieldValue('textContent');
    const format = form.getFieldValue('textFormat');

    if (!text.trim()) {
      message.warning('请输入要导入的文本内容');
      return;
    }

    setParsing(true);
    try {
      const words = parseTextData(text, format);
      setParsedWords(words);
      setPreviewData(words.slice(0, 10));
      setImportErrors([]);
      message.success(`成功解析 ${words.length} 个词汇`);
    } catch (error) {
      message.error('文本解析失败');
    } finally {
      setParsing(false);
    }
  };

  const handleFileParse = async (file: File) => {
    setParsing(true);
    try {
      const text = await file.text();
      const format = form.getFieldValue('fileFormat') || detectFormat(file.name);
      const words = parseTextData(text, format);
      setParsedWords(words);
      setPreviewData(words.slice(0, 10));
      setImportErrors([]);
      message.success(`成功解析 ${words.length} 个词汇`);
    } catch (error) {
      message.error('文件解析失败');
    } finally {
      setParsing(false);
    }
  };

  const detectFormat = (filename: string): string => {
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.txt')) return 'tab';
    return 'simple';
  };

  const handleImport = async () => {
    if (parsedWords.length === 0) {
      message.warning('没有可导入的词汇');
      return;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      const batchSize = 100;
      const batches = [];

      for (let i = 0; i < parsedWords.length; i += batchSize) {
        batches.push(parsedWords.slice(i, i + batchSize));
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: ImportError[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          const result = await dictionaryService.batchImportWords(batch);
          successCount += result.importedCount || 0;
          errorCount += result.failedCount || 0;

          if (result.errors) {
            errors.push(...result.errors);
          }
        } catch (error) {
          errorCount += batch.length;
          batch.forEach((word, index) => {
            errors.push({
              row: i * batchSize + index + 1,
              word: word.headWord,
              error: '导入失败',
              data: word,
            });
          });
        }

        setImportProgress(Math.round(((i + 1) / batches.length) * 100));
      }

      setImportErrors(errors);

      if (errorCount === 0) {
        message.success(`成功导入 ${successCount} 个词汇`);
        onImportComplete({
          success: true,
          message: '导入成功',
          importedCount: successCount,
        });
      } else {
        message.warning(`导入完成：成功 ${successCount} 个，失败 ${errorCount} 个`);
        onImportComplete({
          success: true,
          message: `部分导入成功：${successCount} 个成功，${errorCount} 个失败`,
          importedCount: successCount,
          failedCount: errorCount,
          errors: errors.map(e => e.error),
        });
      }
    } catch (error) {
      message.error('批量导入失败');
      onImportComplete({
        success: false,
        message: '导入失败',
      });
    } finally {
      setImporting(false);
    }
  };

  const previewColumns: ColumnsType<ParsedWord> = [
    {
      title: '单词',
      dataIndex: 'headWord',
      key: 'headWord',
      width: 150,
    },
    {
      title: '排名',
      dataIndex: 'wordRank',
      key: 'wordRank',
      width: 80,
    },
    {
      title: '音标',
      dataIndex: 'usphone',
      key: 'usphone',
      width: 120,
      render: (text: string, record: ParsedWord) => (
        <div style={{ fontSize: '12px' }}>
          {text && <div>US: {text}</div>}
          {record.ukphone && <div>UK: {record.ukphone}</div>}
        </div>
      ),
    },
    {
      title: '释义',
      dataIndex: 'translation',
      key: 'translation',
      width: 200,
      ellipsis: true,
    },
    {
      title: '例句',
      dataIndex: 'example',
      key: 'example',
      width: 250,
      ellipsis: true,
    },
    {
      title: '考试类型',
      dataIndex: 'examType',
      key: 'examType',
      width: 100,
      render: (text: string) => (
        <span style={{ color: '#8B5CF6' }}>{text.toUpperCase()}</span>
      ),
    },
  ];

  const errorColumns: ColumnsType<ImportError> = [
    {
      title: '行号',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: '单词',
      dataIndex: 'word',
      key: 'word',
      width: 150,
    },
    {
      title: '错误信息',
      dataIndex: 'error',
      key: 'error',
      ellipsis: true,
    },
  ];

  const downloadTemplate = () => {
    const templates = {
      simple: `word [phonetic] translation
hello [həˈləʊ] 你好
world [wɜːld] 世界`,
      tab: `word\tphonetic\ttranslation\texample
hello\thəˈləʊ\t你好\tHello, how are you?
world\twɜːld\t世界\tWelcome to the world`,
      json: `{"headWord":"hello","wordRank":1,"examType":"cet4","usphone":"həˈləʊ","translation":"你好"}
{"headWord":"world","wordRank":2,"examType":"cet4","usphone":"wɜːld","translation":"世界"}`,
    };

    const format = form.getFieldValue('downloadFormat') || 'tab';
    const content = templates[format as keyof typeof templates];
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dictionary_template_${format}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '16px' }}>
      <Title level={4}>批量导入词汇</Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="文件上传" key="file">
          <Card size="small" style={{ marginBottom: 16 }}>
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="examType"
                    label="默认考试类型"
                    rules={[{ required: true, message: '请选择考试类型' }]}
                  >
                    <Select placeholder="选择考试类型">
                      {examTypes.map(type => (
                        <Option key={type.value} value={type.value}>
                          {type.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fileFormat"
                    label="文件格式"
                    initialValue="tab"
                  >
                    <Select>
                      <Option value="simple">简单格式 (word [phonetic] translation)</Option>
                      <Option value="tab">制表符格式 (word\tphonetic\ttranslation)</Option>
                      <Option value="json">JSON格式</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="选择文件">
                <Upload
                  accept=".txt,.json,.csv"
                  fileList={fileList}
                  onChange={handleFileUpload}
                  beforeUpload={(file) => {
                    if (file.size > 10 * 1024 * 1024) {
                      message.error('文件大小不能超过10MB');
                      return false;
                    }
                    handleFileParse(file);
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>选择文件</Button>
                </Upload>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="文本输入" key="text">
          <Card size="small" style={{ marginBottom: 16 }}>
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="examType"
                    label="考试类型"
                    rules={[{ required: true, message: '请选择考试类型' }]}
                  >
                    <Select placeholder="选择考试类型">
                      {examTypes.map(type => (
                        <Option key={type.value} value={type.value}>
                          {type.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="textFormat"
                    label="文本格式"
                    initialValue="tab"
                  >
                    <Select>
                      <Option value="simple">简单格式</Option>
                      <Option value="tab">制表符格式</Option>
                      <Option value="json">JSON格式</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="textContent"
                label="文本内容"
                rules={[{ required: true, message: '请输入文本内容' }]}
              >
                <TextArea
                  rows={8}
                  placeholder="请输入词汇数据，每行一个词汇"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  icon={<ImportOutlined />}
                  onClick={handleTextImport}
                  loading={parsing}
                  style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
                >
                  解析文本
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>

      {/* 下载模板 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Text strong>下载模板文件</Text>
          </Col>
          <Col>
            <Space>
              <Form.Item
                name="downloadFormat"
                style={{ margin: 0 }}
                initialValue="tab"
              >
                <Select style={{ width: 150 }}>
                  <Option value="simple">简单格式</Option>
                  <Option value="tab">制表符格式</Option>
                  <Option value="json">JSON格式</Option>
                </Select>
              </Form.Item>
              <Button
                icon={<DownloadOutlined />}
                onClick={downloadTemplate}
              >
                下载模板
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 预览数据 */}
      {parsedWords.length > 0 && (
        <Card size="small" title={`预览数据 (显示前10条，共${parsedWords.length}条)`}>
          <Table
            columns={previewColumns}
            dataSource={previewData}
            rowKey="headWord"
            size="small"
            pagination={false}
            scroll={{ x: 800 }}
          />

          <Divider />

          {importing && (
            <div style={{ marginBottom: 16 }}>
              <Text>导入进度：</Text>
              <Progress percent={importProgress} />
            </div>
          )}

          <Space>
            <Button
              type="primary"
              icon={<ImportOutlined />}
              onClick={handleImport}
              loading={importing}
              style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
            >
              开始导入 ({parsedWords.length} 个词汇)
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </Space>
        </Card>
      )}

      {/* 错误信息 */}
      {importErrors.length > 0 && (
        <Card size="small" title={`错误信息 (${importErrors.length}条)`} style={{ marginTop: 16 }}>
          <Table
            columns={errorColumns}
            dataSource={importErrors}
            rowKey="row"
            size="small"
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
            }}
          />
        </Card>
      )}

      {/* 使用说明 */}
      <Alert
        message="导入说明"
        description={
          <div>
            <Paragraph>
              <Text strong>支持的格式：</Text>
            </Paragraph>
            <ul>
              <li><Text code>简单格式</Text>: word [phonetic] translation</li>
              <li><Text code>制表符格式</Text>: word\tphonetic\ttranslation\texample</li>
              <li><Text code>JSON格式</Text>: 每行一个JSON对象</li>
            </ul>
            <Paragraph>
              <Text strong>注意事项：</Text>
            </Paragraph>
            <ul>
              <li>文件大小限制：10MB</li>
              <li>建议分批导入，每次不超过1000个词汇</li>
              <li>重复的单词会被跳过</li>
              <li>导入失败不影响其他词汇</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </div>
  );
};