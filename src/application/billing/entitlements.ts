import { billingService } from "@/application/billing/billing.service";
import { PaymentRequiredError } from "@/lib/utils/error-handler";

export type EntitlementCode =
  "ai_relationship_guidance" | "advanced_compatibility" | "premium_reports" | "unlimited_ai";

/** Features that require an active paid subscription. */
const PREMIUM_ENTITLEMENTS = new Set<EntitlementCode>(["unlimited_ai", "premium_reports"]);

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await billingService.getSubscription(userId);
  if (!sub) return false;
  if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date()) {
    return false;
  }
  return true;
}

export async function checkEntitlement(
  userId: string,
  entitlement: EntitlementCode,
): Promise<boolean> {
  if (!PREMIUM_ENTITLEMENTS.has(entitlement)) {
    // Soft entitlements (basic AI / standard compatibility) remain available on free tier.
    return true;
  }
  return hasActiveSubscription(userId);
}

export async function requireEntitlement(userId: string, entitlement: EntitlementCode) {
  const allowed = await checkEntitlement(userId, entitlement);
  if (!allowed) {
    throw new PaymentRequiredError(
      "This feature requires an active Premium subscription. Upgrade to continue.",
    );
  }
}
