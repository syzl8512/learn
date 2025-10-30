import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SynologyService } from './synology/synology.service';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface StorageResult {
  success: boolean;
  localPath?: string;
  remoteUrl?: string;
  cacheUrl?: string;
  error?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly localCacheDir: string;
  private readonly storageType: string;

  constructor(
    private configService: ConfigService,
    private synologyService: SynologyService,
  ) {
    this.localCacheDir = this.configService.get<string>('LOCAL_CACHE_DIR', './storage/cache');
    this.storageType = this.configService.get<string>('STORAGE_TYPE', 'synology');
  }

  /**
   * 存储音频文件
   */
  async storeAudioFile(
    fileName: string,
    fileBuffer: Buffer,
    options: {
      immediate?: boolean; // 是否立即上传到群晖
      cache?: boolean; // 是否本地缓存
    } = {},
  ): Promise<StorageResult> {
    const result: StorageResult = { success: false };

    try {
      // 1. 本地缓存（快速响应）
      if (options.cache !== false) {
        const localPath = path.join(this.localCacheDir, 'audio', fileName);
        await fs.mkdir(path.dirname(localPath), { recursive: true });
        await fs.writeFile(localPath, fileBuffer);
        result.localPath = localPath;
        result.cacheUrl = `/api/storage/cache/audio/${fileName}`;
      }

      // 2. 上传到群晖
      if (options.immediate) {
        try {
          const remotePath = `audio/${fileName}`;
          const uploadResult = await this.synologyService.uploadFile(
            remotePath,
            fileBuffer,
            'audio/mpeg',
          );

          if (uploadResult.success) {
            result.remoteUrl = uploadResult.url;
            result.success = true;
          } else {
            this.logger.error('群晖上传失败', uploadResult.error);
            result.error = uploadResult.error;
          }
        } catch (error) {
          this.logger.error('群晖上传异常', error);
          result.error = error.message;
        }
      } else {
        // 加入异步上传队列
        this.queueUpload(fileName, fileBuffer);
        result.success = true;
      }

      return result;
    } catch (error) {
      this.logger.error('存储音频文件失败', error);
      result.error = error.message;
      return result;
    }
  }

  /**
   * 存储 PDF 文件
   */
  async storePdfFile(
    fileName: string,
    fileBuffer: Buffer,
    options: {
      immediate?: boolean;
      cache?: boolean;
    } = {},
  ): Promise<StorageResult> {
    const result: StorageResult = { success: false };

    try {
      // 1. 本地缓存
      if (options.cache !== false) {
        const localPath = path.join(this.localCacheDir, 'books', fileName);
        await fs.mkdir(path.dirname(localPath), { recursive: true });
        await fs.writeFile(localPath, fileBuffer);
        result.localPath = localPath;
        result.cacheUrl = `/api/storage/cache/books/${fileName}`;
      }

      // 2. 上传到群晖
      if (options.immediate) {
        try {
          const remotePath = `books/${fileName}`;
          const uploadResult = await this.synologyService.uploadFile(
            remotePath,
            fileBuffer,
            'application/pdf',
          );

          if (uploadResult.success) {
            result.remoteUrl = uploadResult.url;
            result.success = true;
          } else {
            result.error = uploadResult.error;
          }
        } catch (error) {
          result.error = error.message;
        }
      } else {
        this.queueUpload(fileName, fileBuffer, 'books');
        result.success = true;
      }

      return result;
    } catch (error) {
      this.logger.error('存储 PDF 文件失败', error);
      result.error = error.message;
      return result;
    }
  }

  /**
   * 存储封面图片
   */
  async storeCoverImage(
    fileName: string,
    fileBuffer: Buffer,
    options: {
      immediate?: boolean;
      cache?: boolean;
    } = {},
  ): Promise<StorageResult> {
    const result: StorageResult = { success: false };

    try {
      // 1. 本地缓存
      if (options.cache !== false) {
        const localPath = path.join(this.localCacheDir, 'covers', fileName);
        await fs.mkdir(path.dirname(localPath), { recursive: true });
        await fs.writeFile(localPath, fileBuffer);
        result.localPath = localPath;
        result.cacheUrl = `/api/storage/cache/covers/${fileName}`;
      }

      // 2. 上传到群晖
      if (options.immediate) {
        try {
          const remotePath = `covers/${fileName}`;
          const uploadResult = await this.synologyService.uploadFile(
            remotePath,
            fileBuffer,
            'image/jpeg',
          );

          if (uploadResult.success) {
            result.remoteUrl = uploadResult.url;
            result.success = true;
          } else {
            result.error = uploadResult.error;
          }
        } catch (error) {
          result.error = error.message;
        }
      } else {
        this.queueUpload(fileName, fileBuffer, 'covers');
        result.success = true;
      }

      return result;
    } catch (error) {
      this.logger.error('存储封面图片失败', error);
      result.error = error.message;
      return result;
    }
  }

  /**
   * 获取音频文件
   */
  async getAudioFile(fileName: string): Promise<Buffer | null> {
    try {
      // 1. 先尝试本地缓存
      const localPath = path.join(this.localCacheDir, 'audio', fileName);
      try {
        return await fs.readFile(localPath);
      } catch (error) {
        // 2. 从群晖下载
        const remotePath = `audio/${fileName}`;
        const buffer = await this.synologyService.downloadFile(remotePath);

        if (buffer) {
          // 3. 缓存到本地
          await fs.mkdir(path.dirname(localPath), { recursive: true });
          await fs.writeFile(localPath, buffer);
          return buffer;
        }

        return null;
      }
    } catch (error) {
      this.logger.error('获取音频文件失败', error);
      return null;
    }
  }

  /**
   * 获取文件 URL
   */
  getFileUrl(filePath: string): string {
    return this.synologyService.getFileUrl(filePath);
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      // 删除远程文件
      const success = await this.synologyService.deleteFile(filePath);

      // 删除本地缓存
      const localPath = path.join(this.localCacheDir, filePath);
      try {
        await fs.unlink(localPath);
      } catch (error) {
        // 本地文件可能不存在，忽略错误
      }

      return success;
    } catch (error) {
      this.logger.error('删除文件失败', error);
      return false;
    }
  }

  /**
   * 异步上传队列
   */
  private async queueUpload(
    fileName: string,
    fileBuffer: Buffer,
    category: string = 'audio',
  ): Promise<void> {
    // 使用 setImmediate 进行异步处理
    setImmediate(async () => {
      try {
        const remotePath = `${category}/${fileName}`;
        const uploadResult = await this.synologyService.uploadFile(
          remotePath,
          fileBuffer,
          this.getContentType(category),
        );

        if (uploadResult.success) {
          this.logger.log(`异步上传完成: ${fileName}`);
        } else {
          this.logger.error(`异步上传失败: ${fileName}`, uploadResult.error);
          // 可以加入重试机制
        }
      } catch (error) {
        this.logger.error(`异步上传异常: ${fileName}`, error);
      }
    });
  }

  /**
   * 获取内容类型
   */
  private getContentType(category: string): string {
    switch (category) {
      case 'audio':
        return 'audio/mpeg';
      case 'books':
        return 'application/pdf';
      case 'covers':
        return 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * 健康检查
   */
  async checkHealth(): Promise<boolean> {
    try {
      return await this.synologyService.checkHealth();
    } catch (error) {
      this.logger.error('存储服务健康检查失败', error);
      return false;
    }
  }

  /**
   * 清理本地缓存
   */
  async cleanupCache(): Promise<void> {
    try {
      const retentionDays = this.configService.get<number>('CACHE_RETENTION_DAYS', 7);
      const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

      const categories = ['audio', 'books', 'covers'];

      for (const category of categories) {
        const categoryPath = path.join(this.localCacheDir, category);
        try {
          const files = await fs.readdir(categoryPath);

          for (const file of files) {
            const filePath = path.join(categoryPath, file);
            const stats = await fs.stat(filePath);

            if (stats.mtime.getTime() < cutoffTime) {
              await fs.unlink(filePath);
              this.logger.log(`清理缓存文件: ${filePath}`);
            }
          }
        } catch (error) {
          // 目录可能不存在，忽略错误
        }
      }
    } catch (error) {
      this.logger.error('清理缓存失败', error);
    }
  }
}
