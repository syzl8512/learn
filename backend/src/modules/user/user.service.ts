import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { Prisma } from '@prisma/client';

/**
 * 用户服务
 * 提供用户信息的查询和更新功能
 */
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取用户信息
   */
  async findOne(userId: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        wechatId: true,
        nickname: true,
        avatar: true,
        lexileScore: true,
        lexileLevel: true,
        lexileUpdatedAt: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user as UserEntity;
  }

  /**
   * 更新用户信息
   */
  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    // 检查用户是否存在
    await this.findOne(userId);

    // 如果更新了蓝斯值，同时更新时间戳
    const updateData: Prisma.UserUpdateInput = { ...updateUserDto };
    if (updateUserDto.lexileScore !== undefined || updateUserDto.lexileLevel !== undefined) {
      updateData.lexileUpdatedAt = new Date();
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        wechatId: true,
        nickname: true,
        avatar: true,
        lexileScore: true,
        lexileLevel: true,
        lexileUpdatedAt: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as UserEntity;
  }

  /**
   * 更新用户蓝斯值
   */
  async updateLexile(
    userId: string,
    lexileScore: number,
    lexileLevel: string,
  ): Promise<UserEntity> {
    return this.update(userId, {
      lexileScore,
      lexileLevel,
    });
  }

  /**
   * 获取用户学习统计
   */
  async getStats(userId: string) {
    const [user, vocabularyCount, readingProgressCount, listeningHistoryCount] = await Promise.all([
      this.findOne(userId),
      this.prisma.vocabulary.count({ where: { userId } }),
      this.prisma.readingProgress.count({ where: { userId } }),
      this.prisma.listeningHistory.count({ where: { userId } }),
    ]);

    // 获取总阅读时长（秒）
    const totalReadingTime = await this.prisma.readingProgress.aggregate({
      where: { userId },
      _sum: { totalReadingSeconds: true },
    });

    // 获取总听力时长（秒）
    const totalListeningTime = await this.prisma.listeningHistory.aggregate({
      where: { userId },
      _sum: { listeningTimeSeconds: true },
    });

    return {
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        lexileScore: user.lexileScore,
        lexileLevel: user.lexileLevel,
      },
      stats: {
        vocabularyCount,
        readingProgressCount,
        listeningHistoryCount,
        totalReadingMinutes: Math.floor((totalReadingTime._sum.totalReadingSeconds || 0) / 60),
        totalListeningMinutes: Math.floor((totalListeningTime._sum.listeningTimeSeconds || 0) / 60),
      },
    };
  }
}
