import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

import { baseSchemaOptions, softDeletePlugin } from "../base";

/** Optional situational preference answers (complements Vedic compatibility). */
const situationalProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    answers: { type: Schema.Types.Mixed, default: {} },
    completedAt: { type: Date, default: null, index: true },
  },
  baseSchemaOptions,
);
softDeletePlugin(situationalProfileSchema);

export type SituationalProfileDocument = InferSchemaType<typeof situationalProfileSchema> & {
  _id: Schema.Types.ObjectId;
};

export const SituationalProfile =
  (models.SituationalProfile as Model<SituationalProfileDocument>) ||
  model<SituationalProfileDocument>(
    "SituationalProfile",
    situationalProfileSchema,
    "situational_profiles",
  );
