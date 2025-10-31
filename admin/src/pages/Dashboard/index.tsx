import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { BookOutlined, SoundOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import styles from './Dashboard.module.scss';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <Title level={2}>仪表板</Title>
      </div>

      <Row gutter={[24, 24]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="总书籍数"
              value={1234}
              prefix={<BookOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#8B5CF6' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="听力材料"
              value={567}
              prefix={<SoundOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#10B981' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="词汇条目"
              value={8901}
              prefix={<FileTextOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#F59E0B' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="活跃用户"
              value={456}
              prefix={<UserOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#3B82F6' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="欢迎使用智慧儿童英文辅助阅读平台管理后台" className={styles.welcomeCard}>
            <p>这是一个基于 React 18 + TypeScript + Vite + Ant Design 构建的现代化管理后台系统。</p>
            <p>主要功能包括：</p>
            <ul>
              <li>阅读书籍管理</li>
              <li>听力材料管理</li>
              <li>词典管理</li>
              <li>用户管理</li>
              <li>系统设置</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;