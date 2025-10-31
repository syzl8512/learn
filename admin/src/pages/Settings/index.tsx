import React, { useEffect } from 'react';
import { Card, Typography, Form, Input, Button, Switch, Divider, Space, message } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { useApp } from '@contexts/AppContext';
import { useTheme } from '@contexts/ThemeContext';
import styles from './Settings.module.scss';

const { Title, Paragraph } = Typography;

const Settings: React.FC = () => {
  const { setPageTitle, setPageDescription } = useApp();
  const { state: themeState, toggleTheme } = useTheme();
  const [form] = Form.useForm();

  useEffect(() => {
    setPageTitle('系统设置');
    setPageDescription('配置系统参数和个人偏好');
  }, [setPageTitle, setPageDescription]);

  // 保存设置
  const handleSaveSettings = (values: any) => {
    console.log('Saving settings:', values);
    message.success('设置已保存');
  };

  // 重置设置
  const handleResetSettings = () => {
    form.resetFields();
    message.info('设置已重置');
  };

  return (
    <div className={styles.settings}>
      <div className={styles.pageHeader}>
        <Title level={2}>系统设置</Title>
        <Paragraph type="secondary">
          配置系统参数、个人偏好和管理选项
        </Paragraph>
      </div>

      <div className={styles.settingsContainer}>
        <Card title="基本设置" className={styles.settingsCard}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveSettings}
            initialValues={{
              siteName: '智慧儿童英文辅助阅读平台',
              adminEmail: 'admin@example.com',
              maxFileSize: 10,
              sessionTimeout: 30,
            }}
          >
            <Form.Item
              name="siteName"
              label="网站名称"
              rules={[{ required: true, message: '请输入网站名称' }]}
            >
              <Input placeholder="请输入网站名称" />
            </Form.Item>

            <Form.Item
              name="adminEmail"
              label="管理员邮箱"
              rules={[
                { required: true, message: '请输入管理员邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input placeholder="请输入管理员邮箱" />
            </Form.Item>

            <Form.Item
              name="maxFileSize"
              label="最大文件上传大小 (MB)"
              rules={[{ required: true, message: '请输入最大文件大小' }]}
            >
              <Input type="number" placeholder="请输入最大文件大小" />
            </Form.Item>

            <Form.Item
              name="sessionTimeout"
              label="会话超时时间 (分钟)"
              rules={[{ required: true, message: '请输入会话超时时间' }]}
            >
              <Input type="number" placeholder="请输入会话超时时间" />
            </Form.Item>
          </Form>
        </Card>

        <Card title="界面设置" className={styles.settingsCard}>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>主题模式</div>
              <div className={styles.settingDescription}>
                当前: {themeState.effectiveTheme === 'light' ? '浅色模式' : '深色模式'}
              </div>
            </div>
            <Switch
              checked={themeState.effectiveTheme === 'dark'}
              onChange={toggleTheme}
            />
          </div>

          <Divider />

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>自动保存</div>
              <div className={styles.settingDescription}>
                自动保存用户操作和表单数据
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <Divider />

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>系统通知</div>
              <div className={styles.settingDescription}>
                接收系统重要通知和更新
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </Card>

        <Card title="API设置" className={styles.settingsCard}>
          <Form layout="vertical">
            <Form.Item
              name="deepseekApiKey"
              label="DeepSeek API Key"
            >
              <Input.Password placeholder="请输入DeepSeek API Key" />
            </Form.Item>

            <Form.Item
              name="mineruApiKey"
              label="MinerU API Key"
            >
              <Input.Password placeholder="请输入MinerU API Key" />
            </Form.Item>

            <Form.Item
              name="ttsApiKey"
              label="TTS API Key"
            >
              <Input.Password placeholder="请输入TTS API Key" />
            </Form.Item>
          </Form>
        </Card>

        <div className={styles.actionBar}>
          <Space size="middle">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
            >
              保存设置
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetSettings}
            >
              重置设置
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default Settings;