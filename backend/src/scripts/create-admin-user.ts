import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // 检查是否已存在管理员用户（通过邮箱判断）
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@reading-app.com' },
    });

    if (existingAdmin) {
      console.log('管理员用户已存在:', existingAdmin.email);
      return;
    }

    // 创建管理员用户
    const adminEmail = 'admin@reading-app.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        nickname: 'admin',
        avatar: null,
        credential: {
          create: {
            passwordHash: hashedPassword,
          },
        },
      },
    });

    console.log('✅ 管理员用户创建成功!');
    console.log('📧 邮箱:', adminEmail);
    console.log('👤 用户名:', 'admin');
    console.log('🔑 密码:', adminPassword);
    console.log('🆔 用户ID:', admin.id);
  } catch (error) {
    console.error('❌ 创建管理员用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
