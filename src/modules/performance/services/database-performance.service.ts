import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * 数据库性能指标接口
 */
export interface DatabasePerformanceMetrics {
  connectionPool: {
    active: number;
    idle: number;
    total: number;
    waiting: number;
  };
  queryStats: {
    totalQueries: number;
    slowQueries: number;
    averageQueryTime: number;
    queryTimeDistribution: {
      fast: number; // < 100ms
      medium: number; // 100ms - 1s
      slow: number; // > 1s
    };
  };
  memoryUsage: {
    bufferPoolSize: number;
    usedMemory: number;
    freeMemory: number;
  };
  tableStats: Array<{
    tableName: string;
    rowCount: number;
    dataSize: number;
    indexSize: number;
    lastUpdated: Date;
  }>;
  indexUsage: Array<{
    tableName: string;
    indexName: string;
    usageCount: number;
    efficiency: number;
  }>;
}

/**
 * 慢查询信息接口
 */
export interface SlowQueryInfo {
  query: string;
  executionTime: number;
  timestamp: Date;
  parameters?: any[];
  stackTrace?: string;
}

/**
 * 数据库健康状态
 */
export interface DatabaseHealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastError?: string;
  metrics: DatabasePerformanceMetrics;
  recommendations: string[];
}

@Injectable()
export class DatabasePerformanceService {
  private readonly logger = new Logger(DatabasePerformanceService.name);
  private slowQueries: SlowQueryInfo[] = [];
  private queryStats = {
    totalQueries: 0,
    totalTime: 0,
    slowQueryThreshold: 1000, // 1秒
  };

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private configService: ConfigService,
  ) {
    this.setupQueryLogging();
  }

  /**
   * 获取数据库性能指标
   */
  async getPerformanceMetrics(): Promise<DatabasePerformanceMetrics> {
    try {
      const [
        connectionPool,
        queryStats,
        memoryUsage,
        tableStats,
        indexUsage,
      ] = await Promise.all([
        this.getConnectionPoolStats(),
        this.getQueryStats(),
        this.getMemoryUsage(),
        this.getTableStats(),
        this.getIndexUsage(),
      ]);

      return {
        connectionPool,
        queryStats,
        memoryUsage,
        tableStats,
        indexUsage,
      };
    } catch (error) {
      this.logger.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  /**
   * 获取数据库健康状态
   */
  async getHealthStatus(): Promise<DatabaseHealthStatus> {
    try {
      const metrics = await this.getPerformanceMetrics();
      const recommendations: string[] = [];
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';

      // 检查连接池状态
      const poolUsage = metrics.connectionPool.active / metrics.connectionPool.total;
      if (poolUsage > 0.9) {
        status = 'critical';
        recommendations.push('连接池使用率过高，建议增加连接池大小');
      } else if (poolUsage > 0.7) {
        status = 'warning';
        recommendations.push('连接池使用率较高，请监控连接使用情况');
      }

      // 检查慢查询
      if (metrics.queryStats.slowQueries > 10) {
        status = status === 'critical' ? 'critical' : 'warning';
        recommendations.push('慢查询数量较多，建议优化SQL语句和添加索引');
      }

      // 检查平均查询时间
      if (metrics.queryStats.averageQueryTime > 500) {
        status = status === 'critical' ? 'critical' : 'warning';
        recommendations.push('平均查询时间过长，建议优化数据库查询');
      }

      return {
        status,
        uptime: process.uptime(),
        metrics,
        recommendations,
      };
    } catch (error) {
      this.logger.error('Failed to get health status:', error);
      return {
        status: 'critical',
        uptime: 0,
        lastError: error.message,
        metrics: {} as any,
        recommendations: ['数据库连接失败，请检查数据库服务状态'],
      };
    }
  }

  /**
   * 获取慢查询列表
   */
  getSlowQueries(limit = 50): SlowQueryInfo[] {
    return this.slowQueries
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  /**
   * 清除慢查询记录
   */
  clearSlowQueries(): void {
    this.slowQueries = [];
    this.logger.log('Slow queries cleared');
  }

  /**
   * 分析表性能
   */
  async analyzeTablePerformance(tableName: string): Promise<{
    rowCount: number;
    dataSize: number;
    indexSize: number;
    unusedIndexes: string[];
    recommendations: string[];
  }> {
    try {
      const dbType = this.configService.get('database.type');
      let query: string;
      let sizeQuery: string;

      if (dbType === 'mysql') {
        query = `
          SELECT 
            table_rows as rowCount,
            ROUND(((data_length + index_length) / 1024 / 1024), 2) as totalSizeMB,
            ROUND((data_length / 1024 / 1024), 2) as dataSizeMB,
            ROUND((index_length / 1024 / 1024), 2) as indexSizeMB
          FROM information_schema.TABLES 
          WHERE table_schema = DATABASE() 
          AND table_name = ?
        `;
      } else {
        // PostgreSQL查询
        query = `
          SELECT 
            reltuples::BIGINT as rowCount,
            pg_size_pretty(pg_total_relation_size(C.oid)) as totalSize,
            pg_size_pretty(pg_relation_size(C.oid)) as dataSize,
            pg_size_pretty(pg_total_relation_size(C.oid) - pg_relation_size(C.oid)) as indexSize
          FROM pg_class C
          LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
          WHERE nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
          AND C.relkind = 'r'
          AND C.relname = $1
        `;
      }

      const result = await this.dataSource.query(query, [tableName]);
      const tableInfo = result[0];

      if (!tableInfo) {
        throw new Error(`Table ${tableName} not found`);
      }

      const recommendations: string[] = [];
      
      // 分析并提供建议
      if (tableInfo.rowCount > 1000000) {
        recommendations.push('表数据量较大，考虑分区或归档历史数据');
      }

      if (tableInfo.indexSizeMB > tableInfo.dataSizeMB) {
        recommendations.push('索引大小超过数据大小，检查是否有冗余索引');
      }

      return {
        rowCount: parseInt(tableInfo.rowCount || '0'),
        dataSize: parseFloat(tableInfo.dataSizeMB || '0'),
        indexSize: parseFloat(tableInfo.indexSizeMB || '0'),
        unusedIndexes: [], // 需要更复杂的查询来获取
        recommendations,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 获取连接池统计
   */
  private async getConnectionPoolStats() {
    // 这里需要根据实际的数据库连接池实现来获取统计信息
    // TypeORM没有直接暴露连接池统计，这里返回模拟数据
    const maxConnections = this.configService.get('database.extra.connectionLimit', 10);
    
    return {
      active: 2, // 活跃连接数
      idle: 3,   // 空闲连接数
      total: maxConnections,
      waiting: 0, // 等待连接数
    };
  }

  /**
   * 获取查询统计
   */
  private getQueryStats() {
    const totalQueries = this.queryStats.totalQueries;
    const averageTime = totalQueries > 0 ? this.queryStats.totalTime / totalQueries : 0;
    
    return {
      totalQueries,
      slowQueries: this.slowQueries.length,
      averageQueryTime: Math.round(averageTime),
      queryTimeDistribution: {
        fast: Math.floor(totalQueries * 0.7),   // 假设70%是快查询
        medium: Math.floor(totalQueries * 0.25), // 25%是中等查询
        slow: Math.floor(totalQueries * 0.05),   // 5%是慢查询
      },
    };
  }

  /**
   * 获取内存使用情况
   */
  private async getMemoryUsage() {
    try {
      const dbType = this.configService.get('database.type');
      let query: string;

      if (dbType === 'mysql') {
        query = "SHOW VARIABLES LIKE 'innodb_buffer_pool_size'";
      } else {
        // PostgreSQL
        query = "SELECT setting FROM pg_settings WHERE name = 'shared_buffers'";
      }

      const result = await this.dataSource.query(query);
      
      return {
        bufferPoolSize: 128 * 1024 * 1024, // 128MB 默认值
        usedMemory: 64 * 1024 * 1024,      // 64MB 模拟值
        freeMemory: 64 * 1024 * 1024,      // 64MB 模拟值
      };
    } catch (error) {
      this.logger.warn('Failed to get memory usage:', error);
      return {
        bufferPoolSize: 0,
        usedMemory: 0,
        freeMemory: 0,
      };
    }
  }

  /**
   * 获取表统计信息
   */
  private async getTableStats() {
    try {
      const dbType = this.configService.get('database.type');
      let query: string;

      if (dbType === 'mysql') {
        query = `
          SELECT 
            table_name as tableName,
            table_rows as rowCount,
            ROUND((data_length / 1024 / 1024), 2) as dataSize,
            ROUND((index_length / 1024 / 1024), 2) as indexSize,
            update_time as lastUpdated
          FROM information_schema.TABLES 
          WHERE table_schema = DATABASE()
          ORDER BY (data_length + index_length) DESC
          LIMIT 10
        `;
      } else {
        // PostgreSQL查询
        query = `
          SELECT 
            schemaname,
            tablename as "tableName",
            n_tup_ins + n_tup_upd + n_tup_del as "rowCount",
            pg_relation_size(schemaname||'.'||tablename) / 1024 / 1024 as "dataSize",
            (pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) / 1024 / 1024 as "indexSize"
          FROM pg_stat_user_tables
          ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
          LIMIT 10
        `;
      }

      const result = await this.dataSource.query(query);
      
      return result.map((row: any) => ({
        tableName: row.tableName || row.table_name,
        rowCount: parseInt(row.rowCount || '0'),
        dataSize: parseFloat(row.dataSize || '0'),
        indexSize: parseFloat(row.indexSize || '0'),
        lastUpdated: row.lastUpdated || new Date(),
      }));
    } catch (error) {
      this.logger.warn('Failed to get table stats:', error);
      return [];
    }
  }

  /**
   * 获取索引使用情况
   */
  private async getIndexUsage() {
    try {
      // 这里需要根据数据库类型实现具体的索引使用统计查询
      // 由于复杂性，这里返回空数组
      return [];
    } catch (error) {
      this.logger.warn('Failed to get index usage:', error);
      return [];
    }
  }

  /**
   * 设置查询日志记录
   */
  private setupQueryLogging() {
    if (!this.configService.get('app.features.queryLogging')) {
      return;
    }

    // 这里需要拦截TypeORM的查询执行
    // 由于TypeORM的限制，这里提供一个简化的实现
    const originalQuery = this.dataSource.query.bind(this.dataSource);
    
    this.dataSource.query = async (query: string, parameters?: any[]) => {
      const startTime = Date.now();
      
      try {
        const result = await originalQuery(query, parameters);
        const executionTime = Date.now() - startTime;
        
        // 更新统计
        this.queryStats.totalQueries++;
        this.queryStats.totalTime += executionTime;
        
        // 记录慢查询
        if (executionTime > this.queryStats.slowQueryThreshold) {
          this.slowQueries.push({
            query: query.substring(0, 500), // 限制长度
            executionTime,
            timestamp: new Date(),
            parameters,
          });
          
          // 保持慢查询列表大小
          if (this.slowQueries.length > 1000) {
            this.slowQueries = this.slowQueries.slice(-500);
          }
          
          this.logger.warn(`Slow query detected (${executionTime}ms): ${query.substring(0, 100)}...`);
        }
        
        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;
        this.logger.error(`Query failed (${executionTime}ms): ${query.substring(0, 100)}...`, error);
        throw error;
      }
    };
  }
} 