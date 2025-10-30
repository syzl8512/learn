import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiPropertyOptional({ description: '邮箱' })
  email?: string;

  @ApiPropertyOptional({ description: '微信OpenID' })
  wechatId?: string;

  @ApiPropertyOptional({ description: '昵称' })
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  avatar?: string;

  @ApiPropertyOptional({ description: '蓝斯值' })
  lexileScore?: number;

  @ApiPropertyOptional({ description: '蓝斯值等级' })
  lexileLevel?: string;

  @ApiPropertyOptional({ description: '蓝斯值更新时间' })
  lexileUpdatedAt?: Date;

  @ApiProperty({ description: '角色', default: 'student' })
  role: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
