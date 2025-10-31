import React, { useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, Space, Divider, Typography, Upload, message } from 'antd';
import { PlusOutlined, MinusOutlined, UploadOutlined, BookOutlined } from '@ant-design/icons';
import { Book } from '@types/books';
import styles from './BookForm.module.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface BookFormProps {
  book?: Book | null;
  onSave: (values: any) => void;
  onCancel: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ book, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);

  useEffect(() => {
    if (book) {
      form.setFieldsValue({
        title: book.title,
        author: book.author,
        category: book.category,
        difficulty: book.difficulty,
        lexileLevel: book.lexileLevel,
        description: book.description,
        status: book.status,
        estimatedReadingTime: book.estimatedReadingTime,
      });
    }
  }, [book, form]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      await onSave(values);
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyOptions = [
    { value: 1, label: '难度 1 (入门)', description: '适合初学者，基础词汇和简单句型' },
    { value: 2, label: '难度 2 (初级)', description: '基础词汇量，简单句型和复合句' },
    { value: 3, label: '难度 3 (中级)', description: '中等词汇量，复杂句型和语法结构' },
    { value: 4, label: '难度 4 (高级)', description: '丰富词汇量，复杂语法和表达方式' },
    { value: 5, label: '难度 5 (专家)', description: '专业词汇，高级语法和文学表达' },
  ];

  const categoryOptions = [
    { value: '故事', label: '故事', color: '#ff4d4f' },
    { value: '科普', label: '科普', color: '#52c41a' },
    { value: '历史', label: '历史', color: '#1890ff' },
    { value: '文学', label: '文学', color: '#722ed1' },
    { value: '传记', label: '传记', color: '#fa8c16' },
    { value: '哲学', label: '哲学', color: '#13c2c2' },
    { value: '艺术', label: '艺术', color: '#eb2f96' },
    { value: '其他', label: '其他', color: '#666666' },
  ];

  return (
    <div className={styles.bookForm}>
      <div className={styles.formHeader}>
        <BookOutlined className={styles.headerIcon} />
        <div>
          <Title level={4} className={styles.headerTitle}>
            {book ? '编辑书籍信息' : '创建新书籍'}
          </Title>
          <Text type="secondary">
            {book ? '修改书籍的基本信息和属性' : '填写书籍的基本信息以创建新书籍'}
          </Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.form}
      >
        <div className={styles.formSection}>
          <Title level={5} className={styles.sectionTitle}>基本信息</Title>

          <Form.Item
            name="title"
            label="书籍标题"
            rules={[
              { required: true, message: '请输入书籍标题' },
              { max: 100, message: '标题不能超过100个字符' }
            ]}
          >
            <Input
              placeholder="请输入书籍标题"
              size="large"
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            name="author"
            label="作者"
            rules={[
              { required: true, message: '请输入作者' },
              { max: 50, message: '作者名不能超过50个字符' }
            ]}
          >
            <Input
              placeholder="请输入作者"
              size="large"
              showCount
              maxLength={50}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="书籍描述"
            rules={[
              { max: 500, message: '描述不能超过500个字符' }
            ]}
          >
            <TextArea
              placeholder="请输入书籍的简短描述，介绍书籍内容和特点"
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </div>

        <Divider />

        <div className={styles.formSection}>
          <Title level={5} className={styles.sectionTitle}>分类设置</Title>

          <Form.Item
            name="category"
            label="书籍分类"
            rules={[{ required: true, message: '请选择书籍分类' }]}
          >
            <Select
              placeholder="请选择书籍分类"
              size="large"
              optionLabelProp="label"
            >
              {categoryOptions.map(option => (
                <Option key={option.value} value={option.value} label={option.label}>
                  <Space>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        backgroundColor: option.color,
                        borderRadius: '50%',
                      }}
                    />
                    {option.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Divider />

        <div className={styles.formSection}>
          <Title level={5} className={styles.sectionTitle}>难度设置</Title>

          <Form.Item
            name="difficulty"
            label="难度等级"
            rules={[{ required: true, message: '请选择难度等级' }]}
          >
            <Select
              placeholder="请选择难度等级"
              size="large"
              optionLabelProp="label"
            >
              {difficultyOptions.map(option => (
                <Option key={option.value} value={option.value} label={option.label}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{option.label}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {option.description}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="lexileLevel"
            label="蓝斯值 (Lexile)"
            extra="蓝斯值是衡量阅读难度的指标，范围通常为 BR-2000L"
          >
            <InputNumber
              placeholder="请输入蓝斯值 (可选)"
              size="large"
              style={{ width: '100%' }}
              min={0}
              max={2000}
              formatter={value => `${value}L`}
              parser={value => value!.replace('L', '')}
            />
          </Form.Item>

          <Form.Item
            name="estimatedReadingTime"
            label="预计阅读时长 (分钟)"
            extra="基于普通阅读速度的预计阅读时间"
          >
            <InputNumber
              placeholder="请输入预计阅读时间 (可选)"
              size="large"
              style={{ width: '100%' }}
              min={1}
              max={9999}
              formatter={value => `${value} 分钟`}
              parser={value => value!.replace(' 分钟', '')}
            />
          </Form.Item>
        </div>

        {book && (
          <>
            <Divider />
            <div className={styles.formSection}>
              <Title level={5} className={styles.sectionTitle}>状态设置</Title>

              <Form.Item
                name="status"
                label="发布状态"
              >
                <Select size="large">
                  <Option value="draft">草稿</Option>
                  <Option value="published">已发布</Option>
                  <Option value="archived">已归档</Option>
                </Select>
              </Form.Item>
            </div>
          </>
        )}

        <Divider />

        <div className={styles.formActions}>
          <Space size="large">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              size="large"
              className={styles.submitButton}
            >
              {submitting ? '保存中...' : (book ? '更新书籍' : '创建书籍')}
            </Button>
            <Button
              size="large"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              取消
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default BookForm;