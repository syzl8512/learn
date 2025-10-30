import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { UploadBookDto } from './dto/upload-book.dto';
import { BookEntity } from './entities/book.entity';
import { createPaginatedResponse, PaginatedResult } from '../../common/dto/pagination.dto';
import { Book } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PdfProcessingJobData } from '@queue/pdf-processing.queue';

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('pdf-processing') private readonly pdfQueue: Queue,
  ) {}

  /**
   * 创建书籍
   */
  async create(createBookDto: CreateBookDto): Promise<BookEntity> {
    try {
      // 处理标签 (数组转字符串)
      const tagsString = createBookDto.tags ? JSON.stringify(createBookDto.tags) : null;

      const book = await this.prisma.book.create({
        data: {
          ...createBookDto,
          tags: tagsString,
        },
      });

      this.logger.log(`创建书籍成功: ${book.id} - ${book.title}`);
      return this.transformBook(book);
    } catch (error) {
      this.logger.error(`创建书籍失败: ${error.message}`, error.stack);
      throw new BadRequestException('创建书籍失败');
    }
  }

  /**
   * 查询书籍列表 (支持分页、搜索、排序)
   */
  async findAll(query: QueryBookDto): Promise<PaginatedResult<BookEntity>> {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status,
      minLexile,
      maxLexile,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // 构建查询条件
    const where: Prisma.BookWhereInput = {};

    // 搜索条件 (标题或作者)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 分类筛选
    if (category) {
      where.category = category;
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 蓝斯值范围筛选
    if (minLexile !== undefined || maxLexile !== undefined) {
      where.originalLexile = {};
      if (minLexile !== undefined) {
        where.originalLexile.gte = minLexile;
      }
      if (maxLexile !== undefined) {
        where.originalLexile.lte = maxLexile;
      }
    }

    // 排序配置
    const orderBy: Prisma.BookOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    try {
      // 查询总数
      const total = await this.prisma.book.count({ where });

      // 查询数据
      const books = await this.prisma.book.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { chapters: true },
          },
        },
      });

      // 转换数据
      const transformedBooks = books.map((book) => this.transformBook(book, book._count.chapters));

      return createPaginatedResponse(transformedBooks, total, page, limit);
    } catch (error) {
      this.logger.error(`查询书籍列表失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询书籍列表失败');
    }
  }

  /**
   * 根据 ID 查询书籍详情
   */
  async findOne(id: string): Promise<BookEntity> {
    try {
      const book = await this.prisma.book.findUnique({
        where: { id },
        include: {
          _count: {
            select: { chapters: true },
          },
        },
      });

      if (!book) {
        throw new NotFoundException(`书籍不存在: ${id}`);
      }

      return this.transformBook(book, book._count.chapters);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`查询书籍详情失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询书籍详情失败');
    }
  }

  /**
   * 更新书籍
   */
  async update(id: string, updateBookDto: UpdateBookDto): Promise<BookEntity> {
    // 先检查书籍是否存在
    await this.findOne(id);

    try {
      // 处理标签
      const tagsString =
        updateBookDto.tags !== undefined ? JSON.stringify(updateBookDto.tags) : undefined;

      const book = await this.prisma.book.update({
        where: { id },
        data: {
          ...updateBookDto,
          tags: tagsString,
        },
      });

      this.logger.log(`更新书籍成功: ${book.id} - ${book.title}`);
      return this.transformBook(book);
    } catch (error) {
      this.logger.error(`更新书籍失败: ${error.message}`, error.stack);
      throw new BadRequestException('更新书籍失败');
    }
  }

  /**
   * 删除书籍
   */
  async remove(id: string): Promise<void> {
    // 先检查书籍是否存在
    await this.findOne(id);

    try {
      await this.prisma.book.delete({
        where: { id },
      });

      this.logger.log(`删除书籍成功: ${id}`);
    } catch (error) {
      this.logger.error(`删除书籍失败: ${error.message}`, error.stack);
      throw new BadRequestException('删除书籍失败');
    }
  }

  /**
   * 上传书籍 PDF 文件
   */
  async uploadBook(uploadBookDto: UploadBookDto, file: Express.Multer.File) {
    try {
      // 1. 创建书籍记录
      const book = await this.create({
        ...uploadBookDto,
        status: 'processing',
      });

      this.logger.log(`书籍创建成功: ${book.id} - ${book.title}，准备加入处理队列`);

      // 2. 将 PDF 处理任务加入队列
      const job = await this.pdfQueue.add(
        'convert-and-split',
        {
          bookId: book.id,
          pdfFilePath: file.path,
          title: book.title,
        } as PdfProcessingJobData,
        {
          attempts: 3, // 失败重试 3 次
          backoff: {
            type: 'exponential',
            delay: 5000, // 5秒指数退避
          },
          removeOnComplete: false, // 保留完成的任务
          removeOnFail: false, // 保留失败的任务
        },
      );

      this.logger.log(`任务已加入队列: Job ID ${job.id}`);

      return {
        bookId: book.id,
        message: '书籍上传成功，正在后台处理 PDF',
        jobId: job.id.toString(),
        status: 'queued',
      };
    } catch (error) {
      this.logger.error(`书籍上传失败: ${error.message}`, error.stack);
      throw new BadRequestException('书籍上传失败');
    }
  }

  /**
   * 获取上传任务进度
   */
  async getUploadProgress(jobId: string) {
    try {
      const job = await this.pdfQueue.getJob(jobId);

      if (!job) {
        throw new NotFoundException(`任务不存在: ${jobId}`);
      }

      const state = await job.getState();
      const progress = job.progress();

      let message = '等待处理';
      if (state === 'active') {
        if (progress < 40) {
          message = '正在转换 PDF 为 Markdown...';
        } else if (progress < 60) {
          message = '正在分割章节...';
        } else if (progress < 80) {
          message = '正在进行质量检查...';
        } else {
          message = '正在存储到数据库...';
        }
      } else if (state === 'completed') {
        message = '处理完成';
      } else if (state === 'failed') {
        message = '处理失败';
      }

      return {
        jobId,
        progress: typeof progress === 'number' ? progress : 0,
        status: state,
        message,
        failedReason: state === 'failed' ? job.failedReason : null,
      };
    } catch (error) {
      this.logger.error(`查询任务进度失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询任务进度失败');
    }
  }

  /**
   * 转换书籍数据 (将 tags 字符串转为数组)
   */
  private transformBook(book: Book, chaptersCount?: number): BookEntity {
    const tags = book.tags ? JSON.parse(book.tags as string) : [];

    return new BookEntity({
      ...book,
      tags,
      chaptersCount,
    } as any); // 使用as any来处理Prisma类型和Entity类型的差异
  }
}
