import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GenerateTtsDto } from './dto/generate-tts.dto';

/**
 * TTS 服务
 * 提供文本转语音功能
 */
@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 为章节生成 TTS 音频
   */
  async generateForChapter(chapterId: string, generateTtsDto: GenerateTtsDto) {
    const { version = 'original', voice = 'default', speed = 1.0 } = generateTtsDto;

    // 检查章节是否存在
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // 获取章节内容
    const content = await this.prisma.chapterContent.findUnique({
      where: {
        chapterId_version: {
          chapterId,
          version,
        },
      },
    });

    if (!content) {
      throw new NotFoundException(`章节内容不存在（版本: ${version}）`);
    }

    // TODO: 集成 Aliyun TTS API 或 ModelScope TTS
    // 这里暂时返回模拟数据
    const mockAudioUrl = `https://example.com/audio/${chapterId}_${version}.mp3`;
    const mockMetadata = {
      voice,
      speed,
      duration: 300, // 秒
      generatedAt: new Date().toISOString(),
    };

    // 更新章节的音频信息
    await this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        audioUrl: mockAudioUrl,
        audioGenerated: true,
        audioMetadata: mockMetadata,
      },
    });

    this.logger.log(`章节 ${chapterId} 的 TTS 音频已生成`);

    return {
      chapterId,
      version,
      audioUrl: mockAudioUrl,
      metadata: mockMetadata,
    };
  }

  /**
   * 获取章节的音频信息
   */
  async getChapterAudio(chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        id: true,
        title: true,
        audioUrl: true,
        audioGenerated: true,
        audioMetadata: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    if (!chapter.audioGenerated) {
      return {
        chapterId: chapter.id,
        title: chapter.title,
        audioAvailable: false,
        message: '音频尚未生成',
      };
    }

    return {
      chapterId: chapter.id,
      title: chapter.title,
      audioAvailable: true,
      audioUrl: chapter.audioUrl,
      metadata: chapter.audioMetadata,
    };
  }

  /**
   * 生成文本的字幕数据（时间戳映射）
   */
  async generateSubtitles(text: string, audioDuration: number) {
    // TODO: 实现字幕生成逻辑
    // 根据文本长度和音频时长，计算每句话的时间戳

    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgDurationPerSentence = audioDuration / sentences.length;

    const subtitles = sentences.map((sentence, index) => ({
      startTime: index * avgDurationPerSentence,
      endTime: (index + 1) * avgDurationPerSentence,
      text: sentence.trim(),
    }));

    return subtitles;
  }

  /**
   * 删除章节的音频
   */
  async deleteChapterAudio(chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // TODO: 从存储服务（OSS）删除音频文件

    // 更新章节记录
    await this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        audioUrl: null,
        audioGenerated: false,
        audioMetadata: null as any,
      },
    });

    this.logger.log(`章节 ${chapterId} 的音频已删除`);
  }
}
