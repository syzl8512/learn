import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { UploadBookDto } from './dto/upload-book.dto';
import { BookEntity } from './entities/book.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('书籍管理')
@Controller('books')
export class BookController {
  private readonly logger = new Logger(BookController.name);

  constructor(private readonly bookService: BookService) {}

  /**
   * 上传书籍 PDF 文件
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传书籍 PDF 文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '书籍 PDF 文件和元数据',
    schema: {
      type: 'object',
      required: ['title', 'file'],
      properties: {
        title: { type: 'string', example: 'Harry Potter' },
        author: { type: 'string', example: 'J.K. Rowling' },
        description: { type: 'string', example: 'A magical story' },
        category: { type: 'string', example: '小说' },
        originalLexile: { type: 'number', example: 880 },
        recommendedAge: { type: 'string', example: '8-12岁' },
        tags: { type: 'array', items: { type: 'string' } },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '书籍上传成功，后台处理中',
    schema: {
      example: {
        bookId: 'clxxx123',
        message: '书籍上传成功，正在后台处理 PDF',
        jobId: 'job_123',
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/books',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          callback(null, `book-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
      fileFilter: (req, file, callback) => {
        if (file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(new Error('只允许上传 PDF 文件'), false);
        }
      },
    }),
  )
  async uploadBook(
    @Body() uploadBookDto: UploadBookDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    this.logger.log(
      `上传书籍: ${uploadBookDto.title} - 文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    );

    if (!file) {
      throw new BadRequestException('未上传 PDF 文件');
    }

    return this.bookService.uploadBook(uploadBookDto, file);
  }

  /**
   * 获取书籍上传任务进度
   */
  @Get('upload/:jobId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取书籍上传任务进度' })
  @ApiResponse({
    status: 200,
    description: '任务进度信息',
    schema: {
      example: {
        jobId: 'job_123',
        progress: 60,
        status: 'processing',
        message: '正在分割章节...',
      },
    },
  })
  async getUploadProgress(@Param('jobId') jobId: string) {
    return this.bookService.getUploadProgress(jobId);
  }

  /**
   * 手动创建书籍（不上传 PDF）
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '手动创建书籍' })
  @ApiResponse({ status: 201, type: BookEntity })
  async create(@Body() createBookDto: CreateBookDto): Promise<BookEntity> {
    return this.bookService.create(createBookDto);
  }

  /**
   * 查询书籍列表
   */
  @Get()
  @ApiOperation({ summary: '查询书籍列表' })
  @ApiResponse({ status: 200, type: [BookEntity] })
  async findAll(@Query() query: QueryBookDto): Promise<PaginatedResult<BookEntity>> {
    this.logger.log(`接收到书籍列表查询请求: ${JSON.stringify(query)}`);
    try {
      const result = await this.bookService.findAll(query);
      this.logger.log(`查询成功，返回 ${result.data.length} 条记录`);
      return result;
    } catch (error) {
      this.logger.error(`查询失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 查询书籍详情
   */
  @Get(':id')
  @ApiOperation({ summary: '查询书籍详情' })
  @ApiResponse({ status: 200, type: BookEntity })
  async findOne(@Param('id') id: string): Promise<BookEntity> {
    return this.bookService.findOne(id);
  }

  /**
   * 更新书籍
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新书籍' })
  @ApiResponse({ status: 200, type: BookEntity })
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto): Promise<BookEntity> {
    return this.bookService.update(id, updateBookDto);
  }

  /**
   * 删除书籍
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除书籍' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.bookService.remove(id);
  }
}
