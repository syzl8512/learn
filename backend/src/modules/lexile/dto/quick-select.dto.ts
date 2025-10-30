import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class QuickSelectDto {
  @ApiProperty({
    description: '蓝斯值档次',
    enum: ['初级', 'KET', 'PET', '自定义'],
    example: 'KET',
  })
  @IsString()
  @IsIn(['初级', 'KET', 'PET', '自定义'])
  level: string;
}
