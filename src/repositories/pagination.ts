export type PaginationInput = {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
};

export type PaginatedResult<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export function normalizePagination(input: PaginationInput = {}) {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(100, Math.max(1, input.limit ?? 20));
  const skip = (page - 1) * limit;
  const sort = input.sort ?? { createdAt: -1 as const };
  return { page, limit, skip, sort };
}

export function toPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    data,
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
