import { ApiProperty } from '@nestjs/swagger';

export class UserPayload {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ description: '用户邮箱', required: false })
  email?: string;

  @ApiProperty({ description: '微信OpenID', required: false })
  wechatId?: string;

  @ApiProperty({ description: '用户昵称', required: false })
  nickname?: string;

  @ApiProperty({ description: '用户角色' })
  role: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: '访问令牌' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌' })
  refreshToken: string;

  @ApiProperty({ description: '用户信息', type: UserPayload })
  user: UserPayload;

  @ApiProperty({ description: '令牌类型', default: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: '过期时间（秒）' })
  expiresIn: number;
}
