import { ApiProperty } from '@nestjs/swagger';

export class AdminAuthResponseDto {
  @ApiProperty({
    description: '访问令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: '管理员用户信息',
    type: 'object',
    properties: {
      id: { type: 'string', description: '用户ID' },
      username: { type: 'string', description: '用户名' },
      email: { type: 'string', description: '邮箱' },
      role: { type: 'string', description: '角色' },
      avatar: { type: 'string', description: '头像' },
      createdAt: { type: 'string', description: '创建时间' },
      updatedAt: { type: 'string', description: '更新时间' },
    },
  })
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
  };
}
