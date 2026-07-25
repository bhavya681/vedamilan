import { describe, expect, it } from "vitest";

import { billingInternals } from "@/application/billing/billing.service";

describe("payment integrity helpers", () => {
  it("never trusts client planCode from empty payment raw", () => {
    expect(billingInternals.planCodeFromPaymentRaw(null)).toBeNull();
    expect(billingInternals.planCodeFromPaymentRaw({ amount: 999 })).toBeNull();
    expect(billingInternals.planCodeFromPaymentRaw({ planCode: "PREMIUM" })).toBe("PREMIUM");
  });
});
