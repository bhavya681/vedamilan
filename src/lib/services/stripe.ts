import Stripe from "stripe";

import { AppError } from "@/lib/utils/error-handler";
import { requireEnvValue } from "@/lib/utils/env";

export class StripeService {
  private client: Stripe | null = null;

  getStripe(): Stripe {
    if (this.client) return this.client;
    const secretKey = requireEnvValue(process.env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY");
    this.client = new Stripe(secretKey, {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
    return this.client;
  }

  async createCheckoutSession(params: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
    mode?: Stripe.Checkout.SessionCreateParams.Mode;
  }): Promise<Stripe.Checkout.Session> {
    try {
      return await this.getStripe().checkout.sessions.create({
        mode: params.mode ?? "subscription",
        line_items: [{ price: params.priceId, quantity: 1 }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
        metadata: params.metadata,
        allow_promotion_codes: true,
      });
    } catch (error) {
      throw new AppError(
        "STRIPE_CHECKOUT_FAILED",
        "Failed to create Stripe checkout session",
        502,
        error,
      );
    }
  }

  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const secret = requireEnvValue(process.env.STRIPE_WEBHOOK_SECRET, "STRIPE_WEBHOOK_SECRET");
    try {
      return this.getStripe().webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      throw new AppError("STRIPE_WEBHOOK_INVALID", "Invalid Stripe webhook signature", 400, error);
    }
  }
}

export const stripeService = new StripeService();
