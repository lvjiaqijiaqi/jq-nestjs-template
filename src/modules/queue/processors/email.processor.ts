import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

/**
 * 邮件作业数据接口
 */
export interface EmailJobData {
  to: string | string[];
  from?: string;
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
  variables?: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
}

/**
 * 邮件队列处理器
 */
@Processor('email-queue')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  /**
   * 处理发送邮件作业
   */
  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>) {
    const { data } = job;
    
    try {
      this.logger.log(`Processing email job ${job.id}: ${data.subject} to ${data.to}`);
      
      // 更新作业进度
      await job.progress(10);
      
      // 验证邮件数据
      this.validateEmailData(data);
      await job.progress(30);
      
      // 模拟邮件发送过程
      await this.sendEmail(data);
      await job.progress(80);
      
      // 记录发送结果
      await this.logEmailSent(data);
      await job.progress(100);
      
      this.logger.log(`Email job ${job.id} completed successfully`);
      return { success: true, messageId: `msg_${Date.now()}` };
      
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed:`, error);
      throw error;
    }
  }

  /**
   * 处理批量邮件发送
   */
  @Process('send-bulk-email')
  async handleSendBulkEmail(job: Job<{ emails: EmailJobData[] }>) {
    const { emails } = job.data;
    const results: Array<{
      email: string | string[];
      success: boolean;
      messageId?: string;
      error?: string;
    }> = [];
    
    try {
      this.logger.log(`Processing bulk email job ${job.id}: ${emails.length} emails`);
      
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        
        try {
          await this.sendEmail(email);
          results.push({ 
            email: email.to, 
            success: true, 
            messageId: `msg_${Date.now()}_${i}` 
          });
        } catch (error) {
          results.push({ 
            email: email.to, 
            success: false, 
            error: error.message 
          });
        }
        
        // 更新进度
        const progress = Math.round(((i + 1) / emails.length) * 100);
        await job.progress(progress);
      }
      
      this.logger.log(`Bulk email job ${job.id} completed: ${results.filter(r => r.success).length}/${emails.length} successful`);
      return { results };
      
    } catch (error) {
      this.logger.error(`Bulk email job ${job.id} failed:`, error);
      throw error;
    }
  }

  /**
   * 处理邮件模板渲染
   */
  @Process('render-template')
  async handleRenderTemplate(job: Job<{
    template: string;
    variables: Record<string, any>;
    emailData: Omit<EmailJobData, 'html'>;
  }>) {
    const { template, variables, emailData } = job.data;
    
    try {
      this.logger.log(`Processing template render job ${job.id}: ${template}`);
      
      await job.progress(25);
      
      // 渲染模板
      const html = await this.renderTemplate(template, variables);
      await job.progress(75);
      
      // 发送渲染后的邮件
      await this.sendEmail({ ...emailData, html });
      await job.progress(100);
      
      this.logger.log(`Template render job ${job.id} completed`);
      return { success: true, template, html };
      
    } catch (error) {
      this.logger.error(`Template render job ${job.id} failed:`, error);
      throw error;
    }
  }

  /**
   * 验证邮件数据
   */
  private validateEmailData(data: EmailJobData): void {
    if (!data.to) {
      throw new Error('Recipient email is required');
    }
    
    if (!data.subject) {
      throw new Error('Email subject is required');
    }
    
    if (!data.html && !data.text && !data.template) {
      throw new Error('Email content (html, text, or template) is required');
    }
  }

  /**
   * 发送邮件（模拟实现）
   */
  private async sendEmail(data: EmailJobData): Promise<void> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 这里应该集成真实的邮件服务提供商
    // 例如：SendGrid, AWS SES, Mailgun, 阿里云邮件推送等
    this.logger.debug(`Sending email to ${data.to}: ${data.subject}`);
    
    // 模拟发送失败的情况（10%概率）
    if (Math.random() < 0.1) {
      throw new Error('Simulated email sending failure');
    }
  }

  /**
   * 渲染邮件模板（模拟实现）
   */
  private async renderTemplate(template: string, variables: Record<string, any>): Promise<string> {
    // 模拟模板渲染
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 简单的模板变量替换
    let html = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, String(value));
    }
    
    return html;
  }

  /**
   * 记录邮件发送日志
   */
  private async logEmailSent(data: EmailJobData): Promise<void> {
    // 这里可以将邮件发送记录保存到数据库
    this.logger.log(`Email sent: ${data.subject} to ${data.to}`);
  }
} 