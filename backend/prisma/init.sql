-- 初始化 SQL 脚本
-- 此文件会在 PostgreSQL 容器首次启动时自动执行

-- 创建数据库（如果不存在）
SELECT 'CREATE DATABASE reading_app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'reading_app')\gexec

-- 设置时区
SET timezone = 'Asia/Shanghai';

-- 创建扩展（如果需要）
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 打印初始化信息
DO $$
BEGIN
  RAISE NOTICE '数据库初始化完成';
END
$$;

