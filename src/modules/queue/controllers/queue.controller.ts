import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { QueueService, QueueType, JobStatus } from '../services/queue.service';
import { EmailJobData } from '../processors/email.processor';
import { FileJobData } from '../processors/file.processor';
import { ResponseDto } from '../../../common/dto/response.dto';
import { RequirePermissions } from '../../auth/decorators/auth.decorators';
import { ApiVersion } from '../../../common/decorators/api-version.decorator';

@ApiTags('队列管理')
@ApiBearerAuth('JWT-auth')
@ApiVersion('1')
@Controller('queues')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('stats')
  @RequirePermissions('queue:read')
  @ApiOperation({
    summary: '获取所有队列统计信息',
    description: '获取所有队列的统计信息，包括等待、活跃、完成、失败的作业数量',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    content: {
      'application/json': {
        example: {
          code: 200,
          message: '获取成功',
          data: {
            email: { waiting: 5, active: 2, completed: 100, failed: 3, delayed: 1, paused: 0 },
            file: { waiting: 0, active: 1, completed: 50, failed: 1, delayed: 0, paused: 0 },
            notification: { waiting: 10, active: 5, completed: 200, failed: 5, delayed: 2, paused: 0 },
            data: { waiting: 2, active: 0, completed: 25, failed: 0, delayed: 0, paused: 0 },
            report: { waiting: 1, active: 0, completed: 10, failed: 0, delayed: 0, paused: 0 }
          }
        }
      }
    }
  })
  async getAllQueueStats(): Promise<ResponseDto> {
    try {
      const stats = await this.queueService.getAllQueueStats();
      return ResponseDto.success(stats, '获取队列统计信息成功');
    } catch (error) {
      return ResponseDto.customError(500, '获取队列统计信息失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Get(':queueType/stats')
  @RequirePermissions('queue:read')
  @ApiOperation({
    summary: '获取指定队列统计信息',
    description: '获取指定队列的详细统计信息',
  })
  @ApiParam({
    name: 'queueType',
    description: '队列类型',
    enum: QueueType,
    example: 'email',
  })
  async getQueueStats(@Param('queueType') queueType: QueueType): Promise<ResponseDto> {
    try {
      const stats = await this.queueService.getQueueStats(queueType);
      return ResponseDto.success(stats, `获取${queueType}队列统计信息成功`);
    } catch (error) {
      return ResponseDto.customError(500, '获取队列统计信息失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Get(':queueType/health')
  @RequirePermissions('queue:read')
  @ApiOperation({
    summary: '获取队列健康状态',
    description: '检查指定队列的健康状态',
  })
  @ApiParam({
    name: 'queueType',
    description: '队列类型',
    enum: QueueType,
    example: 'email',
  })
  async getQueueHealth(@Param('queueType') queueType: QueueType): Promise<ResponseDto> {
    try {
      const health = await this.queueService.getQueueHealth(queueType);
      return ResponseDto.success(health, `获取${queueType}队列健康状态成功`);
    } catch (error) {
      return ResponseDto.customError(500, '获取队列健康状态失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Get(':queueType/jobs')
  @RequirePermissions('queue:read')
  @ApiOperation({
    summary: '获取队列作业列表',
    description: '获取指定队列中的作业列表',
  })
  @ApiParam({
    name: 'queueType',
    description: '队列类型',
    enum: QueueType,
    example: 'email',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '作业状态（多个状态用逗号分隔）',
    example: 'waiting,active',
  })
  @ApiQuery({
    name: 'start',
    required: false,
    description: '开始位置',
    example: 0,
  })
  @ApiQuery({
    name: 'end',
    required: false,
    description: '结束位置',
    example: 50,
  })
  async getQueueJobs(
    @Param('queueType') queueType: QueueType,
    @Query('status') status = 'waiting,active,completed,failed',
    @Query('start') start = 0,
    @Query('end') end = 50,
  ): Promise<ResponseDto> {
    try {
      const statusArray = status.split(',') as JobStatus[];
      const jobs = await this.queueService.getJobs(queueType, statusArray, +start, +end);
      return ResponseDto.success(jobs, `获取${queueType}队列作业列表成功`);
    } catch (error) {
      return ResponseDto.customError(500, '获取队列作业列表失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Post(':queueType/jobs')
  @RequirePermissions('queue:write')
  @ApiOperation({
    summary: '添加作业到队列',
    description: '向指定队列添加新的作业',
  })
  @ApiParam({
    name: 'queueType',
    description: '队列类型',
    enum: QueueType,
    example: 'email',
  })
  @ApiBody({
    description: '作业数据',
    schema: {
      type: 'object',
      properties: {
        jobName: { type: 'string', example: 'send-email' },
        data: { 
          type: 'object',
          example: {
            to: 'user@example.com',
            subject: '测试邮件',
            html: '<p>这是一封测试邮件</p>'
          }
        },
        options: {
          type: 'object',
          properties: {
            delay: { type: 'number', example: 0 },
            attempts: { type: 'number', example: 3 },
            priority: { type: 'number', example: 50 }
          }
        }
      },
      required: ['jobName', 'data']
    }
  })
  async addJob(
    @Param('queueType') queueType: QueueType,
    @Body() body: { jobName: string; data: any; options?: any },
  ): Promise<ResponseDto> {
    try {
      const job = await this.queueService.addJob(queueType, body.jobName, body.data, body.options);
      return ResponseDto.success(
        { jobId: job.id, jobName: body.jobName, queueType },
        `作业已添加到${queueType}队列`,
      );
    } catch (error) {
      return ResponseDto.customError(500, '添加作业失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Post('email/send')
  @RequirePermissions('queue:write')
  @ApiOperation({
    summary: '发送邮件',
    description: '将邮件发送任务添加到邮件队列',
  })
  @ApiBody({
    description: '邮件数据',
    schema: {
      type: 'object',
      properties: {
        to: { 
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } }
          ],
          example: 'user@example.com'
        },
        subject: { type: 'string', example: '欢迎注册' },
        html: { type: 'string', example: '<p>欢迎使用我们的服务！</p>' },
        text: { type: 'string', example: '欢迎使用我们的服务！' },
        template: { type: 'string', example: 'welcome' },
        variables: { 
          type: 'object',
          example: { name: '张三', url: 'https://example.com' }
        },
        priority: { type: 'string', enum: ['high', 'normal', 'low'], example: 'normal' }
      },
      required: ['to', 'subject']
    }
  })
  async sendEmail(@Body() emailData: EmailJobData): Promise<ResponseDto> {
    try {
      const job = await this.queueService.addJob(QueueType.EMAIL, 'send-email', emailData);
      return ResponseDto.success(
        { jobId: job.id, to: emailData.to, subject: emailData.subject },
        '邮件已添加到发送队列',
      );
    } catch (error) {
      return ResponseDto.customError(500, '邮件发送失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Post('files/upload')
  @RequirePermissions('queue:write')
  @ApiOperation({
    summary: '文件上传处理',
    description: '将文件上传任务添加到文件处理队列',
  })
  @ApiBody({
    description: '文件数据',
    schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', example: '/tmp/uploads/file.jpg' },
        fileName: { type: 'string', example: 'photo.jpg' },
        fileType: { type: 'string', example: 'image/jpeg' },
        fileSize: { type: 'number', example: 1048576 },
        userId: { type: 'string', example: 'user123' }
      },
      required: ['filePath', 'fileName', 'fileType', 'fileSize']
    }
  })
  async uploadFile(@Body() fileData: FileJobData): Promise<ResponseDto> {
    try {
      const job = await this.queueService.addJob(QueueType.FILE, 'upload-file', fileData);
      return ResponseDto.success(
        { jobId: job.id, fileName: fileData.fileName },
        '文件已添加到处理队列',
      );
    } catch (error) {
      return ResponseDto.customError(500, '文件上传失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Delete(':queueType/jobs/:jobId')
  @RequirePermissions('queue:write')
  @ApiOperation({
    summary: '删除作业',
    description: '从队列中删除指定的作业',
  })
  @ApiParam({
    name: 'queueType',
    description: '队列类型',
    enum: QueueType,
    example: 'email',
  })
  @ApiParam({
    name: 'jobId',
    description: '作业ID',
    example: '123',
  })
  async removeJob(
    @Param('queueType') queueType: QueueType,
    @Param('jobId') jobId: string,
  ): Promise<ResponseDto> {
    try {
      await this.queueService.removeJob(queueType, jobId);
      return ResponseDto.success(null, `作业${jobId}已从${queueType}队列删除`);
    } catch (error) {
      return ResponseDto.customError(500, '删除作业失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Post(':queueType/jobs/:jobId/retry')
  @RequirePermissions('queue:write')
  @ApiOperation({
    summary: '重试作业',
    description: '重试失败的作业',
  })
  @ApiParam({
    name: 'queueType',
    description: '队列类型',
    enum: QueueType,
    example: 'email',
  })
  @ApiParam({
    name: 'jobId',
    description: '作业ID',
    example: '123',
  })
  async retryJob(
    @Param('queueType') queueType: QueueType,
    @Param('jobId') jobId: string,
  ): Promise<ResponseDto> {
    try {
      await this.queueService.retryJob(queueType, jobId);
      return ResponseDto.success(null, `作业${jobId}已重新添加到${queueType}队列`);
    } catch (error) {
      return ResponseDto.customError(500, '重试作业失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Post(':queueType/pause')
  @RequirePermissions('queue:admin')
  @ApiOperation({
    summary: '暂停队列',
    description: '暂停指定队列的处理',
  })
  @ApiParam({
    name: 'queueType',
    description: '队列类型',
    enum: QueueType,
    example: 'email',
  })
  async pauseQueue(@Param('queueType') queueType: QueueType): Promise<ResponseDto> {
    try {
      await this.queueService.pauseQueue(queueType);
      return ResponseDto.success(null, `${queueType}队列已暂停`);
    } catch (error) {
      return ResponseDto.customError(500, '暂停队列失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Post(':queueType/resume')
  @RequirePermissions('queue:admin')
  @ApiOperation({
    summary: '恢复队列',
    description: '恢复指定队列的处理',
  })
  @ApiParam({
    name: 'queueType',
    description: '队列类型',
    enum: QueueType,
    example: 'email',
  })
  async resumeQueue(@Param('queueType') queueType: QueueType): Promise<ResponseDto> {
    try {
      await this.queueService.resumeQueue(queueType);
      return ResponseDto.success(null, `${queueType}队列已恢复`);
    } catch (error) {
      return ResponseDto.customError(500, '恢复队列失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Delete(':queueType/clean')
  @RequirePermissions('queue:admin')
  @ApiOperation({
    summary: '清空队列',
    description: '清空指定队列中的所有作业',
  })
  @ApiParam({
    name: 'queueType',
    description: '队列类型',
    enum: QueueType,
    example: 'email',
  })
  async cleanQueue(@Param('queueType') queueType: QueueType): Promise<ResponseDto> {
    try {
      await this.queueService.cleanQueue(queueType);
      return ResponseDto.success(null, `${queueType}队列已清空`);
    } catch (error) {
      return ResponseDto.customError(500, '清空队列失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Delete(':queueType/cleanup')
  @RequirePermissions('queue:admin')
  @ApiOperation({
    summary: '清理队列',
    description: '清理队列中已完成或失败的作业',
  })
  @ApiParam({
    name: 'queueType',
    description: '队列类型',
    enum: QueueType,
    example: 'email',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '清理类型',
    enum: ['completed', 'failed'],
    example: 'completed',
  })
  @ApiQuery({
    name: 'grace',
    required: false,
    description: '保留时间（毫秒）',
    example: 3600000,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '清理数量限制',
    example: 100,
  })
  async cleanupJobs(
    @Param('queueType') queueType: QueueType,
    @Query('type') type: 'completed' | 'failed' = 'completed',
    @Query('grace') grace = 3600000, // 1小时
    @Query('limit') limit = 100,
  ): Promise<ResponseDto> {
    try {
      const cleaned = await this.queueService.cleanupJobs(queueType, +grace, +limit, type);
      return ResponseDto.success(
        { cleaned, type },
        `${queueType}队列清理完成，清理了${cleaned}个${type}作业`,
      );
    } catch (error) {
      return ResponseDto.customError(500, '清理队列失败', undefined, undefined, {
        error: error.message,
      });
    }
  }
} 