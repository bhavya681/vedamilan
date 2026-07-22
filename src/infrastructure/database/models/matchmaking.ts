import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

import { baseSchemaOptions, softDeletePlugin } from "../base";

const gunaItemSchema = new Schema(
  {
    koota: { type: String, required: true },
    score: { type: Number, required: true },
    max: { type: Number, required: true },
    note: { type: String, default: "" },
    emoji: { type: String, default: null },
    visual: { type: String, default: null },
  },
  { _id: false },
);

const compatibilityReportSchema = new Schema(
  {
    userAId: { type: String, required: true, index: true },
    userBId: { type: String, required: true, index: true },
    pairKey: { type: String, required: true, unique: true }, // sorted "idA:idB"
    totalGuna: { type: Number, required: true },
    maxGuna: { type: Number, default: 36 },
    gunaBreakdown: { type: [gunaItemSchema], default: [] },
    manglikCompatibility: { type: String, default: null },
    nadiDosha: { type: Boolean, default: false },
    bhakootDosha: { type: Boolean, default: false },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    deepOverallScore: { type: Number, default: null, min: 0, max: 100 },
    decisionSummary: { type: String, default: null },
    decisionReason: { type: String, default: null },
    shukraMilan: { type: Schema.Types.Mixed, default: null },
    deepAnalysis: { type: Schema.Types.Mixed, default: null },
    categoryScores: { type: Schema.Types.Mixed, default: null },
    strengths: { type: [String], default: [] },
    challenges: { type: [String], default: [] },
    marriageWindows: { type: [Schema.Types.Mixed], default: [] },
    /** Multi-factor dasha + gochar + bond timing dossier */
    timingPrediction: { type: Schema.Types.Mixed, default: null },
    engineVersion: { type: String, required: true },
    calculatedAt: { type: Date, default: Date.now },
  },
  baseSchemaOptions,
);

softDeletePlugin(compatibilityReportSchema);
compatibilityReportSchema.index({ userAId: 1, overallScore: -1 });
compatibilityReportSchema.index({ userBId: 1, overallScore: -1 });

export type CompatibilityReportDocument = InferSchemaType<typeof compatibilityReportSchema> & {
  _id: Schema.Types.ObjectId;
};
export const CompatibilityReport =
  (models.CompatibilityReport as Model<CompatibilityReportDocument>) ||
  model<CompatibilityReportDocument>(
    "CompatibilityReport",
    compatibilityReportSchema,
    "compatibility_reports",
  );

const matchSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    candidateUserId: { type: String, required: true, index: true },
    rank: { type: Number, default: 0 },
    compatibilityScore: { type: Number, default: 0 },
    aiScore: { type: Number, default: null },
    distanceKm: { type: Number, default: null },
    reasons: { type: [String], default: [] },
    filtersSnapshot: { type: Schema.Types.Mixed, default: null },
    matchStatus: {
      type: String,
      enum: ["ACTIVE", "HIDDEN", "EXPIRED"],
      default: "ACTIVE",
      index: true,
    },
    generatedAt: { type: Date, default: Date.now },
  },
  baseSchemaOptions,
);

softDeletePlugin(matchSchema);
matchSchema.index({ userId: 1, candidateUserId: 1 }, { unique: true });
matchSchema.index({ userId: 1, rank: 1, compatibilityScore: -1 });

export type MatchDocument = InferSchemaType<typeof matchSchema> & { _id: Schema.Types.ObjectId };
export const Match =
  (models.Match as Model<MatchDocument>) || model<MatchDocument>("Match", matchSchema, "matches");

const likeSchema = new Schema(
  {
    fromUserId: { type: String, required: true, index: true },
    toUserId: { type: String, required: true, index: true },
    type: { type: String, enum: ["LIKE", "SUPER_LIKE", "INTEREST"], default: "LIKE" },
  },
  baseSchemaOptions,
);

softDeletePlugin(likeSchema);
likeSchema.index({ fromUserId: 1, toUserId: 1, type: 1 }, { unique: true });

export type LikeDocument = InferSchemaType<typeof likeSchema> & { _id: Schema.Types.ObjectId };
export const Like =
  (models.Like as Model<LikeDocument>) || model<LikeDocument>("Like", likeSchema, "likes");

const visitorSchema = new Schema(
  {
    visitorUserId: { type: String, required: true, index: true },
    profileUserId: { type: String, required: true, index: true },
    visitCount: { type: Number, default: 1 },
    lastVisitedAt: { type: Date, default: Date.now },
  },
  baseSchemaOptions,
);

softDeletePlugin(visitorSchema);
visitorSchema.index({ profileUserId: 1, lastVisitedAt: -1 });
visitorSchema.index({ visitorUserId: 1, profileUserId: 1 }, { unique: true });

export type VisitorDocument = InferSchemaType<typeof visitorSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Visitor =
  (models.Visitor as Model<VisitorDocument>) ||
  model<VisitorDocument>("Visitor", visitorSchema, "visitors");

const shortlistSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    targetUserId: { type: String, required: true, index: true },
    note: { type: String, default: "" },
  },
  baseSchemaOptions,
);

softDeletePlugin(shortlistSchema);
shortlistSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });

export type ShortlistDocument = InferSchemaType<typeof shortlistSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Shortlist =
  (models.Shortlist as Model<ShortlistDocument>) ||
  model<ShortlistDocument>("Shortlist", shortlistSchema, "shortlists");
