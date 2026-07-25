import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

import { baseSchemaOptions, softDeletePlugin } from "../base";

const lifePathAnswersSchema = new Schema(
  {
    marriageTimeline: { type: String, default: null },
    location: { type: String, default: null },
    relocation: { type: String, default: null },
    career: { type: String, default: null },
    familyInvolvement: { type: String, default: null },
    children: { type: String, default: null },
    lifestyle: { type: String, default: null },
    finances: { type: String, default: null },
    spirituality: { type: String, default: null },
    workLifeBalance: { type: String, default: null },
  },
  { _id: false },
);

/** Per-user practical future expectations (non-astrological). */
const lifePathProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    answers: { type: lifePathAnswersSchema, default: () => ({}) },
    completedAt: { type: Date, default: null },
  },
  baseSchemaOptions,
);
softDeletePlugin(lifePathProfileSchema);

export type LifePathProfileDocument = InferSchemaType<typeof lifePathProfileSchema> & {
  _id: Schema.Types.ObjectId;
};
export const LifePathProfile =
  (models.LifePathProfile as Model<LifePathProfileDocument>) ||
  model<LifePathProfileDocument>("LifePathProfile", lifePathProfileSchema, "life_path_profiles");

/** Private notes about a connection — owner only. */
const privateCompatibilityNoteSchema = new Schema(
  {
    ownerUserId: { type: String, required: true, index: true },
    aboutUserId: { type: String, required: true, index: true },
    pairKey: { type: String, required: true, index: true },
    body: { type: String, required: true, maxlength: 2000 },
  },
  baseSchemaOptions,
);
softDeletePlugin(privateCompatibilityNoteSchema);
privateCompatibilityNoteSchema.index({ ownerUserId: 1, aboutUserId: 1, createdAt: -1 });

export type PrivateCompatibilityNoteDocument = InferSchemaType<
  typeof privateCompatibilityNoteSchema
> & { _id: Schema.Types.ObjectId };
export const PrivateCompatibilityNote =
  (models.PrivateCompatibilityNote as Model<PrivateCompatibilityNoteDocument>) ||
  model<PrivateCompatibilityNoteDocument>(
    "PrivateCompatibilityNote",
    privateCompatibilityNoteSchema,
    "private_compatibility_notes",
  );

/** Explicitly shared compatibility insight (never auto-shared). */
const sharedInsightSchema = new Schema(
  {
    pairKey: { type: String, required: true, index: true },
    sharedByUserId: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ["ALIGN", "DIFFER", "DISCUSS", "CUSTOM"],
      default: "CUSTOM",
    },
    title: { type: String, required: true, maxlength: 160 },
    body: { type: String, required: true, maxlength: 2000 },
    source: {
      type: String,
      enum: ["COMPATIBILITY", "LIFE_PATH", "USER"],
      default: "USER",
    },
  },
  baseSchemaOptions,
);
softDeletePlugin(sharedInsightSchema);
sharedInsightSchema.index({ pairKey: 1, createdAt: -1 });

export type SharedInsightDocument = InferSchemaType<typeof sharedInsightSchema> & {
  _id: Schema.Types.ObjectId;
};
export const SharedInsight =
  (models.SharedInsight as Model<SharedInsightDocument>) ||
  model<SharedInsightDocument>("SharedInsight", sharedInsightSchema, "shared_insights");

/** Get-to-know journey progress per user within a pair. */
const connectionJourneySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    partnerUserId: { type: String, required: true, index: true },
    pairKey: { type: String, required: true, index: true },
    exploredStageIds: { type: [String], default: [] },
    savedPromptIds: { type: [String], default: [] },
    lastStageId: { type: String, default: null },
  },
  baseSchemaOptions,
);
softDeletePlugin(connectionJourneySchema);
connectionJourneySchema.index({ userId: 1, partnerUserId: 1 }, { unique: true });

export type ConnectionJourneyDocument = InferSchemaType<typeof connectionJourneySchema> & {
  _id: Schema.Types.ObjectId;
};
export const ConnectionJourney =
  (models.ConnectionJourney as Model<ConnectionJourneyDocument>) ||
  model<ConnectionJourneyDocument>(
    "ConnectionJourney",
    connectionJourneySchema,
    "connection_journeys",
  );

/** Shared question — each answers privately, then may reveal. */
const sharedQuestionSchema = new Schema(
  {
    pairKey: { type: String, required: true, index: true },
    question: { type: String, required: true, maxlength: 400 },
    createdByUserId: { type: String, required: true },
    answers: {
      type: [
        {
          userId: { type: String, required: true },
          body: { type: String, required: true, maxlength: 2000 },
          revealed: { type: Boolean, default: false },
          answeredAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  baseSchemaOptions,
);
softDeletePlugin(sharedQuestionSchema);
sharedQuestionSchema.index({ pairKey: 1, createdAt: -1 });

export type SharedQuestionDocument = InferSchemaType<typeof sharedQuestionSchema> & {
  _id: Schema.Types.ObjectId;
};
export const SharedQuestion =
  (models.SharedQuestion as Model<SharedQuestionDocument>) ||
  model<SharedQuestionDocument>("SharedQuestion", sharedQuestionSchema, "shared_questions");

/** Optional couple milestones — explicitly set, never assumed. */
const coupleMilestoneSchema = new Schema(
  {
    pairKey: { type: String, required: true, index: true },
    milestoneType: { type: String, required: true },
    label: { type: String, required: true, maxlength: 120 },
    occurredOn: { type: Date, default: null },
    notedByUserId: { type: String, required: true },
    shared: { type: Boolean, default: true },
  },
  baseSchemaOptions,
);
softDeletePlugin(coupleMilestoneSchema);
coupleMilestoneSchema.index({ pairKey: 1, milestoneType: 1 }, { unique: true });

export type CoupleMilestoneDocument = InferSchemaType<typeof coupleMilestoneSchema> & {
  _id: Schema.Types.ObjectId;
};
export const CoupleMilestone =
  (models.CoupleMilestone as Model<CoupleMilestoneDocument>) ||
  model<CoupleMilestoneDocument>("CoupleMilestone", coupleMilestoneSchema, "couple_milestones");

/** Cached reflective What-If result (not a prediction). */
const whatIfResultSchema = new Schema(
  {
    pairKey: { type: String, required: true, index: true },
    requestedByUserId: { type: String, required: true, index: true },
    scenarioId: { type: String, required: true },
    alignmentLabel: {
      type: String,
      enum: ["STRONG", "GOOD", "MIXED", "NEEDS_DISCUSSION"],
      default: "MIXED",
    },
    sources: { type: [String], default: [] },
    alignmentPoints: { type: [String], default: [] },
    frictionPoints: { type: [String], default: [] },
    discussionQuestions: { type: [String], default: [] },
    reflection: { type: String, default: "" },
    sharedWithPartner: { type: Boolean, default: false },
  },
  baseSchemaOptions,
);
softDeletePlugin(whatIfResultSchema);
whatIfResultSchema.index({ pairKey: 1, scenarioId: 1, requestedByUserId: 1 });

export type WhatIfResultDocument = InferSchemaType<typeof whatIfResultSchema> & {
  _id: Schema.Types.ObjectId;
};
export const WhatIfResult =
  (models.WhatIfResult as Model<WhatIfResultDocument>) ||
  model<WhatIfResultDocument>("WhatIfResult", whatIfResultSchema, "what_if_results");
