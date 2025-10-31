import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space, message, Row, Col, Divider, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Vocabulary } from '@/types/dictionary';
import { dictionaryService } from '@services';
import styles from './VocabularyForm.module.scss';

const { TextArea } = Input;
const { Option } = Select;

interface VocabularyFormProps {
  vocabulary?: Vocabulary | null;
  onSave: (data: Partial<Vocabulary>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const VocabularyForm: React.FC<VocabularyFormProps> = ({
  vocabulary,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [synonymInput, setSynonymInput] = React.useState('');
  const [antonymInput, setAntonymInput] = React.useState('');

  useEffect(() => {
    if (vocabulary) {
      form.setFieldsValue(vocabulary);
    } else {
      form.resetFields();
    }
  }, [vocabulary, form]);

  const handleFinish = (values: any) => {
    const data = {
      ...values,
      synonyms: values.synonyms || [],
      antonyms: values.antonyms || [],
      tags: values.tags || [],
    };
    onSave(data);
  };

  // 智能翻译
  const handleSmartTranslate = async () => {
    const word = form.getFieldValue('word');
    if (!word) {
      message.warning('请先输入单词');
      return;
    }

    try {
      const response = await dictionaryService.translateWord(word);
      const { data } = response;

      if (data.success && data.data) {
        form.setFieldsValue({
          translation: data.data.translation,
          phonetic: data.data.phonetic,
          definition: data.data.definition,
          example: data.data.example,
        });
        message.success('智能翻译完成');
      }
    } catch (error) {
      message.error('智能翻译失败');
    }
  };

  // 智能生成例句
  const handleGenerateExample = async () => {
    const word = form.getFieldValue('word');
    if (!word) {
      message.warning('请先输入单词');
      return;
    }

    try {
      const difficulty = form.getFieldValue('difficulty') || 3;
      const response = await dictionaryService.generateExample(word, undefined, difficulty);
      const { data } = response;

      if (data.success && data.data) {
        form.setFieldsValue({
          example: data.data.example,
          exampleTranslation: data.data.translation,
        });
        message.success('例句生成完成');
      }
    } catch (error) {
      message.error('例句生成失败');
    }
  };

  // 智能补全词汇信息
  const handleEnrichWord = async () => {
    const word = form.getFieldValue('word');
    if (!word) {
      message.warning('请先输入单词');
      return;
    }

    try {
      const response = await dictionaryService.translateWord(word);
      const { data } = response;

      if (data.success && data.data) {
        form.setFieldsValue({
          phonetic: data.data.phonetic || form.getFieldValue('phonetic'),
          definition: data.data.definition || form.getFieldValue('definition'),
          translation: data.data.translation || form.getFieldValue('translation'),
          example: data.data.example || form.getFieldValue('example'),
        });
        message.success('词汇信息补全完成');
      }
    } catch (error) {
      message.error('智能补全失败');
    }
  };

  // 添加同义词
  const addSynonym = () => {
    if (!synonymInput.trim()) return;

    const synonyms = form.getFieldValue('synonyms') || [];
    if (!synonyms.includes(synonymInput.trim())) {
      form.setFieldsValue({
        synonyms: [...synonyms, synonymInput.trim()],
      });
    }
    setSynonymInput('');
  };

  // 删除同义词
  const removeSynonym = (synonym: string) => {
    const synonyms = form.getFieldValue('synonyms') || [];
    form.setFieldsValue({
      synonyms: synonyms.filter((s: string) => s !== synonym),
    });
  };

  // 添加反义词
  const addAntonym = () => {
    if (!antonymInput.trim()) return;

    const antonyms = form.getFieldValue('antonyms') || [];
    if (!antonyms.includes(antonymInput.trim())) {
      form.setFieldsValue({
        antonyms: [...antonyms, antonymInput.trim()],
      });
    }
    setAntonymInput('');
  };

  // 删除反义词
  const removeAntonym = (antonym: string) => {
    const antonyms = form.getFieldValue('antonyms') || [];
    form.setFieldsValue({
      antonyms: antonyms.filter((a: string) => a !== antonym),
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      className={styles.vocabularyForm}
    >
      <div className={styles.formSection}>
        <h3>基本信息</h3>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="word"
              label="单词"
              rules={[{ required: true, message: '请输入单词' }]}
            >
              <Input
                placeholder="请输入单词"
                addonAfter={
                  <Button
                    type="text"
                    size="small"
                    icon={<SearchOutlined />}
                    onClick={handleSmartTranslate}
                    title="智能翻译"
                  />
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phonetic"
              label="音标"
            >
              <Input placeholder="请输入音标" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="translation"
              label="中文翻译"
              rules={[{ required: true, message: '请输入中文翻译' }]}
            >
              <Input placeholder="请输入中文翻译" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="词性分类"
            >
              <Select placeholder="请选择词性分类">
                <Option value="名词">名词</Option>
                <Option value="动词">动词</Option>
                <Option value="形容词">形容词</Option>
                <Option value="副词">副词</Option>
                <Option value="代词">代词</Option>
                <Option value="介词">介词</Option>
                <Option value="连词">连词</Option>
                <Option value="感叹词">感叹词</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="definition"
          label="英文释义"
        >
          <TextArea
            rows={3}
            placeholder="请输入英文释义"
          />
        </Form.Item>
      </div>

      <Divider />

      <div className={styles.formSection}>
        <h3>例句信息</h3>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="example"
              label="英文例句"
            >
              <TextArea
                rows={2}
                placeholder="请输入英文例句"
                addonAfter={
                  <Button
                    type="text"
                    size="small"
                    icon={<SearchOutlined />}
                    onClick={handleGenerateExample}
                    title="智能生成例句"
                  />
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="exampleTranslation"
              label="例句翻译"
            >
              <TextArea
                rows={2}
                placeholder="请输入例句中文翻译"
              />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <Divider />

      <div className={styles.formSection}>
        <h3>相关词汇</h3>

        <Form.Item label="同义词" name="synonyms">
          <div className={styles.tagContainer}>
            <div className={styles.tagList}>
              {form.getFieldValue('synonyms')?.map((synonym: string) => (
                <Tag
                  key={synonym}
                  closable
                  onClose={() => removeSynonym(synonym)}
                  color="blue"
                >
                  {synonym}
                </Tag>
              ))}
            </div>
            <div className={styles.tagInput}>
              <Input
                placeholder="输入同义词"
                value={synonymInput}
                onChange={(e) => setSynonymInput(e.target.value)}
                onPressEnter={addSynonym}
                addonAfter={
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={addSynonym}
                  />
                }
              />
            </div>
          </div>
        </Form.Item>

        <Form.Item label="反义词" name="antonyms">
          <div className={styles.tagContainer}>
            <div className={styles.tagList}>
              {form.getFieldValue('antonyms')?.map((antonym: string) => (
                <Tag
                  key={antonym}
                  closable
                  onClose={() => removeAntonym(antonym)}
                  color="red"
                >
                  {antonym}
                </Tag>
              ))}
            </div>
            <div className={styles.tagInput}>
              <Input
                placeholder="输入反义词"
                value={antonymInput}
                onChange={(e) => setAntonymInput(e.target.value)}
                onPressEnter={addAntonym}
                addonAfter={
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={addAntonym}
                  />
                }
              />
            </div>
          </div>
        </Form.Item>
      </div>

      <Divider />

      <div className={styles.formSection}>
        <h3>分类和标签</h3>
        <Row gutter={16}>
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
          <Col span={12}>
            <Form.Item
              name="frequency"
              label="使用频率"
            >
              <Select placeholder="请选择使用频率">
                <Option value={1}>很少使用</Option>
                <Option value={2}>偶尔使用</Option>
                <Option value={3}>经常使用</Option>
                <Option value={4}>频繁使用</Option>
                <Option value={5}>非常常用</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="tags"
          label="标签"
        >
          <Select
            mode="tags"
            placeholder="请输入或选择标签"
            style={{ width: '100%' }}
            tokenSeparators={[',']}
          >
            <Option value="基础词汇">基础词汇</Option>
            <Option value="常用词汇">常用词汇</Option>
            <Option value="考试词汇">考试词汇</Option>
            <Option value="商务英语">商务英语</Option>
            <Option value="学术英语">学术英语</Option>
            <Option value="日常对话">日常对话</Option>
          </Select>
        </Form.Item>
      </div>

      <div className={styles.formActions}>
        <Space>
          <Button onClick={handleEnrichWord} loading={loading}>
            智能补全
          </Button>
          <Button onClick={onCancel}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default VocabularyForm;