import {
  FilterQuery,
  Model,
  PipelineStage,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { BaseSchema } from '../schema/base.schema';
import { BaseRepositoryInterface, FindAllResponse } from './base.interface';

export abstract class BaseRepository<T extends BaseSchema>
  implements BaseRepositoryInterface<T>
{
  protected constructor(private readonly model: Model<T>) {
    this.model = model;
  }

  async create(dto: T | any): Promise<T> {
    const created_data = await this.model.create(dto);
    return created_data;
  }

  async bulkWrite(bulkOperations: any, ordered = false): Promise<any> {
    return await this.model.bulkWrite(bulkOperations, { ordered });
  }

  async findOneById(id: string): Promise<T> {
    const item = await this.model.findById(id);
    return item.deletedAt ? null : item;
  }

  async findOneByCondition(condition = {}, options = {}): Promise<T> {
    return await this.model.findOne(
      {
        ...condition,
        deletedAt: null,
      },
      {},
      options,
    );
  }

  async findOneByConditionAndSelect(
    condition = {},
    selects: string[],
  ): Promise<T> {
    return await this.model
      .findOne({
        ...condition,
        deletedAt: null,
      })
      .select(selects)
      .exec();
  }

  async findAll(
    condition: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<FindAllResponse<T>> {
    const [count, items] = await Promise.all([
      this.model.countDocuments({ ...condition, deletedAt: null }).exec(),
      this.model
        .find({ ...condition, deletedAt: null }, options?.projection, options)
        .exec(),
    ]);
    return {
      count,
      items,
    };
  }

  async findOneAndUpdate(
    condition: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: QueryOptions = { new: true },
  ): Promise<T> {
    // The 'new: true' option means the method will return the updated document.
    // You can adjust the default options as necessary for your use case.
    const updatedDocument = await this.model.findOneAndUpdate(
      { ...condition, deletedAt: null },
      update,
      options,
    );
    return updatedDocument;
  }

  async update(id: string, dto: Partial<T>): Promise<T> {
    return await this.model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      dto,
      { new: true },
    );
  }

  async updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
  ): Promise<any> {
    return this.model.updateMany(filter, update, { new: true });
  }

  async softDelete(id: string): Promise<boolean> {
    const delete_item = await this.model.findById(id);
    if (!delete_item) {
      return false;
    }

    return !!(await this.model
      .findByIdAndUpdate<T>(id, { deletedAt: new Date() })
      .exec());
  }

  async permanentlyDelete(id: string): Promise<boolean> {
    const delete_item = await this.model.findById(id);
    if (!delete_item) {
      return false;
    }
    return !!(await this.model.findByIdAndDelete(id));
  }

  async count(condition: FilterQuery<T>): Promise<number> {
    return await this.model
      .countDocuments({ ...condition, deletedAt: null })
      .exec();
  }

  async findAdvanced(filter: PipelineStage[]): Promise<T | T[]> {
    return await this.model.aggregate(filter).exec();
  }

  async findAdvancedWithCount(filter: PipelineStage[]): Promise<any> {
    return await this.model.aggregate(filter).exec();
  }

  async insertMany(docs: T[]): Promise<T[]> {
    return await this.model.insertMany(docs);
  }
}
