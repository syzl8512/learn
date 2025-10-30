import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';
import { getStorageConfig, StorageType } from './storage.config';

/**
 * 文件上传结果
 */
export interface UploadResult {
  url: string;
  path: string;
  size: number;
  type: StorageType;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly config = getStorageConfig();
  private readonly storageType: StorageType;
  private synologyClient: AxiosInstance | null = null;

  constructor() {
    // 判断使用哪种存储方式
    this.storageType = this.determineStorageType();
    this.logger.log(`存储服务初始化: type=${this.storageType}`);

    // 初始化群晖客户端
    if (this.storageType === StorageType.SYNOLOGY) {
      this.initSynologyClient();
    }

    // 确保本地存储目录存在
    if (this.storageType === StorageType.LOCAL) {
      if (!fs.existsSync(this.config.localStoragePath)) {
        fs.mkdirSync(this.config.localStoragePath, { recursive: true });
      }
    }
  }

  /**
   * 判断存储类型
   */
  private determineStorageType(): StorageType {
    if (this.config.synologyUrl && this.config.synologyUsername) {
      return StorageType.SYNOLOGY;
    }
    return StorageType.LOCAL;
  }

  /**
   * 初始化群晖客户端
   */
  private initSynologyClient(): void {
    this.synologyClient = axios.create({
      baseURL: this.config.synologyUrl,
      timeout: 30000,
    });
    this.logger.log('群晖 NAS 客户端初始化完成');
  }

  /**
   * 上传音频文件
   */
  async uploadAudio(filePath: string): Promise<string> {
    this.logger.debug(`上传音频: ${filePath}`);

    try {
      switch (this.storageType) {
        case StorageType.SYNOLOGY:
          return await this.uploadToSynology(filePath);
        case StorageType.LOCAL:
          return await this.uploadToLocal(filePath);
        default:
          throw new Error(`不支持的存储类型: ${this.storageType}`);
      }
    } catch (error) {
      this.logger.error('音频上传失败', error);
      throw new HttpException('音频上传失败: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 上传到群晖 NAS
   */
  private async uploadToSynology(filePath: string): Promise<string> {
    this.logger.debug('上传到群晖 NAS');

    try {
      // 1. 登录获取 sid
      const sid = await this.synologyLogin();

      // 2. 上传文件
      const filename = path.basename(filePath);
      const remotePath = path.join(this.config.synologyStoragePath, 'audios', filename);

      const formData = new FormData();
      formData.append('api', 'SYNO.FileStation.Upload');
      formData.append('version', '2');
      formData.append('method', 'upload');
      formData.append('path', path.dirname(remotePath));
      formData.append('create_parents', 'true');
      formData.append('overwrite', 'true');
      formData.append('file', fs.createReadStream(filePath));

      const response = await this.synologyClient!.post('/webapi/entry.cgi', formData, {
        params: { _sid: sid },
        headers: formData.getHeaders(),
      });

      if (!response.data.success) {
        throw new Error(`群晖上传失败: ${JSON.stringify(response.data)}`);
      }

      // 3. 生成访问 URL
      const audioUrl = `${this.config.synologyUrl}/audios/${filename}`;
      this.logger.debug(`群晖上传成功: ${audioUrl}`);

      return audioUrl;
    } catch (error) {
      this.logger.error('群晖上传失败', error);

      // 降级到本地存储
      this.logger.warn('降级到本地存储');
      return await this.uploadToLocal(filePath);
    }
  }

  /**
   * 群晖登录
   */
  private async synologyLogin(): Promise<string> {
    try {
      const response = await this.synologyClient!.get('/webapi/auth.cgi', {
        params: {
          api: 'SYNO.API.Auth',
          version: '3',
          method: 'login',
          account: this.config.synologyUsername,
          passwd: this.config.synologyPassword,
          session: 'FileStation',
          format: 'cookie',
        },
      });

      if (!response.data.success) {
        throw new Error('群晖登录失败');
      }

      return response.data.data.sid;
    } catch (error) {
      this.logger.error('群晖登录失败', error);
      throw error;
    }
  }

  /**
   * 上传到本地存储
   */
  private async uploadToLocal(filePath: string): Promise<string> {
    this.logger.debug('上传到本地存储');

    try {
      const filename = path.basename(filePath);
      const destPath = path.join(this.config.localStoragePath, 'audios', filename);

      // 确保目录存在
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // 复制文件
      fs.copyFileSync(filePath, destPath);

      // 生成访问 URL
      const audioUrl = `${this.config.localBaseUrl}/uploads/audios/${filename}`;
      this.logger.debug(`本地存储成功: ${audioUrl}`);

      return audioUrl;
    } catch (error) {
      this.logger.error('本地存储失败', error);
      throw error;
    }
  }

  /**
   * 上传书籍文件 (PDF)
   */
  async uploadBook(filePath: string): Promise<string> {
    this.logger.debug(`上传书籍: ${filePath}`);

    try {
      switch (this.storageType) {
        case StorageType.SYNOLOGY:
          return await this.uploadBookToSynology(filePath);
        case StorageType.LOCAL:
          return await this.uploadBookToLocal(filePath);
        default:
          throw new Error(`不支持的存储类型: ${this.storageType}`);
      }
    } catch (error) {
      this.logger.error('书籍上传失败', error);
      throw new HttpException('书籍上传失败: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 上传书籍到群晖
   */
  private async uploadBookToSynology(filePath: string): Promise<string> {
    // 类似 uploadToSynology,但路径不同
    const filename = path.basename(filePath);
    const remotePath = path.join(this.config.synologyStoragePath, 'books', filename);
    // 实现省略,与 uploadToSynology 类似
    return `${this.config.synologyUrl}/books/${filename}`;
  }

  /**
   * 上传书籍到本地
   */
  private async uploadBookToLocal(filePath: string): Promise<string> {
    const filename = path.basename(filePath);
    const destPath = path.join(this.config.localStoragePath, 'books', filename);

    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(filePath, destPath);

    return `${this.config.localBaseUrl}/uploads/books/${filename}`;
  }

  /**
   * 删除文件
   */
  async deleteFile(fileUrl: string): Promise<void> {
    this.logger.debug(`删除文件: ${fileUrl}`);

    try {
      if (this.storageType === StorageType.SYNOLOGY) {
        await this.deleteFromSynology(fileUrl);
      } else {
        await this.deleteFromLocal(fileUrl);
      }
    } catch (error) {
      this.logger.error('文件删除失败', error);
      throw new HttpException('文件删除失败: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 从群晖删除
   */
  private async deleteFromSynology(fileUrl: string): Promise<void> {
    // TODO: 实现群晖文件删除
    this.logger.warn('群晖文件删除功能暂未实现');
  }

  /**
   * 从本地删除
   */
  private async deleteFromLocal(fileUrl: string): Promise<void> {
    const filename = path.basename(fileUrl);
    const filePath = path.join(this.config.localStoragePath, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.debug(`本地文件已删除: ${filePath}`);
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(fileUrl: string): Promise<{ size: number; exists: boolean }> {
    try {
      if (this.storageType === StorageType.LOCAL) {
        const filename = path.basename(fileUrl);
        const filePath = path.join(this.config.localStoragePath, filename);

        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          return {
            size: stats.size,
            exists: true,
          };
        }
      }

      return { size: 0, exists: false };
    } catch (error) {
      this.logger.error('获取文件信息失败', error);
      return { size: 0, exists: false };
    }
  }
}
