import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const logDir = process.env.LOG_DIR || './logs';

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, context }) => {
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}${stack ? '\n' + stack : ''}`;
  }),
);

// 错误日志传输配置
const errorTransport = new DailyRotateFile({
  filename: `${logDir}/error-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: process.env.LOG_MAX_FILES || '30d',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  format: logFormat,
});

// 组合日志传输配置
const combinedTransport = new DailyRotateFile({
  filename: `${logDir}/combined-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  maxFiles: process.env.LOG_MAX_FILES || '30d',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  format: logFormat,
});

// 控制台传输配置
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, context }) => {
      const contextStr = context ? `[${context}]` : '';
      return `${timestamp} ${level} ${contextStr} ${message}`;
    }),
  ),
});

export const winstonConfig = {
  level: process.env.LOG_LEVEL || 'info',
  transports: [errorTransport, combinedTransport, consoleTransport],
};
