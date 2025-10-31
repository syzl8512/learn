// 导出所有类型定义
export * from './common';
export * from './books';
export * from './listening';
export * from './dictionary';

// React组件Props类型
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// 表格组件Props
export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onRowSelect?: (selectedRows: T[], selectedRowKeys: string[]) => void;
}

// 搜索表单Props
export interface SearchFormProps extends BaseComponentProps {
  onSearch: (values: any) => void;
  onReset: () => void;
  loading?: boolean;
}

// 模态框Props
export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onOk?: () => void;
  width?: number;
  confirmLoading?: boolean;
}