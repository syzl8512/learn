import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * MinerU PDF转换服务
 * 使用 Python 脚本调用 MinerU API v4
 * 官网: https://mineru.net/
 */
@Injectable()
export class MinerUService {
  private readonly logger = new Logger(MinerUService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://mineru.net/api/v4';
  private readonly pythonScriptPath: string;
  private readonly outputBaseDir: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MINERU_API_KEY') || '';
    this.pythonScriptPath = path.join(process.cwd(), '../pdf_to_markdown.py');
    this.outputBaseDir = path.join(process.cwd(), 'storage/pdf-output');

    // 确保输出目录存在
    fs.ensureDirSync(this.outputBaseDir);

    if (!this.apiKey) {
      this.logger.warn('⚠️  MinerU API Key 未配置，PDF 转换功能将不可用');
      this.logger.warn('请在 .env 文件中设置 MINERU_API_KEY');
    } else {
      this.logger.log('✅ MinerU 服务初始化成功');
      this.logger.log(`📍 API Base URL: ${this.baseUrl}`);
      this.logger.log(`📁 输出目录: ${this.outputBaseDir}`);
    }
  }

  /**
   * PDF转Markdown的主要入口方法
   * 调用 Python 脚本进行转换
   */
  async convertPdfToMarkdown(
    pdfPath: string,
    options: {
      bookId?: string;
      title?: string;
    } = {},
  ): Promise<{
    success: boolean;
    markdownPath?: string;
    markdownContent?: string;
    contentJsonPath?: string;
    layoutJsonPath?: string;
    error?: string;
  }> {
    const startTime = Date.now();
    const fileName = path.basename(pdfPath);

    this.logger.log(`📖 开始转换PDF: ${fileName}`);

    if (!this.apiKey) {
      this.logger.error('❌ MinerU API Key 未配置');
      return {
        success: false,
        error: 'MinerU API Key 未配置，请在 .env 文件中设置 MINERU_API_KEY',
      };
    }

    // 检查 PDF 文件是否存在
    if (!(await fs.pathExists(pdfPath))) {
      this.logger.error(`❌ PDF文件不存在: ${pdfPath}`);
      return {
        success: false,
        error: 'PDF文件不存在',
      };
    }

    // 检查 Python 脚本是否存在
    if (!(await fs.pathExists(this.pythonScriptPath))) {
      this.logger.error(`❌ Python脚本不存在: ${this.pythonScriptPath}`);
      return {
        success: false,
        error: 'Python转换脚本不存在',
      };
    }

    try {
      // 创建唯一的输出目录
      const outputDir = path.join(this.outputBaseDir, options.bookId || `book_${Date.now()}`);
      await fs.ensureDir(outputDir);

      this.logger.log(`📂 输出目录: ${outputDir}`);

      // 构建 Python 脚本调用命令
      const command = `python3 "${this.pythonScriptPath}" --api-key "${this.apiKey}" --file "${pdfPath}" --output "${outputDir}"`;

      this.logger.log('🐍 执行Python脚本: pdf_to_markdown.py');
      this.logger.debug(`完整命令: ${command.replace(this.apiKey, '***')}`);

      // 执行 Python 脚本
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer
        timeout: 600000, // 10分钟超时
      });

      if (stderr && !stderr.includes('WARNING')) {
        this.logger.warn(`⚠️  Python警告: ${stderr}`);
      }

      this.logger.log('✅ Python脚本执行完成');
      this.logger.debug(`输出: ${stdout.substring(0, 500)}...`);

      // 解析输出，提取文件路径
      const mdPathMatch = stdout.match(/##OUTPUT_MD##(.+)/);
      const contentJsonMatch = stdout.match(/##OUTPUT_CONTENT_JSON##(.+)/);
      const layoutJsonMatch = stdout.match(/##OUTPUT_LAYOUT_JSON##(.+)/);

      if (!mdPathMatch) {
        throw new Error('未找到 Markdown 输出路径，Python脚本可能执行失败');
      }

      const markdownPath = mdPathMatch[1].trim();
      const contentJsonPath = contentJsonMatch ? contentJsonMatch[1].trim() : undefined;
      const layoutJsonPath = layoutJsonMatch ? layoutJsonMatch[1].trim() : undefined;

      // 验证文件是否存在
      if (!(await fs.pathExists(markdownPath))) {
        throw new Error(`Markdown文件不存在: ${markdownPath}`);
      }

      // 读取 Markdown 内容
      const markdownContent = await fs.readFile(markdownPath, 'utf-8');

      const duration = Date.now() - startTime;
      const fileSize = (await fs.stat(pdfPath)).size;
      const markdownSize = markdownContent.length;

      this.logger.log(`✅ PDF转换成功: ${fileName}`);
      this.logger.log(
        `   📊 大小对比: ${(fileSize / 1024 / 1024).toFixed(2)}MB (PDF) → ${(markdownSize / 1024).toFixed(2)}KB (MD)`,
      );
      this.logger.log(`   ⏱  耗时: ${(duration / 1000).toFixed(2)}秒`);

      return {
        success: true,
        markdownPath,
        markdownContent,
        contentJsonPath,
        layoutJsonPath,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ PDF转换失败: ${error.message}`, error.stack);
      this.logger.error(`   ⏱  耗时: ${(duration / 1000).toFixed(2)}秒`);

      return {
        success: false,
        error: error.message || 'PDF转换失败',
      };
    }
  }

  /**
   * 批量转换 PDF 文件
   * 用于批量处理多个 PDF
   */
  async batchConvertPdfs(
    pdfPaths: string[],
    options: {
      bookIds?: string[];
    } = {},
  ): Promise<
    Array<{
      pdfPath: string;
      success: boolean;
      markdownPath?: string;
      error?: string;
    }>
  > {
    this.logger.log(`📚 开始批量转换 ${pdfPaths.length} 个 PDF 文件`);

    const results = [];

    for (let i = 0; i < pdfPaths.length; i++) {
      const pdfPath = pdfPaths[i];
      const bookId = options.bookIds?.[i];

      this.logger.log(`\n[${i + 1}/${pdfPaths.length}] 处理: ${path.basename(pdfPath)}`);

      try {
        const result = await this.convertPdfToMarkdown(pdfPath, { bookId });
        results.push({
          pdfPath,
          success: result.success,
          markdownPath: result.markdownPath,
          error: result.error,
        });
      } catch (error) {
        this.logger.error(`批量转换失败: ${pdfPath}`, error.stack);
        results.push({
          pdfPath,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    this.logger.log(`\n✅ 批量转换完成: ${successCount}/${pdfPaths.length} 个文件成功`);

    return results;
  }

  /**
   * 检查 MinerU 服务健康状态
   */
  async checkHealth(): Promise<{
    healthy: boolean;
    apiKeyConfigured: boolean;
    pythonScriptExists: boolean;
    pythonInstalled: boolean;
    message: string;
    details?: any;
  }> {
    const apiKeyConfigured = !!this.apiKey;
    const pythonScriptExists = await fs.pathExists(this.pythonScriptPath);
    let pythonInstalled = false;
    let pythonVersion = '';

    // 检查 Python 3 是否安装
    try {
      const { stdout } = await execAsync('python3 --version');
      pythonVersion = stdout.trim();
      pythonInstalled = true;
    } catch (error) {
      pythonInstalled = false;
    }

    // 综合判断健康状态
    const healthy = apiKeyConfigured && pythonScriptExists && pythonInstalled;

    let message = '';
    if (!apiKeyConfigured) {
      message = '❌ MinerU API Key 未配置';
    } else if (!pythonScriptExists) {
      message = `❌ Python脚本不存在: ${this.pythonScriptPath}`;
    } else if (!pythonInstalled) {
      message = '❌ Python3 未安装或不可用';
    } else {
      message = '✅ MinerU 服务正常';
    }

    return {
      healthy,
      apiKeyConfigured,
      pythonScriptExists,
      pythonInstalled,
      message,
      details: {
        apiBaseUrl: this.baseUrl,
        pythonScriptPath: this.pythonScriptPath,
        pythonVersion: pythonVersion || '未安装',
        outputDir: this.outputBaseDir,
      },
    };
  }

  /**
   * 清理临时文件
   * 删除超过指定天数的临时输出目录
   */
  async cleanupTempFiles(olderThanDays: number = 7): Promise<{
    deletedCount: number;
    freedSpace: number;
  }> {
    try {
      const now = Date.now();
      const maxAge = olderThanDays * 24 * 60 * 60 * 1000;
      let deletedCount = 0;
      let freedSpace = 0;

      if (!(await fs.pathExists(this.outputBaseDir))) {
        return { deletedCount: 0, freedSpace: 0 };
      }

      const dirs = await fs.readdir(this.outputBaseDir);

      for (const dir of dirs) {
        const dirPath = path.join(this.outputBaseDir, dir);

        try {
          const stat = await fs.stat(dirPath);

          if (stat.isDirectory() && now - stat.mtimeMs > maxAge) {
            // 计算目录大小
            const dirSize = await this.getDirectorySize(dirPath);

            // 删除目录
            await fs.remove(dirPath);

            deletedCount++;
            freedSpace += dirSize;

            this.logger.log(`🗑️  清理临时目录: ${dir} (${(dirSize / 1024 / 1024).toFixed(2)}MB)`);
          }
        } catch (error) {
          this.logger.warn(`清理目录失败: ${dir}`, error.message);
        }
      }

      if (deletedCount > 0) {
        this.logger.log(
          `✅ 清理完成: 删除 ${deletedCount} 个目录，释放 ${(freedSpace / 1024 / 1024).toFixed(2)}MB 空间`,
        );
      } else {
        this.logger.log('✅ 无需清理，所有文件都在保留期内');
      }

      return { deletedCount, freedSpace };
    } catch (error) {
      this.logger.error(`清理临时文件失败: ${error.message}`, error.stack);
      return { deletedCount: 0, freedSpace: 0 };
    }
  }

  /**
   * 计算目录大小
   */
  private async getDirectorySize(dirPath: string): Promise<number> {
    let size = 0;

    try {
      const files = await fs.readdir(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          size += await this.getDirectorySize(filePath);
        } else {
          size += stat.size;
        }
      }
    } catch (error) {
      // 忽略错误
    }

    return size;
  }

  /**
   * 获取服务信息
   */
  getServiceInfo() {
    return {
      serviceName: 'MinerU PDF转换服务',
      apiVersion: 'v4',
      apiBaseUrl: this.baseUrl,
      apiKeyConfigured: !!this.apiKey,
      pythonScriptPath: this.pythonScriptPath,
      outputDir: this.outputBaseDir,
      website: 'https://mineru.net/',
    };
  }
}
