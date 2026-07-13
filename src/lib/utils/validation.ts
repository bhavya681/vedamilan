import { type ZodType } from "zod";
import { fromError } from "zod-validation-error";

import { ValidationError } from "@/lib/utils/error-handler";

export function parseOrThrow<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(fromError(result.error).message, result.error.flatten());
  }
  return result.data;
}

export function parseSafe<T>(
  schema: ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: fromError(result.error).message,
    };
  }
  return {
    success: true,
    data: result.data,
  };
}
