import { describe, expect, it } from "vitest";

import {
  requireSessionToolUserId,
  resolveAllowedCandidateUserId,
  runWithAiToolContext,
} from "@/application/ai/ai-tool-context";
import { billingInternals } from "@/application/billing/billing.service";

describe("Sprint 1 — AI tool identity binding", () => {
  it("always returns session userId and ignores LLM-requested ids", async () => {
    await runWithAiToolContext({ sessionUserId: "user-a" }, async () => {
      expect(requireSessionToolUserId("user-attacker")).toBe("user-a");
      expect(requireSessionToolUserId()).toBe("user-a");
    });
  });

  it("only allows the allowlisted candidate", async () => {
    await runWithAiToolContext(
      { sessionUserId: "user-a", allowedCandidateUserId: "user-b" },
      async () => {
        expect(resolveAllowedCandidateUserId("user-b")).toBe("user-b");
        expect(resolveAllowedCandidateUserId("user-evil")).toBe("user-b");
        expect(resolveAllowedCandidateUserId()).toBe("user-b");
      },
    );
  });

  it("throws when tools run outside request context", () => {
    expect(() => requireSessionToolUserId("x")).toThrow(/not authenticated/i);
  });
});

describe("Sprint 1 — billing plan binding helpers", () => {
  it("reads planCode only from payment.raw", () => {
    expect(billingInternals.planCodeFromPaymentRaw({ planCode: "PREMIUM" })).toBe("PREMIUM");
    expect(billingInternals.planCodeFromPaymentRaw({})).toBeNull();
    expect(billingInternals.planCodeFromPaymentRaw(null)).toBeNull();
  });

  it("extends billing periods", () => {
    const start = new Date("2026-01-15T00:00:00Z");
    const monthly = billingInternals.addPeriod("MONTHLY", start);
    const quarterly = billingInternals.addPeriod("QUARTERLY", start);
    expect(monthly.getUTCMonth()).toBe(1);
    expect(quarterly.getUTCMonth()).toBe(3);
  });
});
