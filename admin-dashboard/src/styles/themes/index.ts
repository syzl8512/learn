import { theme } from 'antd';

// 紫色主题配置（根据项目设计规范）
export const purpleTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // 主色调
    colorPrimary: '#8B5CF6',
    colorPrimaryHover: '#7C3AED',
    colorPrimaryActive: '#6D28D9',
    colorPrimaryBg: '#F3F0FF',
    colorPrimaryBgHover: '#EDE9FE',
    colorPrimaryBorder: '#C4B5FD',
    colorPrimaryBorderHover: '#A78BFA',

    // 功能色彩
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',

    // 中性色彩
    colorTextBase: '#1F2937',
    colorTextSecondary: '#6B7280',
    colorTextTertiary: '#9CA3AF',
    colorTextQuaternary: '#D1D5DB',

    colorBgBase: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F9FAFB',
    colorBgContainer: '#FFFFFF',
    colorBgSpotlight: '#FFFFFF',

    colorBorder: '#E5E7EB',
    colorBorderSecondary: '#F3F4F6',

    // 字体
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,

    // 圆角
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // 间距
    paddingXS: 4,
    paddingSM: 8,
    padding: 16,
    paddingMD: 24,
    paddingLG: 32,
    paddingXL: 48,

    // 阴影
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      siderBg: '#FFFFFF',
      bodyBg: '#F9FAFB',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#F3F0FF',
      itemSelectedColor: '#8B5CF6',
      itemHoverBg: '#FAFAFA',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    Card: {
      borderRadius: 12,
      paddingLG: 24,
    },
    Table: {
      borderRadius: 8,
      headerBg: '#F9FAFB',
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Modal: {
      borderRadius: 12,
    },
    Form: {
      itemMarginBottom: 20,
    },
  },
};

// 暗色主题
export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...purpleTheme.token,
    colorPrimary: '#A78BFA',
    colorPrimaryHover: '#8B5CF6',
    colorPrimaryActive: '#7C3AED',

    colorTextBase: '#F9FAFB',
    colorTextSecondary: '#D1D5DB',
    colorTextTertiary: '#9CA3AF',
    colorTextQuaternary: '#6B7280',

    colorBgBase: '#111827',
    colorBgElevated: '#1F2937',
    colorBgLayout: '#111827',
    colorBgContainer: '#1F2937',
    colorBgSpotlight: '#374151',

    colorBorder: '#374151',
    colorBorderSecondary: '#4B5563',
  },
  components: {
    ...purpleTheme.components,
    Layout: {
      headerBg: '#1F2937',
      siderBg: '#1F2937',
      bodyBg: '#111827',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#374151',
      itemSelectedColor: '#A78BFA',
      itemHoverBg: '#4B5563',
    },
    Card: {
      colorBgContainer: '#1F2937',
    },
    Table: {
      headerBg: '#374151',
    },
  },
};

export { purpleTheme as lightTheme };