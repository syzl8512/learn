import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('章节管理')
@Controller('chapters')
export class ChapterController {
  private readonly logger = new Logger(ChapterController.name);

  constructor(private readonly chapterService: ChapterService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取章节详情' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`获取章节详情: ${id}`);
    return this.chapterService.findOne(id);
  }

  @Public()
  @Get(':id/content')
  @ApiOperation({ summary: '获取章节内容（指定版本）' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @ApiQuery({
    name: 'version',
    required: false,
    description: '版本：original/easy/ket/pet/custom',
    enum: ['original', 'easy', 'ket', 'pet', 'custom'],
  })
  @ApiResponse({ status: 200, description: '成功' })
  async getContent(@Param('id') id: string, @Query('version') version: string = 'original') {
    this.logger.log(`获取章节内容: ${id}, 版本: ${version}`);
    return this.chapterService.getContent(id, version);
  }

  @Public()
  @Get(':id/versions')
  @ApiOperation({ summary: '获取章节的所有版本内容' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async getAllVersions(@Param('id') id: string) {
    this.logger.log(`获取章节所有版本: ${id}`);
    return this.chapterService.getAllVersions(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: '创建章节（需要管理员权限）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createChapterDto: CreateChapterDto) {
    this.logger.log(`创建章节: ${createChapterDto.title}`);
    return this.chapterService.create(createChapterDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: '更新章节（需要管理员权限）' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() updateChapterDto: UpdateChapterDto) {
    this.logger.log(`更新章节: ${id}`);
    return this.chapterService.update(id, updateChapterDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: '删除章节（需要管理员权限）' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    this.logger.log(`删除章节: ${id}`);
    await this.chapterService.remove(id);
    return { message: '删除成功' };
  }
}
