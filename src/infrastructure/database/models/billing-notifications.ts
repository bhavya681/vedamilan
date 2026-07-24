import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

import { baseSchemaOptions, softDeletePlugin } from "../base";

const notificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    channel: {
      type: String,
      enum: ["IN_APP", "EMAIL", "SMS", "PUSH"],
      default: "IN_APP",
    },
    readAt: { type: Date, default: null },
    sentAt: { type: Date, default: Date.now },
  },
  baseSchemaOptions,
);

softDeletePlugin(notificationSchema);
notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & {
  _id: Schema.Types.ObjectId;
  status?: string;
  deletedAt?: Date | null;
};
export const Notification =
  (models.Notification as Model<NotificationDocument>) ||
  model<NotificationDocument>("Notification", notificationSchema, "notifications");

const planSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    priceInr: { type: Number, required: true },
    priceUsd: { type: Number, default: null },
    interval: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "YEARLY", "LIFETIME"],
      required: true,
    },
    features: { type: [String], default: [] },
    stripePriceId: { type: String, default: null },
    razorpayPlanId: { type: String, default: null },
    isHighlighted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  baseSchemaOptions,
);

softDeletePlugin(planSchema);

export type PlanDocument = InferSchemaType<typeof planSchema> & { _id: Schema.Types.ObjectId };
export const Plan =
  (models.Plan as Model<PlanDocument>) || model<PlanDocument>("Plan", planSchema, "plans");

const subscriptionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    planId: { type: String, required: true, index: true },
    planCode: { type: String, required: true },
    provider: { type: String, enum: ["STRIPE", "RAZORPAY", "MANUAL"], required: true },
    providerSubscriptionId: { type: String, default: null, index: true },
    subscriptionStatus: {
      type: String,
      enum: ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED"],
      default: "ACTIVE",
      index: true,
    },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  baseSchemaOptions,
);

softDeletePlugin(subscriptionSchema);
subscriptionSchema.index({ userId: 1, subscriptionStatus: 1 });

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Subscription =
  (models.Subscription as Model<SubscriptionDocument>) ||
  model<SubscriptionDocument>("Subscription", subscriptionSchema, "subscriptions");

const paymentSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    subscriptionId: { type: String, default: null },
    provider: { type: String, enum: ["STRIPE", "RAZORPAY"], required: true },
    providerPaymentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    invoiceUrl: { type: String, default: null },
    raw: { type: Schema.Types.Mixed, default: null },
  },
  baseSchemaOptions,
);

softDeletePlugin(paymentSchema);
paymentSchema.index({ userId: 1, createdAt: -1 });

export type PaymentDocument = InferSchemaType<typeof paymentSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Payment =
  (models.Payment as Model<PaymentDocument>) ||
  model<PaymentDocument>("Payment", paymentSchema, "payments");
