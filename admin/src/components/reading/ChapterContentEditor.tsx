import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Alert, Spin, message } from 'antd';
import { EditOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { Chapter } from '@types/books';
import { bookService } from '@services';
import styles from './ChapterContentEditor.module.scss';

const { Title, Paragraph } = Typography;

interface ChapterContentEditorProps {
  chapter: Chapter;
  onSave: () => void;
}

const ChapterContentEditor: React.FC<ChapterContentEditorProps> = ({ chapter, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchChapterContent();
  }, [chapter.id]);

  // 获取章节详细内容
  const fetchChapterContent = async () => {
    try {
      setLoading(true);
      const response = await bookService.getChapter(chapter.id);
      if (response.data.success && response.data.data) {
        setContent(response.data.data.content || '');
      }
    } catch (error) {
      console.error('Failed to fetch chapter content:', error);
      message.error('获取章节内容失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存内容
  const handleSave = async () => {
    try {
      setSaving(true);
      await bookService.updateChapter(chapter.id, { content });
      message.success('保存成功');
      setEditing(false);
      onSave();
    } catch (error) {
      console.error('Failed to save chapter content:', error);
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 重置内容
  const handleReset = () => {
    fetchChapterContent();
    setEditing(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p>正在加载章节内容...</p>
      </div>
    );
  }

  return (
    <div className={styles.chapterContentEditor}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Title level={4} className={styles.title}>
            {chapter.title}
          </Title>
          <div className={styles.meta}>
            <Space>
              <span>第 {chapter.order} 章</span>
              {chapter.wordCount && (
                <span>{chapter.wordCount.toLocaleString()} 字</span>
              )}
            </Space>
          </div>
        </div>
        <div className={styles.actions}>
          <Space>
            {!editing ? (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditing(true)}
                style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
              >
                编辑内容
              </Button>
            ) : (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saving}
                  style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
                >
                  保存
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  disabled={saving}
                >
                  重置
                </Button>
                <Button onClick={() => setEditing(false)} disabled={saving}>
                  取消
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>

      <Card className={styles.contentCard}>
        {editing ? (
          <div className={styles.editorContainer}>
            <textarea
              className={styles.contentEditor}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入章节内容..."
              rows={20}
            />
            <div className={styles.editorFooter}>
              <Space>
                <span>字数: {content.length}</span>
                <span>预计阅读时间: {Math.ceil(content.length / 200)} 分钟</span>
              </Space>
            </div>
          </div>
        ) : (
          <div className={styles.viewContainer}>
            {content ? (
              <div className={styles.contentViewer}>
                {content.split('\n').map((paragraph, index) => (
                  <Paragraph key={index} className={styles.paragraph}>
                    {paragraph}
                  </Paragraph>
                ))}
              </div>
            ) : (
              <Alert
                message="暂无内容"
                description="该章节暂无内容，点击编辑按钮开始添加内容。"
                type="info"
                showIcon
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChapterContentEditor;