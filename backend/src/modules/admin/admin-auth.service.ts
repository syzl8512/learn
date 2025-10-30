import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminAuthResponseDto } from './dto/admin-auth-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: AdminLoginDto): Promise<AdminAuthResponseDto> {
    const { username, password } = loginDto;

    // 查找管理员用户
    const admin = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { nickname: username },
        ],
        role: 'admin',
      },
      include: {
        credential: true,
      },
    });

    if (!admin || !admin.credential) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.credential.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 JWT token
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: admin.id,
        username: admin.nickname || admin.email || 'admin',
        email: admin.email || '',
        role: admin.role,
        avatar: admin.avatar || undefined,
        createdAt: admin.createdAt.toISOString(),
        updatedAt: admin.updatedAt.toISOString(),
      },
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    // 这里可以实现 token 黑名单逻辑
    // 目前只是简单返回成功消息
    return { message: '退出登录成功' };
  }

  async getCurrentUser(userId: string): Promise<any> {
    const admin = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      id: admin.id,
      username: admin.nickname || admin.email || 'admin',
      email: admin.email || '',
      role: admin.role,
      avatar: admin.avatar || undefined,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
    };
  }

  async refreshToken(userId: string): Promise<{ token: string }> {
    const admin = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('用户不存在');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const token = this.jwtService.sign(payload);

    return { token };
  }

  async changePassword(userId: string, data: { oldPassword: string; newPassword: string }): Promise<{ message: string }> {
    const { oldPassword, newPassword } = data;

    if (newPassword.length < 6) {
      throw new BadRequestException('新密码长度至少为6位');
    }

    const admin = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        credential: true,
      },
    });

    if (!admin || !admin.credential) {
      throw new UnauthorizedException('用户不存在');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.credential.passwordHash);

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('原密码错误');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.userCredential.update({
      where: { userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: '密码修改成功' };
  }

  async updateProfile(userId: string, data: { username?: string; email?: string; avatar?: string }): Promise<any> {
    const updateData: any = {};

    if (data.username) {
      updateData.nickname = data.username;
    }

    if (data.email) {
      updateData.email = data.email;
    }

    if (data.avatar) {
      updateData.avatar = data.avatar;
    }

    const admin = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      id: admin.id,
      username: admin.nickname || admin.email || 'admin',
      email: admin.email || '',
      role: admin.role,
      avatar: admin.avatar || undefined,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
    };
  }
}
