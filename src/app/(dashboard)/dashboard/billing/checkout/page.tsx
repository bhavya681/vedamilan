"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("orderId");
  const plan = params.get("plan") || "PREMIUM";
  const amount = Number(params.get("amount") || 0);
  const key = params.get("key") || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [orderId]);

  async function openRazorpay() {
    if (!window.Razorpay || !orderId || !key) {
      setError("Razorpay checkout is not ready. Check NEXT_PUBLIC_RAZORPAY_KEY_ID.");
      return;
    }
    const rzp = new window.Razorpay({
      key,
      amount,
      currency: "INR",
      name: "VedaMilan AI",
      description: `${plan} plan`,
      order_id: orderId,
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const res = await fetch("/api/billing/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }),
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error?.message || "Verification failed");
          router.push(routes.paymentFailure);
          return;
        }
        router.push(routes.paymentSuccess);
      },
    });
    rzp.open();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <GlassCard className="space-y-4">
        <h1 className="font-display text-3xl">Checkout</h1>
        <p className="text-muted-foreground text-sm">
          {orderId
            ? `Complete Razorpay payment for ${plan} (₹${(amount / 100).toFixed(0)}).`
            : "Choose a plan from Billing to start checkout."}
        </p>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          {orderId ? (
            <Button disabled={!ready} onClick={() => void openRazorpay()}>
              {ready ? "Pay now" : "Loading Razorpay…"}
            </Button>
          ) : (
            <Button asChild>
              <Link href={routes.payments}>Choose a plan</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={routes.payments}>Cancel</Link>
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
