/**
 * Prisma 客户端 Mock
 */

export const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  book: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  chapter: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  chapterContent: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  vocabulary: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  readingProgress: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
  userLexileHistory: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  listeningContent: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  bookmark: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

/**
 * 重置所有 Mock
 */
export function resetPrismaServiceMock() {
  Object.keys(mockPrismaService).forEach((key) => {
    if (typeof mockPrismaService[key] === 'object') {
      Object.keys(mockPrismaService[key]).forEach((method) => {
        if (jest.isMockFunction(mockPrismaService[key][method])) {
          mockPrismaService[key][method].mockReset();
        }
      });
    } else if (jest.isMockFunction(mockPrismaService[key])) {
      mockPrismaService[key].mockReset();
    }
  });
}
