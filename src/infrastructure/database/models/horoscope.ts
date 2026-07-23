import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

import { baseSchemaOptions, softDeletePlugin } from "../base";

const planetPositionSchema = new Schema(
  {
    planet: { type: String, required: true },
    sign: { type: String, required: true },
    signId: { type: Number, required: true },
    house: { type: Number, required: true, min: 1, max: 12 },
    longitude: { type: Number, required: true },
    latitude: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    isRetrograde: { type: Boolean, default: false },
    nakshatra: { type: String, required: true },
    nakshatraPada: { type: Number, required: true, min: 1, max: 4 },
    dignity: { type: String, default: null },
  },
  { _id: false },
);

const yogaSchema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["MARRIAGE", "CAREER", "WEALTH", "HEALTH", "GENERAL"],
      default: "GENERAL",
    },
    strength: { type: Number, default: 0 },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const doshaSchema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    present: { type: Boolean, required: true },
    severity: { type: String, enum: ["NONE", "LOW", "MEDIUM", "HIGH"], default: "NONE" },
    notes: { type: String, default: "" },
  },
  { _id: false },
);

const horoscopeSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    birthDetailsId: { type: String, required: true },
    ayanamsha: { type: String, default: "LAHIRI" },
    julianDay: { type: Number, required: true },
    lagnaSign: { type: String, required: true },
    lagnaDegree: { type: Number, required: true },
    lagnaNakshatra: { type: String, default: null },
    lagnaNakshatraPada: { type: Number, default: null, min: 1, max: 4 },
    moonSign: { type: String, required: true },
    sunSign: { type: String, required: true },
    planets: { type: [planetPositionSchema], default: [] },
    houseLords: { type: Map, of: String, default: {} },
    navamsa: { type: Schema.Types.Mixed, default: null },
    dashamsa: { type: Schema.Types.Mixed, default: null },
    shadbala: { type: Schema.Types.Mixed, default: null },
    yogas: { type: [yogaSchema], default: [] },
    doshas: { type: [doshaSchema], default: [] },
    manglikStatus: {
      type: String,
      enum: ["NON_MANGLIK", "PARTIAL", "MANGLIK", "UNKNOWN"],
      default: "UNKNOWN",
      index: true,
    },
    chartNorth: { type: Schema.Types.Mixed, default: null },
    chartSouth: { type: Schema.Types.Mixed, default: null },
    chartEast: { type: Schema.Types.Mixed, default: null },
    engineVersion: { type: String, required: true },
    calculatedAt: { type: Date, default: Date.now },
  },
  baseSchemaOptions,
);

softDeletePlugin(horoscopeSchema);
horoscopeSchema.index({ userId: 1, calculatedAt: -1 });
horoscopeSchema.index({ manglikStatus: 1, status: 1 });

export type HoroscopeDocument = InferSchemaType<typeof horoscopeSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Horoscope =
  (models.Horoscope as Model<HoroscopeDocument>) ||
  model<HoroscopeDocument>("Horoscope", horoscopeSchema, "horoscopes");

const dashaPeriodSchema = new Schema(
  {
    lord: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    level: { type: String, enum: ["MAHA", "ANTAR", "PRATYANTAR"], required: true },
    parentLord: { type: String, default: null },
  },
  { _id: false },
);

const dashaSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    horoscopeId: { type: String, required: true, index: true },
    system: { type: String, default: "VIMSHOTTARI" },
    balanceAtBirth: { type: Schema.Types.Mixed, default: null },
    periods: { type: [dashaPeriodSchema], default: [] },
    currentMaha: { type: String, default: null },
    currentAntar: { type: String, default: null },
    engineVersion: { type: String, required: true },
    calculatedAt: { type: Date, default: Date.now },
  },
  baseSchemaOptions,
);

softDeletePlugin(dashaSchema);
dashaSchema.index({ userId: 1, calculatedAt: -1 });

export type DashaDocument = InferSchemaType<typeof dashaSchema> & { _id: Schema.Types.ObjectId };
export const Dasha =
  (models.Dasha as Model<DashaDocument>) || model<DashaDocument>("Dasha", dashaSchema, "dashas");
