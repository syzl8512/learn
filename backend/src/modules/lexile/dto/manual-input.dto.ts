import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class ManualInputDto {
  @ApiProperty({
    description: '蓝斯值（200-1700）',
    minimum: 200,
    maximum: 1700,
    example: 800,
  })
  @IsNumber()
  @Min(200)
  @Max(1700)
  lexileScore: number;
}
