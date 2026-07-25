import { describe, expect, it, vi } from "vitest";

vi.mock("@/application/billing/billing.service", () => ({
  billingService: {
    getSubscription: vi.fn(),
  },
}));

import { billingService } from "@/application/billing/billing.service";
import { checkEntitlement, requireEntitlement } from "@/application/billing/entitlements";
import { PaymentRequiredError } from "@/lib/utils/error-handler";

describe("entitlements", () => {
  it("allows soft entitlements without a subscription", async () => {
    vi.mocked(billingService.getSubscription).mockResolvedValue(null as never);
    await expect(checkEntitlement("u1", "ai_relationship_guidance")).resolves.toBe(true);
    await expect(checkEntitlement("u1", "advanced_compatibility")).resolves.toBe(true);
  });

  it("requires subscription for premium_reports", async () => {
    vi.mocked(billingService.getSubscription).mockResolvedValue(null as never);
    await expect(checkEntitlement("u1", "premium_reports")).resolves.toBe(false);
    await expect(requireEntitlement("u1", "premium_reports")).rejects.toBeInstanceOf(
      PaymentRequiredError,
    );
  });

  it("allows premium_reports with an active subscription", async () => {
    vi.mocked(billingService.getSubscription).mockResolvedValue({
      currentPeriodEnd: new Date(Date.now() + 86_400_000),
    } as never);
    await expect(checkEntitlement("u1", "premium_reports")).resolves.toBe(true);
  });
});
