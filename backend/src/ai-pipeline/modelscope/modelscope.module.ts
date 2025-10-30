import { Module } from '@nestjs/common';
import { ModelScopeService } from './modelscope.service';
import { DeepSeekModule } from '../deepseek/deepseek.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, DeepSeekModule],
  providers: [ModelScopeService],
  exports: [ModelScopeService],
})
export class ModelScopeModule {}
