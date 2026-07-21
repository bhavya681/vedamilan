import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

import { baseSchemaOptions, softDeletePlugin } from "../base";

const reportSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["KUNDLI", "COMPATIBILITY", "MARRIAGE_TIMING", "AI_SUMMARY", "FULL_DOSSIER"],
      required: true,
    },
    title: { type: String, required: true },
    relatedIds: { type: Schema.Types.Mixed, default: {} },
    cloudinaryPublicId: { type: String, default: null },
    fileUrl: { type: String, default: null },
    format: { type: String, enum: ["PDF", "JSON"], default: "PDF" },
    generationStatus: {
      type: String,
      enum: ["QUEUED", "PROCESSING", "READY", "FAILED"],
      default: "QUEUED",
      index: true,
    },
    errorMessage: { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  baseSchemaOptions,
);

softDeletePlugin(reportSchema);
reportSchema.index({ userId: 1, type: 1, createdAt: -1 });

export type ReportDocument = InferSchemaType<typeof reportSchema> & { _id: Schema.Types.ObjectId };
export const Report =
  (models.Report as Model<ReportDocument>) ||
  model<ReportDocument>("Report", reportSchema, "reports");

const consultationSchema = new Schema(
  {
    clientUserId: { type: String, required: true, index: true },
    astrologerUserId: { type: String, required: true, index: true },
    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 30 },
    bookingStatus: {
      type: String,
      enum: ["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELED", "NO_SHOW"],
      default: "REQUESTED",
      index: true,
    },
    topic: { type: String, default: "" },
    notes: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    meetingUrl: { type: String, default: null },
  },
  baseSchemaOptions,
);

softDeletePlugin(consultationSchema);
consultationSchema.index({ astrologerUserId: 1, scheduledAt: 1 });

export type ConsultationDocument = InferSchemaType<typeof consultationSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Consultation =
  (models.Consultation as Model<ConsultationDocument>) ||
  model<ConsultationDocument>("Consultation", consultationSchema, "consultations");

const blogSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    coverImageUrl: { type: String, default: null },
    authorUserId: { type: String, required: true, index: true },
    tags: { type: [String], default: [], index: true },
    publishedAt: { type: Date, default: null, index: true },
    isPublished: { type: Boolean, default: false, index: true },
  },
  baseSchemaOptions,
);

softDeletePlugin(blogSchema);

export type BlogDocument = InferSchemaType<typeof blogSchema> & { _id: Schema.Types.ObjectId };
export const Blog =
  (models.Blog as Model<BlogDocument>) || model<BlogDocument>("Blog", blogSchema, "blogs");

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "general", index: true },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  baseSchemaOptions,
);

softDeletePlugin(faqSchema);

export type FaqDocument = InferSchemaType<typeof faqSchema> & { _id: Schema.Types.ObjectId };
export const Faq =
  (models.Faq as Model<FaqDocument>) || model<FaqDocument>("Faq", faqSchema, "faqs");

const auditLogSchema = new Schema(
  {
    actorUserId: { type: String, default: null, index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    severity: { type: String, enum: ["INFO", "WARN", "CRITICAL"], default: "INFO" },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema> & {
  _id: Schema.Types.ObjectId;
};
export const AuditLog =
  (models.AuditLog as Model<AuditLogDocument>) ||
  model<AuditLogDocument>("AuditLog", auditLogSchema, "audit_logs");

const aiConversationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    agent: {
      type: String,
      enum: [
        "ASTROLOGER_GURU",
        "HOROSCOPE",
        "COMPATIBILITY",
        "MARRIAGE_TIMING",
        "RELATIONSHIP_COACH",
        "PROFILE_ANALYSIS",
        "SEARCH",
        "RECOMMENDATION",
        "NOTIFICATION",
        "REPORT",
        "SUPPORT",
      ],
      required: true,
      index: true,
    },
    title: { type: String, default: "" },
    messages: {
      type: [
        {
          role: { type: String, enum: ["user", "assistant", "system", "tool"], required: true },
          content: { type: String, required: true },
          toolName: { type: String, default: null },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    contextRefs: { type: Schema.Types.Mixed, default: {} },
    tokenUsage: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    model: { type: String, default: null },
  },
  baseSchemaOptions,
);

softDeletePlugin(aiConversationSchema);
aiConversationSchema.index({ userId: 1, agent: 1, updatedAt: -1 });

export type AiConversationDocument = InferSchemaType<typeof aiConversationSchema> & {
  _id: Schema.Types.ObjectId;
};
export const AiConversation =
  (models.AiConversation as Model<AiConversationDocument>) ||
  model<AiConversationDocument>("AiConversation", aiConversationSchema, "ai_conversations");

/** OTP for phone/email login (app-level; Better Auth verification also used for email flows) */
const otpSchema = new Schema(
  {
    destination: { type: String, required: true, index: true },
    purpose: {
      type: String,
      enum: ["LOGIN", "VERIFY_EMAIL", "VERIFY_PHONE", "RESET_PASSWORD"],
      required: true,
    },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    expiresAt: { type: Date, required: true, index: true },
    consumedAt: { type: Date, default: null },
    userId: { type: String, default: null, index: true },
  },
  baseSchemaOptions,
);

otpSchema.index({ destination: 1, purpose: 1, expiresAt: 1 });

export type OtpDocument = InferSchemaType<typeof otpSchema> & { _id: Schema.Types.ObjectId };
export const Otp =
  (models.Otp as Model<OtpDocument>) || model<OtpDocument>("Otp", otpSchema, "otps");
