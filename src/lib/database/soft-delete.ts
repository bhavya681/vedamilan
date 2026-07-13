import { Prisma } from "@/generated/prisma/client";

/** Models that intentionally omit soft-delete columns (e.g. Better Auth adapters). */
const MODELS_WITHOUT_SOFT_DELETE = new Set(["Verification"]);

function withActiveFilter<T extends { where?: Record<string, unknown> }>(
  model: string,
  args: T,
): T {
  if (MODELS_WITHOUT_SOFT_DELETE.has(model)) {
    return args;
  }
  return {
    ...args,
    where: {
      deletedAt: null,
      ...args.where,
    },
  };
}

/**
 * Soft-delete filter for Prisma Client extensions.
 * Applied to models that include `deletedAt`. Explicit `where.deletedAt` still wins.
 */
export function softDeleteExtension() {
  return Prisma.defineExtension({
    name: "softDelete",
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          return query(withActiveFilter(model, args));
        },
        async findFirst({ model, args, query }) {
          return query(withActiveFilter(model, args));
        },
        async count({ model, args, query }) {
          return query(withActiveFilter(model, args));
        },
      },
    },
  });
}
