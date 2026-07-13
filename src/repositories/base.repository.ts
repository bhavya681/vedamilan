import type { FilterQuery, Model, UpdateQuery } from "mongoose";

import {
  normalizePagination,
  toPaginatedResult,
  type PaginatedResult,
  type PaginationInput,
} from "./pagination";

export class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return doc.toObject() as T;
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id).lean();
    return (doc as T | null) ?? null;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    const doc = await this.model.findOne(filter).lean();
    return (doc as T | null) ?? null;
  }

  async findMany(
    filter: FilterQuery<T> = {},
    pagination: PaginationInput = {},
  ): Promise<PaginatedResult<T>> {
    const { page, limit, skip, sort } = normalizePagination(pagination);
    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    return toPaginatedResult(data as T[], total, page, limit);
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .lean();
    return (doc as T | null) ?? null;
  }

  async softDelete(id: string): Promise<T | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { deletedAt: new Date(), status: "ARCHIVED" }, { new: true })
      .lean();
    return (doc as T | null) ?? null;
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return Boolean(result);
  }

  async aggregate<R = unknown>(pipeline: Record<string, unknown>[]): Promise<R[]> {
    return this.model.aggregate(pipeline as never[]) as Promise<R[]>;
  }
}
