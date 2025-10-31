import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Select,
  Space,
  Spin,
  Alert,
  Divider,
  Tag,
  List,
  Typography,
  Row,
  Col,
  message,
  Switch,
} from 'antd';
import {
  TranslationOutlined,
  SwapOutlined,
  SoundOutlined,
  CopyOutlined,
  StarOutlined,
  BookOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { DictionaryService } from '../services/dictionary';
import { TranslationRequest, TranslationResult } from './types';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

export const TranslationTool: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState<'en' | 'zh'>('en');
  const [targetLang, setTargetLang] = useState<'zh' | 'en'>('zh');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [smartMode, setSmartMode] = useState(true);
  const [showExamples, setShowExamples] = useState(true);
  const [showDefinitions, setShowDefinitions] = useState(true);

  const dictionaryService = new DictionaryService();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      message.warning('请输入要翻译的文本');
      return;
    }

    try {
      setLoading(true);
      const request: TranslationRequest = {
        text: sourceText,
        sourceLang,
        targetLang,
      };

      const translationResult = await dictionaryService.translate(request);
      setResult(translationResult);
      setTranslatedText(translationResult.translatedText);
    } catch (error) {
      message.error('翻译失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguage = () => {
    const newSourceLang = targetLang;
    const newTargetLang = sourceLang;
    setSourceLang(newSourceLang);
    setTargetLang(newTargetLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    setResult(null);
  };

  const handlePlayPronunciation = (text: string, lang: 'en' | 'zh') => {
    const audio = new Audio(
      `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=${lang === 'en' ? '1' : '2'}`
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

  const handleAddToDictionary = async () => {
    if (!result || !sourceText.trim()) return;

    try {
      const wordData = {
        headWord: sourceText.trim(),
        wordRank: 9999,
        examType: 'custom',
        content: {
          word: {
            usphone: result.pronunciation || '',
            ukphone: result.pronunciation || '',
            trans: { 'n.': [result.translatedText] },
            sentence: { sent: '', orig: sourceText, trans: result.translatedText },
            syno: {},
            phrase: {},
            relWord: {},
            exam: ['custom'],
          },
        },
      };

      await dictionaryService.createWord(wordData);
      message.success('已添加到词典');
    } catch (error) {
      message.error('添加到词典失败');
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* 智能模式开关 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <BulbOutlined style={{ color: '#8B5CF6' }} />
              <Text strong>智能翻译模式</Text>
              <Switch
                checked={smartMode}
                onChange={setSmartMode}
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                提供词典释义、例句等详细翻译内容
              </Text>
            </Space>
          </Col>
          {smartMode && (
            <Col>
              <Space>
                <Text type="secondary">显示例句</Text>
                <Switch
                  checked={showExamples}
                  onChange={setShowExamples}
                  size="small"
                />
                <Text type="secondary">显示释义</Text>
                <Switch
                  checked={showDefinitions}
                  onChange={setShowDefinitions}
                  size="small"
                />
              </Space>
            </Col>
          )}
        </Row>
      </Card>

      {/* 翻译输入区 */}
      <Card title="文本翻译" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={11}>
            <div style={{ marginBottom: 8 }}>
              <Space>
                <Select
                  value={sourceLang}
                  onChange={setSourceLang}
                  style={{ width: 100 }}
                >
                  <Option value="en">英语</Option>
                  <Option value="zh">中文</Option>
                </Select>
                <Button
                  icon={<SwapOutlined />}
                  onClick={handleSwapLanguage}
                  style={{ color: '#8B5CF6' }}
                />
              </Space>
            </div>
            <TextArea
              rows={6}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={sourceLang === 'en' ? '请输入英文文本' : '请输入中文文本'}
            />
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Space>
                <Text type="secondary">{sourceText.length} 字符</Text>
                {sourceText && (
                  <Button
                    size="small"
                    icon={<SoundOutlined />}
                    onClick={() => handlePlayPronunciation(sourceText, sourceLang)}
                  />
                )}
              </Space>
            </div>
          </Col>
          <Col span={2} style={{ textAlign: 'center', paddingTop: 40 }}>
            <Button
              type="primary"
              icon={<TranslationOutlined />}
              onClick={handleTranslate}
              loading={loading}
              style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
            >
              翻译
            </Button>
          </Col>
          <Col span={11}>
            <div style={{ marginBottom: 8 }}>
              <Select
                value={targetLang}
                onChange={setTargetLang}
                style={{ width: 100 }}
              >
                <Option value="zh">中文</Option>
                <Option value="en">英语</Option>
              </Select>
            </div>
            <div style={{
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              padding: 8,
              minHeight: 144,
              backgroundColor: '#fafafa'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>翻译中...</div>
                </div>
              ) : (
                <div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {translatedText || <Text type="secondary">翻译结果将显示在这里</Text>}
                  </div>
                  {translatedText && (
                    <div style={{ marginTop: 8, textAlign: 'right' }}>
                      <Space>
                        <Button
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => handleCopy(translatedText)}
                        >
                          复制
                        </Button>
                        <Button
                          size="small"
                          icon={<SoundOutlined />}
                          onClick={() => handlePlayPronunciation(translatedText, targetLang)}
                        />
                      </Space>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* 智能翻译结果 */}
      {smartMode && result && (
        <Card title="详细翻译结果" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            {/* 发音和基本释义 */}
            <Col span={12}>
              <Card size="small" title="基础信息">
                {result.pronunciation && (
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>发音：</Text>
                    <Text code>{result.pronunciation}</Text>
                    <Button
                      size="small"
                      icon={<SoundOutlined />}
                      style={{ marginLeft: 8 }}
                      onClick={() => handlePlayPronunciation(result.originalText, 'en')}
                    />
                  </div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <Button
                      type="primary"
                      ghost
                      size="small"
                      icon={<BookOutlined />}
                      onClick={handleAddToDictionary}
                    >
                      添加到词典
                    </Button>
                    <Button
                      size="small"
                      icon={<StarOutlined />}
                    >
                      收藏
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>

            {/* 词典释义 */}
            {showDefinitions && result.definitions && result.definitions.length > 0 && (
              <Col span={12}>
                <Card size="small" title="词典释义">
                  <List
                    size="small"
                    dataSource={result.definitions}
                    renderItem={(def, index) => (
                      <List.Item>
                        <Space>
                          <Tag color="purple">{index + 1}</Tag>
                          <Text>{def}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            )}
          </Row>

          {/* 例句 */}
          {showExamples && result.examples && result.examples.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Title level={5}>例句</Title>
              <List
                dataSource={result.examples}
                renderItem={(example, index) => (
                  <Card size="small" style={{ marginBottom: 8 }}>
                    <div>
                      <Text>{example}</Text>
                      <div style={{ marginTop: 4, textAlign: 'right' }}>
                        <Button
                          size="small"
                          icon={<SoundOutlined />}
                          onClick={() => handlePlayPronunciation(example, 'en')}
                        />
                      </div>
                    </div>
                  </Card>
                )}
              />
            </div>
          )}

          {/* 翻译详情 */}
          <Divider />
          <Row>
            <Col span={6}>
              <Text type="secondary">源语言：</Text>
              <Tag>{result.sourceLang === 'en' ? '英语' : '中文'}</Tag>
            </Col>
            <Col span={6}>
              <Text type="secondary">目标语言：</Text>
              <Tag>{result.targetLang === 'zh' ? '中文' : '英语'}</Tag>
            </Col>
            <Col span={6}>
              <Text type="secondary">翻译时间：</Text>
              <Text>{new Date().toLocaleString()}</Text>
            </Col>
            <Col span={6}>
              <Text type="secondary">字符数：</Text>
              <Text>{result.originalText.length} → {result.translatedText.length}</Text>
            </Col>
          </Row>
        </Card>
      )}

      {/* 使用提示 */}
      <Card size="small" title="使用提示">
        <Alert
          message="翻译功能说明"
          description={
            <div>
              <p>• 支持中英文互译，提供智能翻译和基础翻译两种模式</p>
              <p>• 智能模式下会提供词典释义、例句等详细内容</p>
              <p>• 可以将翻译结果添加到词典库中供后续管理</p>
              <p>• 支持语音播放功能，帮助学习正确发音</p>
              <p>• 翻译结果可以一键复制到剪贴板</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};