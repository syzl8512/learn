import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserCredential } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, UserPayload } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

type UserWithCredential = User & { credential?: UserCredential | null };

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, nickname } = registerDto;

    // 检查邮箱是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('该邮箱已被注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户和凭证，保证在同一事务中
    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          nickname: nickname || email.split('@')[0],
          role: 'student',
        },
      });

      await tx.userCredential.create({
        data: {
          userId: createdUser.id,
          passwordHash: hashedPassword,
        },
      });

      return createdUser;
    });

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // 查找用户及其凭证
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        credential: true,
      },
    });

    if (!user || !user.credential) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.credential.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    return this.generateTokens(user);
  }

  async loginWithWechat(openid: string, _sessionKey: string): Promise<AuthResponseDto> {
    let user = await this.prisma.user.findUnique({
      where: { wechatId: openid },
    });

    if (!user) {
      // 创建新用户
      user = await this.prisma.user.create({
        data: {
          wechatId: openid,
          role: 'student',
        },
      });
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  private async generateTokens(user: UserWithCredential): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email || undefined,
      wechatId: user.wechatId || undefined,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.getAccessTokenSecret(),
      expiresIn: this.getAccessTokenExpiresIn(),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.getRefreshTokenSecret(),
      expiresIn: this.getRefreshTokenExpiresIn(),
    });

    const userPayload: UserPayload = {
      id: user.id,
      email: user.email || undefined,
      wechatId: user.wechatId || undefined,
      nickname: user.nickname || undefined,
      role: user.role,
    };

    return {
      accessToken,
      refreshToken,
      user: userPayload,
      tokenType: 'Bearer',
      expiresIn: this.parseExpiration(this.getAccessTokenExpiresIn()),
    };
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([dhms])$/);
    if (!match) return 604800; // 默认7天

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      d: 86400,
      h: 3600,
      m: 60,
      s: 1,
    };

    return value * (multipliers[unit] || 1);
  }

  private getAccessTokenSecret(): string {
    return (
      this.configService.get<string>('JWT_SECRET') ||
      this.configService.get<string>('jwt.secret') ||
      'default-secret-key'
    );
  }

  private getAccessTokenExpiresIn(): string {
    return (
      this.configService.get<string>('JWT_EXPIRES_IN') ||
      this.configService.get<string>('jwt.expiresIn') ||
      '7d'
    );
  }

  private getRefreshTokenSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.get<string>('jwt.refreshSecret') ||
      this.getAccessTokenSecret()
    );
  }

  private getRefreshTokenExpiresIn(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
      this.configService.get<string>('jwt.refreshExpiresIn') ||
      '30d'
    );
  }
}
