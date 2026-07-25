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

export class PaymentRequiredError extends AppError {
  constructor(message = "Premium subscription required") {
    super("PAYMENT_REQUIRED", message, 402);
    this.name = "PaymentRequiredError";
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable. Please try again shortly.") {
    super("SERVICE_UNAVAILABLE", message, 503);
    this.name = "ServiceUnavailableError";
  }
}

/** Client-safe details only — never forward raw provider / DB payloads on 5xx. */
function clientSafeDetails(statusCode: number, details: unknown): unknown | undefined {
  if (details === undefined || statusCode >= 500) return undefined;
  if (statusCode === 429 || statusCode === 400 || statusCode === 409) return details;
  return undefined;
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
      details: clientSafeDetails(error.statusCode, error.details),
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

  // Never echo unexpected Error.message — it often contains stack internals / DB text.
  return {
    code: "INTERNAL_ERROR",
    message: "Something went wrong.",
    statusCode: 500,
  };
}

export function handleRouteError(error: unknown): NextResponse {
  const parsed = toApiError(error);

  if (parsed.statusCode >= 500) {
    logger.error({ err: error }, "Unhandled route error");
  } else {
    logger.warn({ code: parsed.code, message: parsed.message }, "Handled route error");
  }

  return errorResponse(parsed.code, parsed.message, parsed.statusCode, parsed.details);
}
