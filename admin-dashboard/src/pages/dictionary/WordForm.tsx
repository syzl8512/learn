import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  Card,
  Tag,
  message,
  Tabs,
  Divider,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SoundOutlined } from '@ant-design/icons';
import { DictionaryService } from '@services/dictionary';
import { Word, WordContent } from './types';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface WordFormProps {
  word?: Word | null;
  onSave: () => void;
  onCancel: () => void;
}

export const WordForm: React.FC<WordFormProps> = ({ word, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState<any[]>([]);
  const [synonyms, setSynonyms] = useState<any[]>([]);
  const [phrases, setPhrases] = useState<any[]>([]);
  const [relatedWords, setRelatedWords] = useState<any[]>([]);
  const [examples, setExamples] = useState<any[]>([]);

  const dictionaryService = new DictionaryService();

  useEffect(() => {
    if (word) {
      form.setFieldsValue({
        headWord: word.headWord,
        wordRank: word.wordRank,
        examType: word.examType,
        usphone: word.content.word.usphone,
        ukphone: word.content.word.ukphone,
      });
      setTranslations(word.content.word.trans);
      setSynonyms(word.content.word.syno);
      setPhrases(word.content.word.phrase);
      setRelatedWords(word.content.word.relWord);
      setExamples([word.content.word.sentence]);
    } else {
      form.resetFields();
      setTranslations([]);
      setSynonyms([]);
      setPhrases([]);
      setRelatedWords([]);
      setExamples([]);
    }
  }, [word, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const wordData: Partial<Word> = {
        headWord: values.headWord,
        wordRank: values.wordRank,
        examType: values.examType,
        content: {
          word: {
            usphone: values.usphone,
            ukphone: values.ukphone,
            trans: translations,
            sentence: examples[0] || { sent: '', orig: '', trans: '' },
            syno: synonyms,
            phrase: phrases,
            relWord: relatedWords,
            exam: [values.examType],
          },
        },
      };

      if (word) {
        await dictionaryService.updateWord(word.id, wordData);
        message.success('更新成功');
      } else {
        await dictionaryService.createWord(wordData);
        message.success('添加成功');
      }

      onSave();
    } catch (error) {
      message.error(word ? '更新失败' : '添加失败');
    } finally {
      setLoading(false);
    }
  };

  const addTranslation = () => {
    setTranslations([...translations, { 'n.': [''] }]);
  };

  const updateTranslation = (index: number, key: string, value: string) => {
    const newTranslations = [...translations];
    if (!newTranslations[index]) {
      newTranslations[index] = {};
    }
    newTranslations[index][key] = value.split(',').map(v => v.trim());
    setTranslations(newTranslations);
  };

  const removeTranslation = (index: number) => {
    setTranslations(translations.filter((_, i) => i !== index));
  };

  const addExample = () => {
    setExamples([...examples, { sent: '', orig: '', trans: '' }]);
  };

  const updateExample = (index: number, field: string, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setExamples(newExamples);
  };

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const addSynonym = () => {
    setSynonyms([...synonyms, [{ pos: '', tran: '', hwds: [{ hwd: '' }] }]]);
  };

  const updateSynonym = (groupIndex: number, itemIndex: number, field: string, value: string) => {
    const newSynonyms = [...synonyms];
    newSynonyms[groupIndex][itemIndex][field] = value;
    setSynonyms(newSynonyms);
  };

  const addSynonymWord = (groupIndex: number, itemIndex: number) => {
    const newSynonyms = [...synonyms];
    newSynonyms[groupIndex][itemIndex].hwds.push({ hwd: '' });
    setSynonyms(newSynonyms);
  };

  const playPronunciation = (text: string, type: 'us' | 'uk') => {
    const audio = new Audio(
      `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=${type}`
    );
    audio.play().catch(() => {
      message.warning('发音播放失败');
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        wordRank: 1,
        examType: 'cet4',
      }}
    >
      <Tabs defaultActiveKey="basic">
        <TabPane tab="基本信息" key="basic">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="headWord"
                label="单词"
                rules={[{ required: true, message: '请输入单词' }]}
              >
                <Input placeholder="请输入单词" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="wordRank"
                label="词汇排名"
                rules={[{ required: true, message: '请输入词汇排名' }]}
              >
                <Input type="number" placeholder="1" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="examType"
                label="考试类型"
                rules={[{ required: true, message: '请选择考试类型' }]}
              >
                <Select>
                  <Option value="cet4">CET4</Option>
                  <Option value="cet6">CET6</Option>
                  <Option value="toefl">TOEFL</Option>
                  <Option value="ielts">IELTS</Option>
                  <Option value="gre">GRE</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="usphone" label="美式音标">
                <Input
                  placeholder="美式音标"
                  suffix={
                    <SoundOutlined
                      onClick={() => {
                        const word = form.getFieldValue('headWord');
                        if (word) playPronunciation(word, 'us');
                      }}
                      style={{ cursor: 'pointer', color: '#8B5CF6' }}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ukphone" label="英式音标">
                <Input
                  placeholder="英式音标"
                  suffix={
                    <SoundOutlined
                      onClick={() => {
                        const word = form.getFieldValue('headWord');
                        if (word) playPronunciation(word, 'uk');
                      }}
                      style={{ cursor: 'pointer', color: '#8B5CF6' }}
                    />
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="词义解释" key="translation">
          <Card size="small" title="词义解释">
            {translations.map((trans, index) => (
              <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <Row gutter={8} align="middle">
                  <Col span={4}>
                    <Select
                      placeholder="词性"
                      value={Object.keys(trans)[0]}
                      onChange={(value) => updateTranslation(index, value, Object.values(trans)[0]?.join(', ') || '')}
                      style={{ width: '100%' }}
                    >
                      <Option value="n.">名词</Option>
                      <Option value="v.">动词</Option>
                      <Option value="adj.">形容词</Option>
                      <Option value="adv.">副词</Option>
                      <Option value="prep.">介词</Option>
                      <Option value="conj.">连词</Option>
                      <Option value="int.">感叹词</Option>
                    </Select>
                  </Col>
                  <Col span={18}>
                    <Input
                      placeholder="中文释义，多个用逗号分隔"
                      value={Object.values(trans)[0]?.join(', ') || ''}
                      onChange={(e) => updateTranslation(index, Object.keys(trans)[0], e.target.value)}
                    />
                  </Col>
                  <Col span={2}>
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => removeTranslation(index)}
                      danger
                    />
                  </Col>
                </Row>
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={addTranslation} block>
              添加词义
            </Button>
          </Card>
        </TabPane>

        <TabPane tab="例句" key="examples">
          <Card size="small" title="例句管理">
            {examples.map((example, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <Row gutter={8}>
                  <Col span={1}>
                    <span style={{ lineHeight: '32px' }}>{index + 1}.</span>
                  </Col>
                  <Col span={22}>
                    <Input
                      placeholder="英文例句"
                      value={example.orig}
                      onChange={(e) => updateExample(index, 'orig', e.target.value)}
                      style={{ marginBottom: 8 }}
                    />
                    <Input
                      placeholder="中文翻译"
                      value={example.trans}
                      onChange={(e) => updateExample(index, 'trans', e.target.value)}
                    />
                  </Col>
                  <Col span={1}>
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => removeExample(index)}
                      danger
                      style={{ marginTop: 8 }}
                    />
                  </Col>
                </Row>
                {index < examples.length - 1 && <Divider />}
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={addExample} block>
              添加例句
            </Button>
          </Card>
        </TabPane>

        <TabPane tab="同义词" key="synonyms">
          <Card size="small" title="同义词">
            {synonyms.map((group, groupIndex) => (
              <div key={groupIndex} style={{ marginBottom: 16 }}>
                {group.map((item: any, itemIndex: number) => (
                  <Row gutter={8} key={itemIndex} style={{ marginBottom: 8 }}>
                    <Col span={4}>
                      <Select
                        placeholder="词性"
                        value={item.pos}
                        onChange={(value) => updateSynonym(groupIndex, itemIndex, 'pos', value)}
                        style={{ width: '100%' }}
                      >
                        <Option value="n.">名词</Option>
                        <Option value="v.">动词</Option>
                        <Option value="adj.">形容词</Option>
                        <Option value="adv.">副词</Option>
                      </Select>
                    </Col>
                    <Col span={8}>
                      <Input
                        placeholder="释义"
                        value={item.tran}
                        onChange={(e) => updateSynonym(groupIndex, itemIndex, 'tran', e.target.value)}
                      />
                    </Col>
                    <Col span={10}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {item.hwds?.map((hwd: any, hwdIndex: number) => (
                          <Input
                            key={hwdIndex}
                            placeholder="同义词"
                            value={hwd.hwd}
                            onChange={(e) => {
                              const newSynonyms = [...synonyms];
                              newSynonyms[groupIndex][itemIndex].hwds[hwdIndex].hwd = e.target.value;
                              setSynonyms(newSynonyms);
                            }}
                            style={{ flex: 1 }}
                          />
                        ))}
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() => addSynonymWord(groupIndex, itemIndex)}
                        />
                      </div>
                    </Col>
                    <Col span={2}>
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          const newSynonyms = [...synonyms];
                          newSynonyms[groupIndex] = newSynonyms[groupIndex].filter((_: any, i: number) => i !== itemIndex);
                          if (newSynonyms[groupIndex].length === 0) {
                            newSynonyms.splice(groupIndex, 1);
                          }
                          setSynonyms(newSynonyms);
                        }}
                        danger
                      />
                    </Col>
                  </Row>
                ))}
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={addSynonym} block>
              添加同义词组
            </Button>
          </Card>
        </TabPane>

        <TabPane tab="词组搭配" key="phrases">
          <Card size="small" title="词组搭配">
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: '#666', fontSize: '14px' }}>
                格式：{"{ 'phrase': [{ 'pContent': '词组内容', 'pCn': '中文翻译' }] }"}
              </p>
              <TextArea
                rows={6}
                placeholder="请输入词组搭配的JSON格式数据"
                onChange={(e) => {
                  try {
                    const data = JSON.parse(e.target.value);
                    setPhrases(data);
                  } catch (error) {
                    // JSON格式错误时不更新
                  }
                }}
                defaultValue={JSON.stringify(phrases, null, 2)}
              />
            </div>
          </Card>
        </TabPane>

        <TabPane tab="相关词汇" key="related">
          <Card size="small" title="相关词汇">
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: '#666', fontSize: '14px' }}>
                格式：{"{ 'related': [{ 'relWords': [{ 'desc': '描述', 'words': [{ 'hwd': '相关词' }] }] }] }"}
              </p>
              <TextArea
                rows={6}
                placeholder="请输入相关词汇的JSON格式数据"
                onChange={(e) => {
                  try {
                    const data = JSON.parse(e.target.value);
                    setRelatedWords(data);
                  } catch (error) {
                    // JSON格式错误时不更新
                  }
                }}
                defaultValue={JSON.stringify(relatedWords, null, 2)}
              />
            </div>
          </Card>
        </TabPane>
      </Tabs>

      <Divider />
      <Row justify="end">
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
          >
            {word ? '更新' : '添加'}
          </Button>
        </Space>
      </Row>
    </Form>
  );
};