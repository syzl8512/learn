import React, { useState } from 'react';
import { Card, Typography, Row, Col, Tag, Button, Space, Divider, Alert } from 'antd';
import { DiffOutlined, SwapOutlined, EyeOutlined } from '@ant-design/icons';
import type { ChapterVersion } from '@/types/books';
import styles from './VersionComparison.module.scss';

const { Title, Text, Paragraph } = Typography;

interface VersionComparisonProps {
  version1: ChapterVersion;
  version2: ChapterVersion;
}

const VersionComparison: React.FC<VersionComparisonProps> = ({ version1, version2 }) => {
  const [swapped, setSwapped] = useState(false);

  const leftVersion = swapped ? version2 : version1;
  const rightVersion = swapped ? version1 : version2;

  const handleSwap = () => {
    setSwapped(!swapped);
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = ['green', 'blue', 'orange', 'red', 'purple'];
    return colors[difficulty - 1] || 'default';
  };

  const renderContentDiff = (content1: string, content2: string) => {
    // 简单的内容对比展示，实际项目中可以使用更复杂的diff算法
    const paragraphs1 = content1.split('\n').filter(p => p.trim());
    const paragraphs2 = content2.split('\n').filter(p => p.trim());
    const maxParagraphs = Math.max(paragraphs1.length, paragraphs2.length);

    return (
      <div className={styles.contentComparison}>
        {Array.from({ length: maxParagraphs }).map((_, index) => (
          <div key={index} className={styles.paragraphComparison}>
            <div className={styles.paragraphColumn}>
              {paragraphs1[index] ? (
                <Paragraph className={styles.paragraph}>
                  {paragraphs1[index]}
                </Paragraph>
              ) : (
                <div className={styles.emptyParagraph}>无内容</div>
              )}
            </div>
            <div className={styles.paragraphColumn}>
              {paragraphs2[index] ? (
                <Paragraph className={styles.paragraph}>
                  {paragraphs2[index]}
                </Paragraph>
              ) : (
                <div className={styles.emptyParagraph}>无内容</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.versionComparison}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Title level={4}>版本对比</Title>
          <Text type="secondary">
            比较两个不同版本的章节内容和属性
          </Text>
        </div>
        <Button
          icon={<SwapOutlined />}
          onClick={handleSwap}
          className={styles.swapButton}
        >
          交换位置
        </Button>
      </div>

      <div className={styles.comparisonGrid}>
        <Row gutter={24}>
          <Col span={12}>
            <Card
              className={styles.versionCard}
              title={
                <div className={styles.versionHeader}>
                  <Text strong>版本 {leftVersion.version}</Text>
                  <Tag color={getDifficultyColor(leftVersion.difficulty)}>
                    难度 {leftVersion.difficulty}
                  </Tag>
                </div>
              }
            >
              <div className={styles.versionInfo}>
                <div className={styles.infoItem}>
                  <Text type="secondary">状态:</Text>
                  <Tag color={leftVersion.status === 'published' ? 'green' : 'orange'}>
                    {leftVersion.status === 'published' ? '已发布' : '草稿'}
                  </Tag>
                </div>
                <div className={styles.infoItem}>
                  <Text type="secondary">字数:</Text>
                  <Text>{leftVersion.wordCount.toLocaleString()}</Text>
                </div>
                <div className={styles.infoItem}>
                  <Text type="secondary">蓝斯值:</Text>
                  <Text>{leftVersion.lexileLevel ? `${leftVersion.lexileLevel}L` : '-'}</Text>
                </div>
                <div className={styles.infoItem}>
                  <Text type="secondary">创建者:</Text>
                  <Text>{leftVersion.createdBy}</Text>
                </div>
                <div className={styles.infoItem}>
                  <Text type="secondary">创建时间:</Text>
                  <Text>{new Date(leftVersion.createdAt).toLocaleString()}</Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              className={styles.versionCard}
              title={
                <div className={styles.versionHeader}>
                  <Text strong>版本 {rightVersion.version}</Text>
                  <Tag color={getDifficultyColor(rightVersion.difficulty)}>
                    难度 {rightVersion.difficulty}
                  </Tag>
                </div>
              }
            >
              <div className={styles.versionInfo}>
                <div className={styles.infoItem}>
                  <Text type="secondary">状态:</Text>
                  <Tag color={rightVersion.status === 'published' ? 'green' : 'orange'}>
                    {rightVersion.status === 'published' ? '已发布' : '草稿'}
                  </Tag>
                </div>
                <div className={styles.infoItem}>
                  <Text type="secondary">字数:</Text>
                  <Text>{rightVersion.wordCount.toLocaleString()}</Text>
                </div>
                <div className={styles.infoItem}>
                  <Text type="secondary">蓝斯值:</Text>
                  <Text>{rightVersion.lexileLevel ? `${rightVersion.lexileLevel}L` : '-'}</Text>
                </div>
                <div className={styles.infoItem}>
                  <Text type="secondary">创建者:</Text>
                  <Text>{rightVersion.createdBy}</Text>
                </div>
                <div className={styles.infoItem}>
                  <Text type="secondary">创建时间:</Text>
                  <Text>{new Date(rightVersion.createdAt).toLocaleString()}</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      <div className={styles.contentSection}>
        <Title level={5}>内容对比</Title>
        <Alert
          message="内容差异说明"
          description="下方展示两个版本的章节内容对比，左侧为版本{leftVersion.version}，右侧为版本{rightVersion.version}"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div className={styles.contentComparisonWrapper}>
          <Row gutter={16}>
            <Col span={12}>
              <div className={styles.columnHeader}>
                <Text strong>版本 {leftVersion.version}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.columnHeader}>
                <Text strong>版本 {rightVersion.version}</Text>
              </div>
            </Col>
          </Row>

          {renderContentDiff(leftVersion.content, rightVersion.content)}
        </div>
      </div>

      <div className={styles.footer}>
        <Space>
          <Button icon={<EyeOutlined />}>
            详细对比
          </Button>
          <Button>
            导出对比结果
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default VersionComparison;