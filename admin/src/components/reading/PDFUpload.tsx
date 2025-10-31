import React, { useState, useCallback } from 'react';
import { Upload, Button, Progress, Alert, Typography, Space, Form, Input, Select, message } from 'antd';
import { InboxOutlined, UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { bookService } from '@services';
import type { Book, PdfUploadResponse } from '@/types/books';
import styles from './PDFUpload.module.scss';

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Option } = Select;

interface PDFUploadProps {
  onSuccess: (book: Book) => void;
  onCancel: () => void;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ onSuccess, onCancel }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [form] = Form.useForm();

  // 文件上传前验证
  const beforeUpload = (file: File) => {
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      message.error('只能上传PDF格式的文件!');
      return false;
    }

    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error('文件大小不能超过100MB!');
      return false;
    }

    setUploadedFile(file);
    // 自动填充文件名作为标题
    form.setFieldsValue({
      title: file.name.replace('.pdf', ''),
    });
    return false; // 阻止自动上传
  };

  // 上传书籍（一步完成）
  const handleUploadBook = async (values: any) => {
    if (!uploadedFile) {
      message.error('请先选择PDF文件');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const bookData = {
        title: values.title,
        author: values.author,
        category: values.category,
        difficulty: values.difficulty,
        description: values.description,
      };

      const response = await bookService.uploadPdf(
        uploadedFile,
        bookData,
        (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
          setUploadProgress(progress);
        }
      );

      if (response.data.success || response.data) {
        message.success('书籍上传成功，正在后台处理PDF内容...');
        onSuccess(response.data.data || response.data);
      } else {
        throw new Error(response.data.message || '上传失败');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      message.error(error.message || '书籍上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 重置上传
  const handleReset = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    form.resetFields();
  };

  return (
    <div className={styles.pdfUpload}>
      <div className={styles.uploadSection}>
        <Title level={4}>上传PDF文件</Title>
        <Text type="secondary">支持PDF格式，文件大小不超过100MB</Text>

        <Dragger
          name="file"
          accept=".pdf"
          beforeUpload={beforeUpload}
          showUploadList={false}
          disabled={uploading}
          className={styles.uploader}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个PDF文件上传，文件大小不超过100MB
          </p>
        </Dragger>

        {uploadedFile && (
          <div className={styles.fileInfo}>
            <Space>
              <FileTextOutlined style={{ color: '#8B5CF6' }} />
              <Text strong>{uploadedFile.name}</Text>
              <Text type="secondary">
                ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Text>
            </Space>
          </div>
        )}

        {uploading && (
          <div className={styles.progressSection}>
            <Progress
              percent={uploadProgress}
              status="active"
              strokeColor="#8B5CF6"
            />
            <Text type="secondary">正在上传文件...</Text>
          </div>
        )}
      </div>

      {uploadedFile && !uploading && (
        <div className={styles.bookFormSection}>
          <Title level={4}>书籍信息</Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUploadBook}
            initialValues={{
              category: '其他',
              difficulty: 3,
            }}
          >
            <Form.Item
              name="title"
              label="书籍标题"
              rules={[{ required: true, message: '请输入书籍标题' }]}
            >
              <Input placeholder="请输入书籍标题" />
            </Form.Item>

            <Form.Item
              name="author"
              label="作者"
              rules={[{ required: true, message: '请输入作者' }]}
            >
              <Input placeholder="请输入作者" />
            </Form.Item>

            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类">
                <Option value="故事">故事</Option>
                <Option value="科普">科普</Option>
                <Option value="历史">历史</Option>
                <Option value="文学">文学</Option>
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
              name="description"
              label="描述"
            >
              <Input.TextArea
                rows={4}
                placeholder="请输入书籍描述"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={uploading}
                  icon={<UploadOutlined />}
                  style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
                >
                  {uploading ? '上传中...' : '上传书籍'}
                </Button>
                <Button onClick={handleReset} disabled={uploading}>
                  重新选择
                </Button>
                <Button onClick={onCancel} disabled={uploading}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
};

export default PDFUpload;