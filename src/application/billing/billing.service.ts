import crypto from "crypto";

import Stripe from "stripe";
import Razorpay from "razorpay";

import { Plan, Payment, Subscription, Notification } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/utils/error-handler";

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

type PlanLean = {
  _id: unknown;
  code: string;
  name: string;
  description?: string | null;
  priceInr: number;
  priceUsd?: number | null;
  interval: string;
};

function planCodeFromPaymentRaw(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const planCode = (raw as { planCode?: unknown }).planCode;
  return typeof planCode === "string" && planCode.length > 0 ? planCode : null;
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
    const plan = (await Plan.findOne({
      code: input.planCode,
      isActive: true,
    }).lean()) as PlanLean | null;
    if (!plan) throw new NotFoundError("Plan not found");
    if (plan.priceInr <= 0) {
      return this.activateFreeOrManual(input.userId, plan, "MANUAL");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const amountMinor = plan.priceUsd ? Math.round(plan.priceUsd * 100) : plan.priceInr * 100;
    const currency = plan.priceUsd ? "USD" : "INR";

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
        amount: amountMinor,
        currency,
        paymentStatus: "PENDING",
        raw: {
          planCode: plan.code,
          planId: String(plan._id),
          amount: amountMinor,
          currency,
        },
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: input.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: currency.toLowerCase(),
              unit_amount: amountMinor,
              product_data: {
                name: plan.name,
                description: plan.description || undefined,
              },
            },
          },
        ],
        success_url: `${appUrl}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard/billing/failure`,
        metadata: {
          userId: input.userId,
          planCode: plan.code,
          planId: String(plan._id),
          providerPaymentId,
        },
      });

      await Payment.updateOne(
        { providerPaymentId },
        {
          $set: {
            providerPaymentId: session.id,
            raw: {
              planCode: plan.code,
              planId: String(plan._id),
              amount: amountMinor,
              currency,
              sessionId: session.id,
            },
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

    const orderAmount = plan.priceInr * 100;
    const order = await razorpay.orders.create({
      amount: orderAmount,
      currency: "INR",
      receipt: `vm_${input.userId.slice(-6)}_${Date.now()}`,
      notes: {
        userId: input.userId,
        planCode: plan.code,
        planId: String(plan._id),
      },
    });

    await Payment.create({
      userId: input.userId,
      provider: "RAZORPAY",
      providerPaymentId: order.id,
      amount: orderAmount,
      currency: "INR",
      paymentStatus: "PENDING",
      raw: {
        planCode: plan.code,
        planId: String(plan._id),
        amount: orderAmount,
        currency: "INR",
        order,
      },
    });

    return {
      provider: "RAZORPAY" as const,
      orderId: order.id,
      amount: orderAmount,
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
    /** Stable order/session id used as Payment.providerPaymentId at create time */
    orderPaymentId: string;
    /** Provider capture id (Razorpay payment id / Stripe session id after complete) */
    captureId?: string;
    amount: number;
    currency: string;
    invoiceUrl?: string | null;
    raw?: unknown;
  }) {
    await connectMongo();
    const plan = await Plan.findOne({ code: input.planCode }).lean();
    if (!plan) throw new NotFoundError("Plan not found");

    const existing = await Payment.findOne({
      providerPaymentId: input.orderPaymentId,
    }).lean();

    if (existing?.paymentStatus === "SUCCEEDED") {
      const sub = await Subscription.findOne({
        userId: input.userId,
        planCode: plan.code,
        subscriptionStatus: { $in: ["ACTIVE", "TRIALING"] },
      }).lean();
      return sub;
    }

    if (existing && existing.userId !== input.userId) {
      throw new ForbiddenError("Payment does not belong to this account");
    }

    const claimed = await Payment.findOneAndUpdate(
      {
        providerPaymentId: input.orderPaymentId,
        paymentStatus: { $ne: "SUCCEEDED" },
      },
      {
        $set: {
          userId: input.userId,
          provider: input.provider,
          amount: input.amount,
          currency: input.currency,
          paymentStatus: "SUCCEEDED",
          invoiceUrl: input.invoiceUrl || null,
          raw: {
            ...(typeof existing?.raw === "object" && existing?.raw ? existing.raw : {}),
            ...(typeof input.raw === "object" && input.raw ? input.raw : {}),
            planCode: plan.code,
            planId: String(plan._id),
            captureId: input.captureId || null,
          },
          status: "ACTIVE",
          deletedAt: null,
        },
        ...(existing
          ? {}
          : {
              $setOnInsert: {
                providerPaymentId: input.orderPaymentId,
              },
            }),
      },
      { upsert: !existing, new: true },
    ).lean();

    // Lost the race — another worker already marked SUCCEEDED (filter matched nothing).
    if (!claimed) {
      const sub = await Subscription.findOne({
        userId: input.userId,
        planCode: plan.code,
        subscriptionStatus: { $in: ["ACTIVE", "TRIALING"] },
      }).lean();
      return sub;
    }

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
          providerSubscriptionId: input.captureId || input.orderPaymentId,
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

  /**
   * Server-authoritative Razorpay verification.
   * Plan/amount/user come from the PENDING Payment created at checkout — never from the client.
   */
  async verifyRazorpayPayment(input: {
    userId: string;
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    await connectMongo();
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new ValidationError("Razorpay secret missing");

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${input.orderId}|${input.paymentId}`)
      .digest("hex");
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(input.signature);
    if (
      expectedBuf.length !== actualBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, actualBuf)
    ) {
      throw new ValidationError("Invalid Razorpay signature");
    }

    const payment = await Payment.findOne({
      providerPaymentId: input.orderId,
      provider: "RAZORPAY",
    }).lean();

    if (!payment) throw new NotFoundError("Checkout order not found");
    if (payment.userId !== input.userId) {
      throw new ForbiddenError("This payment belongs to another account");
    }

    const planCode = planCodeFromPaymentRaw(payment.raw);
    if (!planCode) {
      throw new ValidationError("Order is missing an authoritative plan binding");
    }

    const plan = await Plan.findOne({ code: planCode, isActive: true }).lean();
    if (!plan) throw new NotFoundError("Plan not found for this order");

    if (payment.amount !== plan.priceInr * 100) {
      throw new ValidationError("Paid amount does not match the catalog plan price");
    }

    return this.activatePaid({
      userId: input.userId,
      planCode,
      provider: "RAZORPAY",
      orderPaymentId: input.orderId,
      captureId: input.paymentId,
      amount: payment.amount,
      currency: payment.currency || "INR",
      raw: {
        orderId: input.orderId,
        razorpayPaymentId: input.paymentId,
        signatureVerified: true,
      },
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
      const sessionId = session.id;
      const metaUserId = session.metadata?.userId;
      const metaPlanCode = session.metadata?.planCode;

      // Never unlock premium on unpaid / incomplete Checkout sessions.
      if (session.payment_status !== "paid") {
        return {
          received: true,
          type: event.type,
          activated: false,
          reason: "payment_not_paid",
        };
      }

      await connectMongo();
      const payment =
        (await Payment.findOne({ providerPaymentId: sessionId, provider: "STRIPE" }).lean()) ||
        (session.metadata?.providerPaymentId
          ? await Payment.findOne({
              providerPaymentId: session.metadata.providerPaymentId,
              provider: "STRIPE",
            }).lean()
          : null);

      const userId = payment?.userId || metaUserId;
      const planCode = planCodeFromPaymentRaw(payment?.raw) || metaPlanCode;

      if (!userId || !planCode) {
        return { received: true, type: event.type, activated: false };
      }

      if (payment && payment.userId !== userId) {
        throw new ForbiddenError("Stripe payment user mismatch");
      }

      const plan = await Plan.findOne({ code: planCode, isActive: true }).lean();
      if (!plan) {
        return { received: true, type: event.type, activated: false, reason: "plan_missing" };
      }

      const expectedAmount = plan.priceUsd ? Math.round(plan.priceUsd * 100) : plan.priceInr * 100;
      const paidAmount = session.amount_total ?? payment?.amount ?? 0;
      if (paidAmount !== expectedAmount) {
        throw new ValidationError("Paid amount does not match the catalog plan price");
      }

      await this.activatePaid({
        userId,
        planCode,
        provider: "STRIPE",
        orderPaymentId: payment?.providerPaymentId || sessionId,
        captureId: sessionId,
        amount: paidAmount,
        currency: (session.currency || payment?.currency || "inr").toUpperCase(),
        invoiceUrl: session.url,
        raw: { session, stripeEventId: event.id },
      });
    }
    return { received: true, type: event.type };
  }
}

export const billingService = new BillingService();

/** Exported for unit tests */
export const billingInternals = { planCodeFromPaymentRaw, addPeriod };
