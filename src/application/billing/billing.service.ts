import crypto from "crypto";

import Stripe from "stripe";
import Razorpay from "razorpay";

import { Plan, Payment, Subscription, Notification } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError, ValidationError } from "@/lib/utils/error-handler";

function addPeriod(interval: string, from = new Date()) {
  const end = new Date(from);
  if (interval === "YEARLY") end.setFullYear(end.getFullYear() + 1);
  else if (interval === "QUARTERLY") end.setMonth(end.getMonth() + 3);
  else if (interval === "LIFETIME") end.setFullYear(end.getFullYear() + 100);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export class BillingService {
  async listPlans() {
    await connectMongo();
    return Plan.find({ isActive: true }).sort({ priceInr: 1 }).lean();
  }

  async getSubscription(userId: string) {
    await connectMongo();
    return Subscription.findOne({
      userId,
      subscriptionStatus: { $in: ["ACTIVE", "TRIALING"] },
    })
      .sort({ currentPeriodEnd: -1 })
      .lean();
  }

  async listPayments(userId: string) {
    await connectMongo();
    return Payment.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
  }

  async billingSummary(userId: string) {
    const [plans, subscription, payments] = await Promise.all([
      this.listPlans(),
      this.getSubscription(userId),
      this.listPayments(userId),
    ]);
    return { plans, subscription, payments };
  }

  async createCheckout(input: {
    userId: string;
    email: string;
    planCode: string;
    provider: "STRIPE" | "RAZORPAY";
  }) {
    await connectMongo();
    const plan = await Plan.findOne({ code: input.planCode, isActive: true }).lean();
    if (!plan) throw new NotFoundError("Plan not found");
    if (plan.priceInr <= 0) {
      return this.activateFreeOrManual(input.userId, plan, "MANUAL");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (input.provider === "STRIPE") {
      const stripe = getStripe();
      if (!stripe) {
        throw new ValidationError("Stripe is not configured. Set STRIPE_SECRET_KEY.");
      }

      const providerPaymentId = `stripe_sess_${crypto.randomUUID()}`;
      await Payment.create({
        userId: input.userId,
        provider: "STRIPE",
        providerPaymentId,
        amount: plan.priceUsd ? Math.round(plan.priceUsd * 100) : plan.priceInr * 100,
        currency: plan.priceUsd ? "USD" : "INR",
        paymentStatus: "PENDING",
        raw: { planCode: plan.code },
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: input.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: plan.priceUsd ? "usd" : "inr",
              unit_amount: plan.priceUsd ? Math.round(plan.priceUsd * 100) : plan.priceInr * 100,
              product_data: {
                name: plan.name,
                description: plan.description || undefined,
              },
            },
          },
        ],
        success_url: `${appUrl}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan.code}`,
        cancel_url: `${appUrl}/dashboard/billing/failure?plan=${plan.code}`,
        metadata: {
          userId: input.userId,
          planCode: plan.code,
          providerPaymentId,
        },
      });

      await Payment.updateOne(
        { providerPaymentId },
        {
          $set: {
            providerPaymentId: session.id,
            raw: { planCode: plan.code, sessionId: session.id },
          },
        },
      );

      return {
        provider: "STRIPE" as const,
        checkoutUrl: session.url,
        sessionId: session.id,
        planCode: plan.code,
      };
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      throw new ValidationError("Razorpay is not configured. Set RAZORPAY_KEY_ID/SECRET.");
    }

    const order = await razorpay.orders.create({
      amount: plan.priceInr * 100,
      currency: "INR",
      receipt: `vm_${input.userId.slice(-6)}_${Date.now()}`,
      notes: { userId: input.userId, planCode: plan.code },
    });

    await Payment.create({
      userId: input.userId,
      provider: "RAZORPAY",
      providerPaymentId: order.id,
      amount: plan.priceInr * 100,
      currency: "INR",
      paymentStatus: "PENDING",
      raw: { planCode: plan.code, order },
    });

    return {
      provider: "RAZORPAY" as const,
      orderId: order.id,
      amount: plan.priceInr * 100,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      planCode: plan.code,
      planName: plan.name,
    };
  }

  private async activateFreeOrManual(
    userId: string,
    plan: { _id: unknown; code: string; interval: string; name: string },
    provider: "MANUAL" | "STRIPE" | "RAZORPAY",
  ) {
    const start = new Date();
    const end = addPeriod(plan.interval, start);
    const sub = await Subscription.findOneAndUpdate(
      { userId, planCode: plan.code },
      {
        $set: {
          userId,
          planId: String(plan._id),
          planCode: plan.code,
          provider,
          subscriptionStatus: "ACTIVE",
          currentPeriodStart: start,
          currentPeriodEnd: end,
          cancelAtPeriodEnd: false,
          status: "ACTIVE",
          deletedAt: null,
        },
      },
      { upsert: true, new: true },
    ).lean();

    await Notification.create({
      userId,
      type: "SUBSCRIPTION_ACTIVE",
      title: `${plan.name} activated`,
      body: `Your ${plan.name} plan is active until ${end.toLocaleDateString("en-IN")}.`,
      channel: "IN_APP",
    });

    return {
      provider,
      subscription: sub,
      activated: true,
    };
  }

  async activatePaid(input: {
    userId: string;
    planCode: string;
    provider: "STRIPE" | "RAZORPAY";
    providerPaymentId: string;
    amount: number;
    currency: string;
    invoiceUrl?: string | null;
    raw?: unknown;
  }) {
    await connectMongo();
    const plan = await Plan.findOne({ code: input.planCode }).lean();
    if (!plan) throw new NotFoundError("Plan not found");

    await Payment.findOneAndUpdate(
      { providerPaymentId: input.providerPaymentId },
      {
        $set: {
          userId: input.userId,
          provider: input.provider,
          providerPaymentId: input.providerPaymentId,
          amount: input.amount,
          currency: input.currency,
          paymentStatus: "SUCCEEDED",
          invoiceUrl: input.invoiceUrl || null,
          raw: input.raw || null,
          status: "ACTIVE",
          deletedAt: null,
        },
      },
      { upsert: true, new: true },
    );

    const start = new Date();
    const end = addPeriod(plan.interval, start);
    const sub = await Subscription.findOneAndUpdate(
      { userId: input.userId, planCode: plan.code },
      {
        $set: {
          userId: input.userId,
          planId: String(plan._id),
          planCode: plan.code,
          provider: input.provider,
          providerSubscriptionId: input.providerPaymentId,
          subscriptionStatus: "ACTIVE",
          currentPeriodStart: start,
          currentPeriodEnd: end,
          cancelAtPeriodEnd: false,
          status: "ACTIVE",
          deletedAt: null,
        },
      },
      { upsert: true, new: true },
    ).lean();

    await Notification.create({
      userId: input.userId,
      type: "PAYMENT_SUCCEEDED",
      title: "Payment successful",
      body: `${plan.name} is now active.`,
      channel: "IN_APP",
      data: { planCode: plan.code },
    });

    return sub;
  }

  async verifyRazorpayPayment(input: {
    userId: string;
    orderId: string;
    paymentId: string;
    signature: string;
    planCode: string;
  }) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new ValidationError("Razorpay secret missing");
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${input.orderId}|${input.paymentId}`)
      .digest("hex");
    if (expected !== input.signature) throw new ValidationError("Invalid Razorpay signature");

    const payment = await Payment.findOne({ providerPaymentId: input.orderId }).lean();
    const amount = payment?.amount || 0;
    return this.activatePaid({
      userId: input.userId,
      planCode: input.planCode,
      provider: "RAZORPAY",
      providerPaymentId: input.paymentId,
      amount,
      currency: "INR",
      raw: { orderId: input.orderId, signature: input.signature },
    });
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string | null) {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripe || !secret) throw new ValidationError("Stripe webhook not configured");
    if (!signature) throw new ValidationError("Missing Stripe signature");

    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planCode = session.metadata?.planCode;
      if (userId && planCode) {
        await this.activatePaid({
          userId,
          planCode,
          provider: "STRIPE",
          providerPaymentId: session.id,
          amount: session.amount_total || 0,
          currency: (session.currency || "inr").toUpperCase(),
          invoiceUrl: session.url,
          raw: session,
        });
      }
    }
    return { received: true, type: event.type };
  }
}

export const billingService = new BillingService();
