import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

import { baseSchemaOptions, softDeletePlugin } from "../base";

const grahaLearningProgressSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    exploredGrahaIds: { type: [String], default: [] },
    completedChapters: { type: Schema.Types.Mixed, default: {} },
    bookmarks: { type: [String], default: [] },
    savedInsights: { type: [String], default: [] },
    lastGrahaId: { type: String, default: null },
  },
  baseSchemaOptions,
);
softDeletePlugin(grahaLearningProgressSchema);

export type GrahaLearningProgressDocument = InferSchemaType<typeof grahaLearningProgressSchema> & {
  _id: Schema.Types.ObjectId;
};

export const GrahaLearningProgress =
  (models.GrahaLearningProgress as Model<GrahaLearningProgressDocument>) ||
  model<GrahaLearningProgressDocument>(
    "GrahaLearningProgress",
    grahaLearningProgressSchema,
    "graha_learning_progress",
  );
