#!/usr/bin/env node

/**
 * 清理测试数据脚本
 * 删除所有现有的书籍和相关数据
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupTestData() {
  console.log('开始清理测试数据...');

  try {
    // 获取所有书籍
    const books = await prisma.book.findMany({
      select: { id: true, title: true }
    });

    console.log(`找到 ${books.length} 本书籍:`);
    books.forEach(book => {
      console.log(`- ${book.title} (ID: ${book.id})`);
    });

    if (books.length === 0) {
      console.log('没有找到书籍数据，无需清理。');
      return;
    }

    // 确认删除
    console.log('\n正在删除所有书籍和相关数据...');

    // 删除所有相关的数据（按依赖关系顺序）

    // 1. 删除词汇记录
    const vocabResult = await prisma.vocabulary.deleteMany({});
    console.log(`删除了 ${vocabResult.count} 条词汇记录`);

    // 2. 删除阅读进度
    const progressResult = await prisma.readingProgress.deleteMany({});
    console.log(`删除了 ${progressResult.count} 条阅读进度记录`);

    // 3. 删除书签
    const bookmarkResult = await prisma.bookmark.deleteMany({});
    console.log(`删除了 ${bookmarkResult.count} 条书签记录`);

    // 4. 删除章节内容
    const chapterContentResult = await prisma.chapterContent.deleteMany({});
    console.log(`删除了 ${chapterContentResult.count} 条章节内容记录`);

    // 5. 删除章节
    const chapterResult = await prisma.chapter.deleteMany({});
    console.log(`删除了 ${chapterResult.count} 个章节`);

    // 6. 删除听力历史
    const listeningHistoryResult = await prisma.listeningHistory.deleteMany({});
    console.log(`删除了 ${listeningHistoryResult.count} 条听力历史记录`);

    // 7. 删除听力内容
    const listeningContentResult = await prisma.listeningContent.deleteMany({});
    console.log(`删除了 ${listeningContentResult.count} 条听力内容记录`);

    // 8. 最后删除书籍
    const bookResult = await prisma.book.deleteMany({});
    console.log(`删除了 ${bookResult.count} 本书籍`);

    console.log('\n✅ 测试数据清理完成！');

    // 验证清理结果
    const remainingBooks = await prisma.book.count();
    console.log(`剩余书籍数量: ${remainingBooks}`);

  } catch (error) {
    console.error('❌ 清理过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行清理
cleanupTestData();