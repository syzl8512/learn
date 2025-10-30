import { Controller, Get, Patch, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '成功', type: UserEntity })
  async getProfile(@CurrentUser('id') userId: string): Promise<UserEntity> {
    this.logger.log(`获取用户信息: ${userId}`);
    return this.userService.findOne(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiResponse({ status: 200, description: '更新成功', type: UserEntity })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    this.logger.log(`更新用户信息: ${userId}`);
    return this.userService.update(userId, updateUserDto);
  }

  @Get('me/stats')
  @ApiOperation({ summary: '获取用户学习统计' })
  @ApiResponse({ status: 200, description: '成功' })
  async getStats(@CurrentUser('id') userId: string) {
    this.logger.log(`获取用户统计: ${userId}`);
    return this.userService.getStats(userId);
  }
}
