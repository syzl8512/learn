import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class WechatLoginDto {
  @ApiProperty({
    description: '微信登录凭证 code',
    example: '081xYz000tnLxU1234567890',
  })
  @IsString({ message: 'code必须是字符串' })
  @IsNotEmpty({ message: 'code不能为空' })
  code: string;
}
