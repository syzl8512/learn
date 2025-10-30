import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

export interface SynologyConfig {
  baseUrl: string;
  username: string;
  password: string;
  timeout: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

@Injectable()
export class SynologyService {
  private readonly logger = new Logger(SynologyService.name);
  private readonly config: SynologyConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      baseUrl: this.configService.get<string>('SYNOLOGY_WEBDAV_URL') || '',
      username: this.configService.get<string>('SYNOLOGY_USERNAME') || '',
      password: this.configService.get<string>('SYNOLOGY_PASSWORD') || '',
      timeout: this.configService.get<number>('SYNOLOGY_TIMEOUT', 30000),
    };

    this.logger.log(`群晖服务初始化: ${this.config.baseUrl}`);
  }

  /**
   * 上传文件到群晖
   */
  async uploadFile(
    filePath: string,
    fileBuffer: Buffer,
    contentType: string = 'application/octet-stream',
  ): Promise<UploadResult> {
    try {
      const url = `${this.config.baseUrl}/${filePath}`;

      this.logger.log(`开始上传文件: ${filePath}`);

      const response: AxiosResponse = await axios.put(url, fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
        },
        auth: {
          username: this.config.username,
          password: this.config.password,
        },
        timeout: this.config.timeout,
      });

      if (response.status === 200 || response.status === 201 || response.status === 204) {
        this.logger.log(`文件上传成功: ${filePath}`);
        return {
          success: true,
          url: url,
        };
      } else {
        this.logger.error(`文件上传失败: ${filePath}, 状态码: ${response.status}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      this.logger.error(`文件上传异常: ${filePath}`, error);
      return {
        success: false,
        error: error.message || '上传失败',
      };
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(filePath: string): Promise<Buffer | null> {
    try {
      const url = `${this.config.baseUrl}/${filePath}`;

      this.logger.log(`开始下载文件: ${filePath}`);

      const response: AxiosResponse = await axios.get(url, {
        auth: {
          username: this.config.username,
          password: this.config.password,
        },
        responseType: 'arraybuffer',
        timeout: this.config.timeout,
      });

      if (response.status === 200) {
        this.logger.log(`文件下载成功: ${filePath}`);
        return Buffer.from(response.data);
      } else {
        this.logger.error(`文件下载失败: ${filePath}, 状态码: ${response.status}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`文件下载异常: ${filePath}`, error);
      return null;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/${filePath}`;

      this.logger.log(`开始删除文件: ${filePath}`);

      const response: AxiosResponse = await axios.delete(url, {
        auth: {
          username: this.config.username,
          password: this.config.password,
        },
        timeout: this.config.timeout,
      });

      if (response.status === 200 || response.status === 204) {
        this.logger.log(`文件删除成功: ${filePath}`);
        return true;
      } else {
        this.logger.error(`文件删除失败: ${filePath}, 状态码: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`文件删除异常: ${filePath}`, error);
      return false;
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/${filePath}`;

      const response: AxiosResponse = await axios.head(url, {
        auth: {
          username: this.config.username,
          password: this.config.password,
        },
        timeout: this.config.timeout,
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取文件 URL（用于前端访问）
   */
  getFileUrl(filePath: string): string {
    return `${this.config.baseUrl}/${filePath}`;
  }

  /**
   * 健康检查
   */
  async checkHealth(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/`;

      const response: AxiosResponse = await axios.request({
        method: 'PROPFIND',
        url,
        auth: {
          username: this.config.username,
          password: this.config.password,
        },
        headers: {
          Depth: '0',
        },
        timeout: this.config.timeout,
      });

      return response.status === 200 || response.status === 207;
    } catch (error) {
      this.logger.error('群晖健康检查失败', error);
      return false;
    }
  }

  /**
   * 获取目录列表
   */
  async listDirectory(directoryPath: string = ''): Promise<string[]> {
    try {
      const url = `${this.config.baseUrl}/${directoryPath}`;

      const response: AxiosResponse = await axios.request({
        method: 'PROPFIND',
        url,
        auth: {
          username: this.config.username,
          password: this.config.password,
        },
        headers: {
          Depth: '1',
        },
        timeout: this.config.timeout,
      });

      if (response.status === 200 || response.status === 207) {
        // 解析 WebDAV 响应，提取文件列表
        // 这里需要解析 XML 响应
        this.logger.log(`目录列表获取成功: ${directoryPath}`);
        return []; // 暂时返回空数组，需要实现 XML 解析
      } else {
        this.logger.error(`目录列表获取失败: ${directoryPath}, 状态码: ${response.status}`);
        return [];
      }
    } catch (error) {
      this.logger.error(`目录列表获取异常: ${directoryPath}`, error);
      return [];
    }
  }

  /**
   * 创建目录
   */
  async createDirectory(directoryPath: string): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/${directoryPath}`;

      const response: AxiosResponse = await axios.request({
        method: 'MKCOL',
        url,
        auth: {
          username: this.config.username,
          password: this.config.password,
        },
        timeout: this.config.timeout,
      });

      if (response.status === 200 || response.status === 201) {
        this.logger.log(`目录创建成功: ${directoryPath}`);
        return true;
      } else {
        this.logger.error(`目录创建失败: ${directoryPath}, 状态码: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`目录创建异常: ${directoryPath}`, error);
      return false;
    }
  }

  /**
   * 获取配置信息（用于调试）
   */
  getConfig(): Partial<SynologyConfig> {
    return {
      baseUrl: this.config.baseUrl,
      username: this.config.username,
      // 不返回密码
      timeout: this.config.timeout,
    };
  }
}
