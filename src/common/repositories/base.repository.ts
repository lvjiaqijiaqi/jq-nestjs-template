import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  DeepPartial,
  FindOneOptions,
  DeleteResult,
  UpdateResult,
} from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';

export abstract class BaseRepository<T extends BaseEntity> {
  protected constructor(protected readonly repository: Repository<T>) {}

  /**
   * 创建实体
   * @param entityData 实体数据
   * @param userId 操作用户ID
   */
  async create(entityData: DeepPartial<T>, userId?: string): Promise<T> {
    const entity = this.repository.create({
      ...entityData,
      createdBy: userId,
      updatedBy: userId,
    } as DeepPartial<T>);
    return await this.repository.save(entity);
  }

  /**
   * 批量创建实体
   * @param entitiesData 实体数据数组
   * @param userId 操作用户ID
   */
  async createMany(
    entitiesData: DeepPartial<T>[],
    userId?: string,
  ): Promise<T[]> {
    const entities = entitiesData.map((data) =>
      this.repository.create({
        ...data,
        createdBy: userId,
        updatedBy: userId,
      } as DeepPartial<T>),
    );
    return await this.repository.save(entities);
  }

  /**
   * 根据ID查找实体
   * @param id 实体ID
   * @param options 查找选项
   */
  async findById(id: string, options?: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      ...options,
    });
  }

  /**
   * 根据条件查找单个实体
   * @param where 查找条件
   * @param options 查找选项
   */
  async findOne(
    where: FindOptionsWhere<T>,
    options?: FindOneOptions<T>,
  ): Promise<T | null> {
    return await this.repository.findOne({
      where,
      ...options,
    });
  }

  /**
   * 根据条件查找多个实体
   * @param options 查找选项
   */
  async findMany(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  /**
   * 分页查询
   * @param paginationDto 分页参数
   * @param options 查找选项
   */
  async findWithPagination(
    paginationDto: PaginationDto,
    options?: FindManyOptions<T>,
  ): Promise<PaginatedResponseDto<T>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip,
      take: limit,
    });

    return new PaginatedResponseDto(data, page, limit, total);
  }

  /**
   * 更新实体
   * @param id 实体ID
   * @param updateData 更新数据
   * @param userId 操作用户ID
   */
  async update(
    id: string,
    updateData: DeepPartial<T>,
    userId?: string,
  ): Promise<T | null> {
    await this.repository.update(id, {
      ...updateData,
      updatedBy: userId,
    } as any);
    return await this.findById(id);
  }

  /**
   * 批量更新
   * @param where 更新条件
   * @param updateData 更新数据
   * @param userId 操作用户ID
   */
  async updateMany(
    where: FindOptionsWhere<T>,
    updateData: DeepPartial<T>,
    userId?: string,
  ): Promise<UpdateResult> {
    return await this.repository.update(where, {
      ...updateData,
      updatedBy: userId,
    } as any);
  }

  /**
   * 软删除实体
   * @param id 实体ID
   */
  async softDelete(id: string): Promise<UpdateResult> {
    return await this.repository.softDelete(id);
  }

  /**
   * 批量软删除
   * @param ids 实体ID数组
   */
  async softDeleteMany(ids: string[]): Promise<UpdateResult> {
    return await this.repository.softDelete(ids);
  }

  /**
   * 永久删除实体
   * @param id 实体ID
   */
  async delete(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }

  /**
   * 批量永久删除
   * @param ids 实体ID数组
   */
  async deleteMany(ids: string[]): Promise<DeleteResult> {
    return await this.repository.delete(ids);
  }

  /**
   * 恢复软删除的实体
   * @param id 实体ID
   */
  async restore(id: string): Promise<UpdateResult> {
    return await this.repository.restore(id);
  }

  /**
   * 检查实体是否存在
   * @param where 查找条件
   */
  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  /**
   * 统计实体数量
   * @param where 查找条件
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.count({ where });
  }

  /**
   * 获取原始Repository实例
   */
  getRepository(): Repository<T> {
    return this.repository;
  }
}
