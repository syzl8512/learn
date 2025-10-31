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
  const [uploadResult, setUploadResult] = useState<PdfUploadResponse | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [form] = Form.useForm();

  // 文件上传前验证
  const beforeUpload = (file: File) => {
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      message.error('只能上传PDF格式的文件!');
      return false;
    }

    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error('文件大小不能超过50MB!');
      return false;
    }

    setUploadedFile(file);
    setUploadResult(null);
    return false; // 阻止自动上传
  };

  // 手动上传文件
  const handleUpload = async () => {
    if (!uploadedFile) {
      message.error('请先选择文件');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await bookService.uploadPdf(uploadedFile, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      if (response.data.success) {
        setUploadResult(response.data.data);
        message.success('文件上传成功!');
      } else {
        throw new Error(response.data.message || '上传失败');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('文件上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 创建书籍
  const handleCreateBook = async (values: any) => {
    if (!uploadResult) {
      message.error('请先上传文件');
      return;
    }

    try {
      setExtracting(true);

      const bookData = {
        title: values.title || uploadedFile?.name.replace('.pdf', ''),
        author: values.author || '未知作者',
        category: values.category || '其他',
        difficulty: values.difficulty || 3,
        description: values.description,
        pdfUrl: uploadResult.fileUrl,
        status: 'processing' as const,
      };

      const response = await bookService.createBook(bookData);

      if (response.data.success) {
        message.success('书籍创建成功，正在处理PDF内容...');
        onSuccess(response.data.data);
      } else {
        throw new Error(response.data.message || '创建失败');
      }
    } catch (error) {
      console.error('Create book failed:', error);
      message.error('创建书籍失败，请重试');
    } finally {
      setExtracting(false);
    }
  };

  // 重置上传
  const handleReset = () => {
    setUploadedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    form.resetFields();
  };

  return (
    <div className={styles.pdfUpload}>
      <div className={styles.uploadSection}>
        <Title level={4}>上传PDF文件</Title>
        <Text type="secondary">支持PDF格式，文件大小不超过50MB</Text>

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
            支持单个PDF文件上传，文件大小不超过50MB
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

        {uploadResult && (
          <Alert
            message="文件上传成功"
            description={`文件已成功上传到服务器，正在准备提取内容`}
            type="success"
            showIcon
            className={styles.successAlert}
          />
        )}

        <div className={styles.uploadActions}>
          <Space>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleUpload}
              disabled={!uploadedFile || uploading}
              loading={uploading}
              style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
            >
              {uploading ? '上传中...' : '开始上传'}
            </Button>
            <Button onClick={handleReset} disabled={uploading}>
              重新选择
            </Button>
          </Space>
        </div>
      </div>

      {uploadResult && (
        <div className={styles.bookFormSection}>
          <Title level={4}>书籍信息</Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateBook}
            initialValues={{
              title: uploadedFile?.name.replace('.pdf', ''),
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
                  loading={extracting}
                  style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
                >
                  {extracting ? '处理中...' : '创建书籍'}
                </Button>
                <Button onClick={onCancel}>
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