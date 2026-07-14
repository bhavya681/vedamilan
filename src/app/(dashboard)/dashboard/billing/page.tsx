"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";

type Plan = {
  code: string;
  name: string;
  description?: string;
  priceInr: number;
  interval: string;
  features?: string[];
  isHighlighted?: boolean;
};

type Subscription = {
  planCode: string;
  subscriptionStatus: string;
  currentPeriodEnd?: string;
} | null;

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/billing")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Failed to load billing");
          return;
        }
        setPlans(json.data.plans || []);
        setSubscription(json.data.subscription || null);
      })
      .catch(() => setError("Failed to load billing"));
  }, []);

  async function checkout(planCode: string, provider: "STRIPE" | "RAZORPAY") {
    setBusy(`${planCode}-${provider}`);
    setError(null);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planCode, provider }),
    });
    const json = await res.json();
    setBusy(null);
    if (!json.success) {
      setError(json.error?.message || "Checkout failed");
      return;
    }
    if (json.data.activated) {
      setSubscription(json.data.subscription);
      return;
    }
    if (json.data.checkoutUrl) {
      window.location.href = json.data.checkoutUrl;
      return;
    }
    if (json.data.orderId) {
      window.location.href = `${routes.checkout}?orderId=${json.data.orderId}&plan=${planCode}&amount=${json.data.amount}&key=${json.data.keyId || ""}`;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Premium & billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription with Stripe or Razorpay.
        </p>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Current plan</CardTitle>
            <CardDescription>
              {subscription
                ? `${subscription.planCode} · renews ${subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN") : "—"}`
                : "Free · upgrade to unlock full matchmaking"}
            </CardDescription>
          </div>
          <Badge variant="secondary">{subscription?.subscriptionStatus || "Active"}</Badge>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.code}
            className={plan.isHighlighted ? "border-primary shadow-gold" : undefined}
          >
            <CardHeader>
              <CardTitle className="font-display text-2xl">{plan.name}</CardTitle>
              <CardDescription className="font-display text-foreground text-3xl">
                ₹{plan.priceInr}
                <span className="text-muted-foreground font-sans text-sm">
                  /{plan.interval.toLowerCase()}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">{plan.description}</p>
              <ul className="space-y-1 text-sm">
                {(plan.features || []).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <div className="flex flex-col gap-2">
                <Button
                  disabled={Boolean(busy) || plan.priceInr <= 0}
                  onClick={() => void checkout(plan.code, "RAZORPAY")}
                >
                  {busy === `${plan.code}-RAZORPAY` ? "Starting…" : "Pay with Razorpay"}
                </Button>
                <Button
                  variant="outline"
                  disabled={Boolean(busy) || plan.priceInr <= 0}
                  onClick={() => void checkout(plan.code, "STRIPE")}
                >
                  {busy === `${plan.code}-STRIPE` ? "Starting…" : "Pay with Stripe"}
                </Button>
                {plan.priceInr <= 0 ? (
                  <Button
                    variant="secondary"
                    disabled={Boolean(busy)}
                    onClick={() => void checkout(plan.code, "RAZORPAY")}
                  >
                    Activate free
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button asChild variant="secondary">
        <Link href={routes.invoices}>View invoices</Link>
      </Button>
    </div>
  );
}
