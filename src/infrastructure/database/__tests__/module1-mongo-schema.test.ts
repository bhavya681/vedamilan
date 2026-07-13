import { describe, expect, it } from "vitest";

import * as models from "@/infrastructure/database/models";
import { normalizePagination, toPaginatedResult } from "@/repositories/pagination";
import { VEDIC_AI_DISCLAIMER, withVedicDisclaimer } from "@/lib/constants/ai-disclaimer";

const REQUIRED_MODELS = [
  "Profile",
  "BirthDetails",
  "PartnerPreferences",
  "Horoscope",
  "Dasha",
  "CompatibilityReport",
  "Match",
  "Like",
  "Visitor",
  "Shortlist",
  "Chat",
  "Message",
  "Notification",
  "Plan",
  "Subscription",
  "Payment",
  "Report",
  "Consultation",
  "Blog",
  "Faq",
  "AuditLog",
  "AiConversation",
  "Otp",
] as const;

describe("Module 1 — MongoDB model registry", () => {
  it("exports every required domain model", () => {
    for (const name of REQUIRED_MODELS) {
      expect(models[name as keyof typeof models], `Missing model ${name}`).toBeDefined();
    }
  });

  it("does not register competing Better Auth collections via Mongoose", () => {
    expect((models as Record<string, unknown>).User).toBeUndefined();
    expect((models as Record<string, unknown>).Session).toBeUndefined();
  });

  it("registers indexes on Profile for geo and matchmaking filters", () => {
    const indexes = models.Profile.schema.indexes();
    const serialized = JSON.stringify(indexes);
    expect(serialized).toContain("2dsphere");
    expect(serialized).toContain("city");
  });

  it("registers unique pairKey on CompatibilityReport and Chat", () => {
    const compatIndexes = JSON.stringify(models.CompatibilityReport.schema.indexes());
    const chatIndexes = JSON.stringify(models.Chat.schema.indexes());
    expect(compatIndexes).toContain("pairKey");
    expect(chatIndexes).toContain("pairKey");
  });
});

describe("Module 1 — pagination helpers", () => {
  it("normalizes page/limit bounds", () => {
    expect(normalizePagination({ page: 0, limit: 999 })).toEqual({
      page: 1,
      limit: 100,
      skip: 0,
      sort: { createdAt: -1 },
    });
  });

  it("builds paginated result metadata", () => {
    const result = toPaginatedResult([{ id: 1 }], 25, 2, 10);
    expect(result.totalPages).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrev).toBe(true);
  });
});

describe("Module 1 — AI disclaimer constant", () => {
  it("appends disclaimer exactly once", () => {
    const once = withVedicDisclaimer("Moon–Venus harmony supports emotional ease.");
    expect(once).toContain(VEDIC_AI_DISCLAIMER);
    const twice = withVedicDisclaimer(once);
    expect(twice.split(VEDIC_AI_DISCLAIMER).length - 1).toBe(1);
  });
});
