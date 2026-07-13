export type ThemeMode = "light" | "dark" | "system";

export type UserRole = "member" | "premium" | "moderator" | "admin";

export type ApiResult<T> =
  { success: true; data: T } | { success: false; error: { code: string; message: string } };

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type FeatureMeta = {
  readonly name: string;
  readonly description: string;
};
