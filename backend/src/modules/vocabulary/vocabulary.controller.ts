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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { VocabularyService } from './vocabulary.service';
import { VocabularyExportService } from './vocabulary-export.service';
import { DictionaryService } from './dictionary.service';
import { VocabularyDifficultyService } from './vocabulary-difficulty.service';
import { CreateVocabularyDto, UpdateVocabularyDto, QueryVocabularyDto } from './dto';
import { LookupWordDto } from './dto/lookup-word.dto';
import { AnalyzeTextDto, AnalyzeTextResponseDto } from './dto/highlight.dto';
import { VocabularyEntity } from './entities/vocabulary.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Response } from 'express';
import { Res } from '@nestjs/common';

@ApiTags('词汇管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vocabulary')
export class VocabularyController {
  private readonly logger = new Logger(VocabularyController.name);

  constructor(
    private readonly vocabularyService: VocabularyService,
    private readonly vocabularyExportService: VocabularyExportService,
    private readonly dictionaryService: DictionaryService,
    private readonly vocabularyDifficultyService: VocabularyDifficultyService,
  ) {}

  /**
   * 查询单词释义（公开接口，阅读时查词）
   */
  @Public()
  @Post('lookup')
  @ApiOperation({ summary: '查询单词释义' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        word: 'beautiful',
        pronunciation: '/ˈbjuːtɪfl/',
        partOfSpeech: 'adjective',
        englishDefinition: 'pleasing the senses or mind aesthetically',
        chineseTranslation: '美丽的，漂亮的',
        exampleSentence: 'She has a beautiful smile.',
        exampleTranslation: '她有一个美丽的笑容。',
      },
    },
  })
  async lookupWord(@Body() lookupWordDto: LookupWordDto) {
    this.logger.log(`查询单词: ${lookupWordDto.word}`);
    return this.dictionaryService.lookupWord(lookupWordDto.word);
  }

  @Get()
  @ApiOperation({ summary: '获取生词本列表（支持搜索、筛选、分页）' })
  @ApiResponse({ status: 200, description: '成功' })
  async findAll(@CurrentUser('sub') userId: string, @Query() query: QueryVocabularyDto) {
    this.logger.log(`查询生词本列表: ${userId}`);
    return this.vocabularyService.findAll(userId, query);
  }

  @Get('review')
  @ApiOperation({ summary: '获取需要复习的生词列表' })
  @ApiResponse({ status: 200, description: '成功' })
  async getReviewList(@CurrentUser('sub') userId: string, @Query('limit') limit?: number) {
    this.logger.log(`获取复习列表: ${userId}`);
    return this.vocabularyService.getReviewList(userId, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取词汇统计' })
  @ApiResponse({ status: 200, description: '成功' })
  async getStats(@CurrentUser('sub') userId: string) {
    this.logger.log(`获取词汇统计: ${userId}`);
    return this.vocabularyService.getStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取生词详情' })
  @ApiParam({ name: 'id', description: '生词ID' })
  @ApiResponse({ status: 200, description: '成功', type: VocabularyEntity })
  @ApiResponse({ status: 404, description: '生词不存在' })
  async findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<VocabularyEntity> {
    this.logger.log(`获取生词详情: ${id}`);
    return this.vocabularyService.findOne(userId, id);
  }

  @Post()
  @ApiOperation({ summary: '添加生词' })
  @ApiResponse({ status: 201, description: '添加成功', type: VocabularyEntity })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createVocabularyDto: CreateVocabularyDto,
  ): Promise<VocabularyEntity> {
    this.logger.log(`添加生词: ${createVocabularyDto.word}`);
    return this.vocabularyService.create(userId, createVocabularyDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新生词' })
  @ApiParam({ name: 'id', description: '生词ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: VocabularyEntity })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() updateVocabularyDto: UpdateVocabularyDto,
  ): Promise<VocabularyEntity> {
    this.logger.log(`更新生词: ${id}`);
    return this.vocabularyService.update(userId, id, updateVocabularyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除生词' })
  @ApiParam({ name: 'id', description: '生词ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    this.logger.log(`删除生词: ${id}`);
    await this.vocabularyService.remove(userId, id);
    return { message: '删除成功' };
  }

  @Post(':id/review')
  @ApiOperation({ summary: '标记生词已复习' })
  @ApiParam({ name: 'id', description: '生词ID' })
  @ApiResponse({ status: 200, description: '标记成功', type: VocabularyEntity })
  async markReview(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<VocabularyEntity> {
    this.logger.log(`标记复习: ${id}`);
    return this.vocabularyService.markReview(userId, id);
  }

  @Get('export/csv')
  @ApiOperation({ summary: '导出CSV格式的生词本' })
  @ApiResponse({ status: 200, description: '导出成功' })
  async exportCSV(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryVocabularyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`导出CSV生词本: ${userId}`);

    const csvContent = await this.vocabularyExportService.exportCSV(userId, query);

    // 设置响应头
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vocabulary_${new Date().toISOString().split('T')[0]}.csv"`,
    });

    return csvContent;
  }

  @Get('export/anki')
  @ApiOperation({ summary: '导出Anki格式的生词本' })
  @ApiResponse({ status: 200, description: '导出成功' })
  async exportAnki(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryVocabularyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`导出Anki生词本: ${userId}`);

    const ankiContent = await this.vocabularyExportService.exportAnki(userId, query);

    // 设置响应头
    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="vocabulary_${new Date().toISOString().split('T')[0]}.txt"`,
    });

    return ankiContent;
  }

  @Get('export/stats')
  @ApiOperation({ summary: '获取导出统计信息' })
  @ApiResponse({ status: 200, description: '成功' })
  async getExportStats(@CurrentUser('sub') userId: string, @Query() query: QueryVocabularyDto) {
    this.logger.log(`获取导出统计: ${userId}`);
    return this.vocabularyExportService.getExportStats(userId, query);
  }

  /**
   * 智能词汇高亮分析
   */
  @Post('analyze-highlight')
  @ApiOperation({ summary: '分析文本词汇难度并返回高亮信息' })
  @ApiResponse({
    status: 200,
    description: '分析成功',
    type: AnalyzeTextResponseDto,
  })
  async analyzeTextHighlight(@Body() dto: AnalyzeTextDto): Promise<AnalyzeTextResponseDto> {
    this.logger.log(`分析文本词汇高亮: ${dto.text.substring(0, 50)}...`);

    const results = await this.vocabularyDifficultyService.analyzeTextDifficulty(dto.text, {
      userLexile: dto.config.userLexile,
      highlightMode: dto.config.highlightMode,
      customThreshold: dto.config.customThreshold,
      showTooltips: dto.config.showTooltips || false,
      highlightColors: {
        easy: '#c8e6c9', // 浅绿色
        intermediate: '#fff3e0', // 浅橙色
        advanced: '#ffebee', // 浅红色
        expert: '#f3e5f5', // 浅紫色
      },
    });

    // 统计信息
    const stats = {
      totalWords: results.length,
      highlightedWords: results.filter((r) => r.shouldHighlight).length,
      easyWords: results.filter((r) => r.difficulty === 'easy').length,
      intermediateWords: results.filter((r) => r.difficulty === 'intermediate').length,
      advancedWords: results.filter((r) => r.difficulty === 'advanced').length,
      expertWords: results.filter((r) => r.difficulty === 'expert').length,
    };

    return {
      results,
      stats,
    };
  }
}
