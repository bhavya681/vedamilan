import { describe, expect, it } from "vitest";

import {
  AppError,
  PaymentRequiredError,
  toApiError,
  ValidationError,
} from "@/lib/utils/error-handler";

describe("toApiError", () => {
  it("keeps AppError messages for client-safe 4xx", () => {
    const parsed = toApiError(new ValidationError("Bad input", { field: "email" }));
    expect(parsed.code).toBe("VALIDATION_ERROR");
    expect(parsed.message).toBe("Bad input");
    expect(parsed.statusCode).toBe(400);
    expect(parsed.details).toEqual({ field: "email" });
  });

  it("strips details from 5xx AppErrors", () => {
    const parsed = toApiError(
      new AppError("CLOUDINARY_UPLOAD_FAILED", "Failed to upload", 502, { raw: "secret" }),
    );
    expect(parsed.statusCode).toBe(502);
    expect(parsed.message).toBe("Failed to upload");
    expect(parsed.details).toBeUndefined();
  });

  it("never echoes unexpected Error.message", () => {
    const parsed = toApiError(new Error("MongoServerError: E11000 duplicate key"));
    expect(parsed.code).toBe("INTERNAL_ERROR");
    expect(parsed.message).toBe("Something went wrong.");
    expect(parsed.statusCode).toBe(500);
  });

  it("maps PaymentRequiredError", () => {
    const parsed = toApiError(new PaymentRequiredError());
    expect(parsed.code).toBe("PAYMENT_REQUIRED");
    expect(parsed.statusCode).toBe(402);
  });
});
