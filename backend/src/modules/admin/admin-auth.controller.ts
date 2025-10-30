import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminAuthResponseDto } from './dto/admin-auth-response.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('管理员认证')
@Controller('admin/auth')
export class AdminAuthController {
  private readonly logger = new Logger(AdminAuthController.name);

  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: AdminAuthResponseDto })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() loginDto: AdminLoginDto): Promise<AdminAuthResponseDto> {
    this.logger.log(`管理员登录: ${loginDto.username}`);
    return this.adminAuthService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员退出登录' })
  @ApiResponse({ status: 200, description: '退出成功' })
  async logout(@CurrentUser('sub') userId: string): Promise<{ message: string }> {
    this.logger.log(`管理员退出登录: ${userId}`);
    return this.adminAuthService.logout(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前管理员信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCurrentUser(@CurrentUser() user: any): Promise<any> {
    return this.adminAuthService.getCurrentUser(user.id);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '刷新token' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  async refreshToken(@CurrentUser('sub') userId: string): Promise<{ token: string }> {
    return this.adminAuthService.refreshToken(userId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() data: { oldPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    return this.adminAuthService.changePassword(userId, data);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新个人信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() data: { username?: string; email?: string; avatar?: string },
  ): Promise<any> {
    return this.adminAuthService.updateProfile(userId, data);
  }
}
