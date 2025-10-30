import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { LexileController } from './lexile.controller';
import { LexileService } from './lexile.service';
import { ModelScopeModule } from '../../ai-pipeline/modelscope/modelscope.module';

@Module({
  imports: [ConfigModule, PrismaModule, ModelScopeModule],
  controllers: [LexileController],
  providers: [LexileService],
  exports: [LexileService],
})
export class LexileModule {}
