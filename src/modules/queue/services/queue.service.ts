import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job, JobOptions } from 'bull';
import { ConfigService } from '@nestjs/config';

/**
 * 队列类型枚举
 */
export enum QueueType {
  EMAIL = 'email',
  FILE = 'file',
  NOTIFICATION = 'notification',
  DATA = 'data',
  REPORT = 'report',
}

/**
 * 作业优先级枚举
 */
export enum JobPriority {
  HIGH = 100,
  NORMAL = 50,
  LOW = 10,
}

/**
 * 作业状态枚举
 */
export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused',
}

/**
 * 队列统计接口
 */
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

/**
 * 作业信息接口
 */
export interface JobInfo {
  id: string | number;
  name: string;
  data: any;
  opts: JobOptions;
  progress: number;
  delay: number;
  timestamp: number;
  attemptsMade: number;
  failedReason?: string;
  finishedOn?: number;
  processedOn?: number;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('email-queue') private emailQueue: Queue,
    @InjectQueue('file-queue') private fileQueue: Queue,
    @InjectQueue('notification-queue') private notificationQueue: Queue,
    @InjectQueue('data-queue') private dataQueue: Queue,
    @InjectQueue('report-queue') private reportQueue: Queue,
    private configService: ConfigService,
  ) {}

  /**
   * 获取指定类型的队列
   */
  private getQueue(type: QueueType): Queue {
    switch (type) {
      case QueueType.EMAIL:
        return this.emailQueue;
      case QueueType.FILE:
        return this.fileQueue;
      case QueueType.NOTIFICATION:
        return this.notificationQueue;
      case QueueType.DATA:
        return this.dataQueue;
      case QueueType.REPORT:
        return this.reportQueue;
      default:
        throw new Error(`Unsupported queue type: ${type}`);
    }
  }

  /**
   * 添加作业到队列
   */
  async addJob(
    queueType: QueueType,
    jobName: string,
    data: any,
    options?: JobOptions,
  ): Promise<Job> {
    try {
      const queue = this.getQueue(queueType);
      const job = await queue.add(jobName, data, options);
      
      this.logger.log(`Job added to ${queueType} queue: ${jobName} (ID: ${job.id})`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add job to ${queueType} queue:`, error);
      throw error;
    }
  }

  /**
   * 添加延迟作业
   */
  async addDelayedJob(
    queueType: QueueType,
    jobName: string,
    data: any,
    delay: number,
    options?: JobOptions,
  ): Promise<Job> {
    return this.addJob(queueType, jobName, data, { ...options, delay });
  }

  /**
   * 添加定时作业
   */
  async addScheduledJob(
    queueType: QueueType,
    jobName: string,
    data: any,
    scheduledFor: Date,
    options?: JobOptions,
  ): Promise<Job> {
    const delay = scheduledFor.getTime() - Date.now();
    if (delay <= 0) {
      throw new Error('Scheduled time must be in the future');
    }
    return this.addDelayedJob(queueType, jobName, data, delay, options);
  }

  /**
   * 添加重复作业（Cron）
   */
  async addRepeatableJob(
    queueType: QueueType,
    jobName: string,
    data: any,
    cronExpression: string,
    options?: JobOptions,
  ): Promise<Job> {
    const repeatOptions = {
      ...options,
      repeat: { cron: cronExpression },
    };
    return this.addJob(queueType, jobName, data, repeatOptions);
  }

  /**
   * 获取作业
   */
  async getJob(queueType: QueueType, jobId: string | number): Promise<Job | null> {
    try {
      const queue = this.getQueue(queueType);
      return await queue.getJob(jobId);
    } catch (error) {
      this.logger.error(`Failed to get job ${jobId} from ${queueType} queue:`, error);
      return null;
    }
  }

  /**
   * 移除作业
   */
  async removeJob(queueType: QueueType, jobId: string | number): Promise<void> {
    try {
      const job = await this.getJob(queueType, jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Job ${jobId} removed from ${queueType} queue`);
      }
    } catch (error) {
      this.logger.error(`Failed to remove job ${jobId} from ${queueType} queue:`, error);
      throw error;
    }
  }

  /**
   * 重试失败的作业
   */
  async retryJob(queueType: QueueType, jobId: string | number): Promise<void> {
    try {
      const job = await this.getJob(queueType, jobId);
      if (job) {
        await job.retry();
        this.logger.log(`Job ${jobId} retried in ${queueType} queue`);
      }
    } catch (error) {
      this.logger.error(`Failed to retry job ${jobId} in ${queueType} queue:`, error);
      throw error;
    }
  }

  /**
   * 获取队列统计信息
   */
  async getQueueStats(queueType: QueueType): Promise<QueueStats> {
    try {
      const queue = this.getQueue(queueType);
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

      // 检查队列是否暂停
      const isPaused = await queue.isPaused();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        paused: isPaused ? 1 : 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get stats for ${queueType} queue:`, error);
      throw error;
    }
  }

  /**
   * 获取队列中的作业列表
   */
  async getJobs(
    queueType: QueueType,
    status: JobStatus[],
    start = 0,
    end = 100,
  ): Promise<JobInfo[]> {
    try {
      const queue = this.getQueue(queueType);
      const jobs = await queue.getJobs(status, start, end);
      
      return jobs.map(job => ({
        id: job.id,
        name: job.name,
        data: job.data,
        opts: job.opts,
        progress: job.progress(),
        delay: job.opts.delay || 0,
        timestamp: job.timestamp,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        finishedOn: job.finishedOn,
        processedOn: job.processedOn,
      }));
    } catch (error) {
      this.logger.error(`Failed to get jobs from ${queueType} queue:`, error);
      throw error;
    }
  }

  /**
   * 暂停队列
   */
  async pauseQueue(queueType: QueueType): Promise<void> {
    try {
      const queue = this.getQueue(queueType);
      await queue.pause();
      this.logger.log(`Queue ${queueType} paused`);
    } catch (error) {
      this.logger.error(`Failed to pause ${queueType} queue:`, error);
      throw error;
    }
  }

  /**
   * 恢复队列
   */
  async resumeQueue(queueType: QueueType): Promise<void> {
    try {
      const queue = this.getQueue(queueType);
      await queue.resume();
      this.logger.log(`Queue ${queueType} resumed`);
    } catch (error) {
      this.logger.error(`Failed to resume ${queueType} queue:`, error);
      throw error;
    }
  }

  /**
   * 清空队列
   */
  async cleanQueue(queueType: QueueType, grace = 0): Promise<void> {
    try {
      const queue = this.getQueue(queueType);
      await queue.empty();
      this.logger.log(`Queue ${queueType} cleaned`);
    } catch (error) {
      this.logger.error(`Failed to clean ${queueType} queue:`, error);
      throw error;
    }
  }

  /**
   * 清理已完成/失败的作业
   */
  async cleanupJobs(
    queueType: QueueType,
    grace = 0,
    limit = 100,
    type: 'completed' | 'failed' = 'completed',
  ): Promise<number> {
    try {
      const queue = this.getQueue(queueType);
      const cleaned = await queue.clean(grace, type, limit);
      
      this.logger.log(`Cleaned ${cleaned.length} ${type} jobs from ${queueType} queue`);
      return cleaned.length;
    } catch (error) {
      this.logger.error(`Failed to cleanup ${type} jobs from ${queueType} queue:`, error);
      throw error;
    }
  }

  /**
   * 获取所有队列的统计信息
   */
  async getAllQueueStats(): Promise<Record<QueueType, QueueStats>> {
    const stats: Record<QueueType, QueueStats> = {} as any;
    
    for (const queueType of Object.values(QueueType)) {
      try {
        stats[queueType] = await this.getQueueStats(queueType);
      } catch (error) {
        this.logger.error(`Failed to get stats for ${queueType}:`, error);
        stats[queueType] = {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
          paused: 0,
        };
      }
    }
    
    return stats;
  }

  /**
   * 检查队列健康状态
   */
  async getQueueHealth(queueType: QueueType): Promise<{
    status: 'healthy' | 'unhealthy';
    stats: QueueStats;
    errors: string[];
  }> {
    const errors: string[] = [];
    let status: 'healthy' | 'unhealthy' = 'healthy';

    try {
      const stats = await this.getQueueStats(queueType);
      
      // 检查是否有太多失败的作业
      if (stats.failed > 50) {
        errors.push(`Too many failed jobs: ${stats.failed}`);
        status = 'unhealthy';
      }
      
      // 检查是否有太多等待的作业
      if (stats.waiting > 1000) {
        errors.push(`Too many waiting jobs: ${stats.waiting}`);
        status = 'unhealthy';
      }

      return { status, stats, errors };
    } catch (error) {
      return {
        status: 'unhealthy',
        stats: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0 },
        errors: [`Queue error: ${error.message}`],
      };
    }
  }
} 