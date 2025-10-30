import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const logDir = process.env.LOG_DIR || 'logs';

// 日志格式配置
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// 控制台输出格式
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('ReadingApp', {
    colors: true,
    prettyPrint: true,
  }),
);

// 创建每日轮转文件传输器
const createDailyRotateTransport = (filename: string, level: string) => {
  return new DailyRotateFile({
    dirname: logDir,
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level,
    format: logFormat,
  });
};

export const winstonConfig = {
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'debug',
    }),
    // 所有日志
    createDailyRotateTransport('application', 'info'),
    // 错误日志
    createDailyRotateTransport('error', 'error'),
    // HTTP 请求日志
    createDailyRotateTransport('http', 'http'),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      dirname: logDir,
      filename: 'exceptions.log',
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      dirname: logDir,
      filename: 'rejections.log',
    }),
  ],
};
