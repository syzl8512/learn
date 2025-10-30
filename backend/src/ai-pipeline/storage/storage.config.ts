/**
 * 存储服务配置
 */
export interface StorageConfig {
  // 群晖 NAS 配置
  synologyUrl: string;
  synologyUsername: string;
  synologyPassword: string;
  synologyStoragePath: string;

  // 本地存储配置 (备选)
  localStoragePath: string;
  localBaseUrl: string;
}

/**
 * 从环境变量获取存储配置
 */
export function getStorageConfig(): StorageConfig {
  return {
    synologyUrl: process.env.SYNOLOGY_URL || '',
    synologyUsername: process.env.SYNOLOGY_USERNAME || '',
    synologyPassword: process.env.SYNOLOGY_PASSWORD || '',
    synologyStoragePath: process.env.SYNOLOGY_STORAGE_PATH || '/volume1/books/',

    localStoragePath: process.env.LOCAL_STORAGE_PATH || './uploads',
    localBaseUrl: process.env.LOCAL_BASE_URL || 'http://localhost:3000',
  };
}

/**
 * 存储类型
 */
export enum StorageType {
  SYNOLOGY = 'synology', // 群晖 NAS
  LOCAL = 'local', // 本地存储
  OSS = 'oss', // 阿里云 OSS (Phase 2)
}
