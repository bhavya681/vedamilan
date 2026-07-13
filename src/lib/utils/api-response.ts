import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiPayload<T> = ApiSuccess<T> | ApiFailure;

export function successResponse<T>(
  data: T,
  init?: ResponseInit & { meta?: Record<string, unknown> },
): NextResponse<ApiSuccess<T>> {
  const { meta, ...responseInit } = init ?? {};
  const body: ApiSuccess<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };

  return NextResponse.json(body, {
    status: 200,
    ...responseInit,
  });
}

export function errorResponse(
  code: string,
  message: string,
  status = 500,
  details?: unknown,
): NextResponse<ApiFailure> {
  const body: ApiFailure = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };

  return NextResponse.json(body, { status });
}
