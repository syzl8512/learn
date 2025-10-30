import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 配置 CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // API 前缀
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // Swagger 文档
  if (process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('英语分级阅读 API')
      .setDescription('英语分级阅读微信小程序后端 API 文档')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('认证', '用户认证和授权')
      .addTag('用户', '用户管理')
      .addTag('书籍', '书籍管理')
      .addTag('章节', '章节内容')
      .addTag('蓝斯值', '蓝斯值评估')
      .addTag('TTS', '文字转语音')
      .addTag('词汇', '生词本')
      .addTag('进度', '学习进度')
      .addTag('听力训练', '听力内容管理')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(process.env.SWAGGER_PATH || 'api-docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 应用启动成功!`);
  console.log(`📍 运行地址: http://localhost:${port}`);
  console.log(`📚 API 文档: http://localhost:${port}/${process.env.SWAGGER_PATH || 'api-docs'}\n`);
}

bootstrap();
