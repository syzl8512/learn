import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, Typography } from 'antd';
import type { Chapter } from '@/types/books';
import styles from './ChapterForm.module.scss';

const { Title } = Typography;
const { TextArea } = Input;

interface ChapterFormProps {
  chapter?: Chapter | null;
  onSave: (values: any) => void;
  onCancel: () => void;
}

const ChapterForm: React.FC<ChapterFormProps> = ({ chapter, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);

  useEffect(() => {
    if (chapter) {
      form.setFieldsValue({
        title: chapter.title,
        order: chapter.order,
        content: chapter.content,
        status: chapter.status,
      });
    } else {
      form.resetFields();
    }
  }, [chapter, form]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      await onSave(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.chapterForm}>
      <Title level={5} className={styles.formTitle}>
        {chapter ? '编辑章节' : '新建章节'}
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          order: 1,
          status: 'draft',
        }}
      >
        <Form.Item
          name="title"
          label="章节标题"
          rules={[
            { required: true, message: '请输入章节标题' },
            { max: 100, message: '标题不能超过100个字符' }
          ]}
        >
          <Input
            placeholder="请输入章节标题"
            showCount
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="order"
          label="章节顺序"
          rules={[{ required: true, message: '请输入章节顺序' }]}
        >
          <InputNumber
            placeholder="请输入章节顺序"
            min={1}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="content"
          label="章节内容"
          rules={[
            { max: 10000, message: '内容不能超过10000个字符' }
          ]}
        >
          <TextArea
            placeholder="请输入章节内容（可选）"
            rows={8}
            showCount
            maxLength={10000}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="发布状态"
        >
          <Input value="draft" style={{ display: 'none' }} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
            >
              {submitting ? '保存中...' : '保存'}
            </Button>
            <Button onClick={onCancel} disabled={submitting}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChapterForm;