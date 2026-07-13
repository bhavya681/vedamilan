import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { fromError } from "zod-validation-error";

import { errorResponse } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super("NOT_FOUND", message, 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super("UNAUTHORIZED", message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super("CONFLICT", message, 409, details);
    this.name = "ConflictError";
  }
}

export function toApiError(error: unknown): {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
} {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof ZodError) {
    const formatted = fromError(error);
    return {
      code: "VALIDATION_ERROR",
      message: formatted.message,
      statusCode: 400,
      details: error.flatten(),
    };
  }

  if (error instanceof Error) {
    return {
      code: "INTERNAL_ERROR",
      message: error.message || "An unexpected error occurred",
      statusCode: 500,
    };
  }

  return {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    statusCode: 500,
  };
}

export function handleRouteError(error: unknown): NextResponse {
  const parsed = toApiError(error);

  if (parsed.statusCode >= 500) {
    logger.error({ err: error }, "Unhandled route error");
  } else {
    logger.warn({ err: error, code: parsed.code }, "Handled route error");
  }

  return errorResponse(parsed.code, parsed.message, parsed.statusCode, parsed.details);
}
