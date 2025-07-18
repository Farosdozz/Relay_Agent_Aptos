import { FilterQuery, PipelineStage } from 'mongoose';

export type FindAllResponse<T> = { count: number; items: T[] };

export interface BaseRepositoryInterface<T> {
  create(dto: T | any): Promise<T>;

  findOneById(id: string, projection?: string): Promise<T>;

  findOneByCondition(condition?: object, projection?: string): Promise<T>;

  findAll(condition: object, options?: object): Promise<FindAllResponse<T>>;

  update(id: string, dto: Partial<T>): Promise<T>;

  softDelete(id: string): Promise<boolean>;

  permanentlyDelete(id: string): Promise<boolean>;

  count(condition: FilterQuery<T>): Promise<number>;

  findAdvanced(filter: PipelineStage[]): Promise<T[] | T>;
}

export interface Write<T> {
  create(item: T | any): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  remove(id: string): Promise<boolean>;
}

export interface Read<T> {
  findAll(filter?: object, options?: object): Promise<FindAllResponse<T>>;
  findOne(id: string): Promise<T>;
}

export interface BaseServiceInterface<T> extends Write<T>, Read<T> {}
