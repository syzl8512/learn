import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateVocabularyDto } from './create-vocabulary.dto';

/**
 * 更新生词DTO
 * 继承CreateVocabularyDto的所有字段
 * 移除了掌握相关字段（mastered, masteredAt, nextReviewAt），因为这些字段已从数据库模型中删除
 */
export class UpdateVocabularyDto extends PartialType(CreateVocabularyDto) {
  // 移除了掌握相关字段，因为数据库模型中已删除这些字段
  // 所有字段现在都继承自 CreateVocabularyDto
}
