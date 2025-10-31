import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.scss';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 检查是否已登录
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // 处理登录提交
  const handleSubmit = async (values: LoginForm): Promise<void> => {
    setLoading(true);
    try {
      // 简化的登录逻辑 - 支持演示账号
      if (values.username === 'admin' && values.password === 'admin123') {
        const mockUser = {
          id: 1,
          username: 'admin',
          email: 'admin@reading-app.com',
          role: 'admin'
        };

        // 保存到localStorage
        localStorage.setItem('admin_token', 'demo-token-' + Date.now());
        localStorage.setItem('admin_user', JSON.stringify(mockUser));

        message.success('登录成功！');
        navigate('/dashboard', { replace: true });
      } else {
        message.error('用户名或密码错误');
      }
    } catch (error) {
      console.error('Login failed:', error);
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单验证失败
  const handleSubmitFailed = (errorInfo: any): void => {
    console.log('Form validation failed:', errorInfo);
    message.error('请检查输入信息');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <Card className={styles.loginCard} variant="filled">
          <div className={styles.loginHeader}>
            <div className={styles.logo}>
              <BookOutlined style={{ fontSize: '48px', color: '#8B5CF6' }} />
            </div>
            <Title level={2} className={styles.title}>
              智慧阅读管理后台
            </Title>
            <Text type="secondary" className={styles.subtitle}>
              智能儿童英文阅读平台管理
            </Text>
          </div>

          <Form
            name="login"
            size="large"
            onFinish={handleSubmit}
            onFinishFailed={handleSubmitFailed}
            className={styles.loginForm}
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.loginButton}
                loading={loading}
                block
                style={{
                  background: '#8B5CF6',
                  borderColor: '#8B5CF6',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666'
          }}>
            <Text strong>测试账号：</Text><br />
            用户名：admin<br />
            密码：admin123
          </div>

          <div className={styles.loginFooter}>
            <Space direction="vertical" size="small" align="center">
              <Text type="secondary" className={styles.footerText}>
                © 2025 智慧儿童英文辅助阅读平台
              </Text>
              <Text type="secondary" className={styles.footerText}>
                版本 1.0.0 | 内部使用
              </Text>
            </Space>
          </div>
        </Card>
      </div>

      <div className={styles.backgroundDecoration}>
        <div className={styles.decorationShape1} />
        <div className={styles.decorationShape2} />
        <div className={styles.decorationShape3} />
      </div>
    </div>
  );
};

export default Login;