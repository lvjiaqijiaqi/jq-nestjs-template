import { registerAs } from '@nestjs/config';
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export default registerAs('logger', (): WinstonModuleOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL || 'info';

  // 日志格式配置
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf((info) => {
      const { timestamp, level, message, context, trace, ...meta } = info;
      const logObject: Record<string, any> = {
        timestamp,
        level,
        message,
        context,
      };
      
      if (trace) {
        logObject.trace = trace;
      }
      
      if (Object.keys(meta).length > 0) {
        logObject.meta = meta;
      }
      
      return JSON.stringify(logObject);
    }),
  );

  // 开发环境格式
  const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, context }) => {
      const contextString = context ? `[${context}]` : '';
      return `${timestamp} ${level} ${contextString} ${message}`;
    }),
  );

  // 传输器配置
  const transports: winston.transport[] = [];

  // 控制台输出
  transports.push(
    new winston.transports.Console({
      level: logLevel,
      format: nodeEnv === 'development' ? devFormat : logFormat,
    }),
  );

  // 生产环境文件日志
  if (nodeEnv === 'production') {
    // 错误日志
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    );

    // 所有日志
    transports.push(
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 10,
      }),
    );
  }

  return {
    level: logLevel,
    format: logFormat,
    transports,
    // 退出时不等待日志完成
    exitOnError: false,
    // 异常处理
    exceptionHandlers: [
      new winston.transports.File({ 
        filename: 'logs/exceptions.log',
        format: logFormat,
      }),
    ],
    // 拒绝处理
    rejectionHandlers: [
      new winston.transports.File({ 
        filename: 'logs/rejections.log',
        format: logFormat,
      }),
    ],
  };
}); 