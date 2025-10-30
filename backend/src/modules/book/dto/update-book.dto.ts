import { PartialType } from '@nestjs/swagger';
import { CreateBookDto } from './create-book.dto';

/**
 * 更新书籍 DTO
 * 所有字段都是可选的
 */
export class UpdateBookDto extends PartialType(CreateBookDto) {}
