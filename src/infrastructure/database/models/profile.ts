import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

import { baseSchemaOptions, softDeletePlugin } from "../base";

const photoSchema = new Schema(
  {
    cloudinaryPublicId: { type: String, required: true },
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    visibility: {
      type: String,
      enum: ["PUBLIC", "MEMBERS", "CONNECTIONS", "PRIVATE"],
      default: "MEMBERS",
    },
  },
  { _id: true, timestamps: true },
);

const profileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    /** Display name synced from the User account (and editable on profile). */
    name: { type: String, default: "", maxlength: 120, index: true },
    headline: { type: String, default: "", maxlength: 160 },
    about: { type: String, default: "", maxlength: 4000 },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", "UNDISCLOSED"],
      default: "UNDISCLOSED",
    },
    dateOfBirth: { type: Date, default: null },
    heightCm: { type: Number, default: null, min: 100, max: 250 },
    maritalStatus: {
      type: String,
      enum: ["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"],
      default: "NEVER_MARRIED",
    },
    religion: { type: String, default: null, index: true },
    community: { type: String, default: null, index: true },
    motherTongue: { type: String, default: null },
    languages: { type: [String], default: [] },
    education: { type: String, default: null },
    profession: { type: String, default: null, index: true },
    company: { type: String, default: null },
    incomeRange: { type: String, default: null },
    city: { type: String, default: null, index: true },
    state: { type: String, default: null },
    country: { type: String, default: "India", index: true },
    location: {
      type: { type: String, enum: ["Point"], required: false },
      coordinates: { type: [Number], required: false }, // [lng, lat]
    },
    lifestyle: {
      diet: { type: String, default: null },
      smoking: { type: String, default: null },
      drinking: { type: String, default: null },
    },
    photos: { type: [photoSchema], default: [] },
    isVerified: { type: Boolean, default: false, index: true },
    verificationStatus: {
      type: String,
      enum: ["NONE", "PENDING", "VERIFIED", "REJECTED"],
      default: "NONE",
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "MEMBERS", "HIDDEN"],
      default: "MEMBERS",
      index: true,
    },
    /** Granular discovery / interest privacy — birth raw fields stay off public APIs. */
    privacy: {
      showAge: { type: Boolean, default: true },
      showMoonSign: { type: Boolean, default: true },
      showLagna: { type: Boolean, default: true },
      showManglik: { type: Boolean, default: true },
      showNakshatra: { type: Boolean, default: true },
      acceptInterests: { type: Boolean, default: true },
      /** Reserved until presence infrastructure ships — UI explains this. */
      showOnlineStatus: { type: Boolean, default: false },
    },
    isProfileComplete: { type: Boolean, default: false },
    /** Set when user finishes or skips the guided onboarding wizard */
    onboardingCompletedAt: { type: Date, default: null },
    /** Visual personalization — independent of matchmaking / gender */
    appearance: {
      mode: { type: String, enum: ["light", "dark", "system"], default: "system" },
      expression: {
        type: String,
        enum: ["feminine", "masculine", "neutral"],
        default: "neutral",
      },
      theme: {
        type: String,
        enum: [
          "veda-gold",
          "rose-serenity",
          "crimson-heritage",
          "saffron-veda",
          "emerald-harmony",
          "midnight-veda",
        ],
        default: "veda-gold",
      },
      accentOverride: { type: String, default: null },
      borderIntensity: {
        type: String,
        enum: ["soft", "medium", "strong"],
        default: "medium",
      },
      reducedMotion: { type: Boolean, default: false },
    },
    /** Locale / region preferences — display only; never mutates birth or astrology data. */
    localization: {
      language: { type: String, default: "en", index: true },
      region: { type: String, default: "IN" },
      timezone: { type: String, default: "Asia/Kolkata" },
      dateFormat: {
        type: String,
        enum: ["locale", "DMY", "MDY", "YMD"],
        default: "locale",
      },
      timeFormat: { type: String, enum: ["12h", "24h"], default: "12h" },
      currency: { type: String, default: "INR" },
      /** null / empty = same as app language */
      aiLanguage: { type: String, default: null },
    },
    nationality: { type: String, default: null },
    openToInternationalMatches: { type: Boolean, default: false },
    openToRelocation: { type: Boolean, default: false },
    preferSameRegion: { type: Boolean, default: false },
    preferredCountries: { type: [String], default: [] },
    preferredMatchLanguages: { type: [String], default: [] },
  },
  baseSchemaOptions,
);

softDeletePlugin(profileSchema);
profileSchema.index({ location: "2dsphere" });
profileSchema.index({ city: 1, religion: 1, status: 1 });
profileSchema.index({ "photos.isPrimary": 1 });

export type ProfileDocument = InferSchemaType<typeof profileSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Profile =
  (models.Profile as Model<ProfileDocument>) ||
  model<ProfileDocument>("Profile", profileSchema, "profiles");

const birthDetailsSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    birthDate: { type: Date, required: true },
    birthTime: { type: String, required: true }, // HH:mm:ss local
    birthTimeUnknown: { type: Boolean, default: false },
    placeName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timezone: { type: String, required: true, default: "Asia/Kolkata" },
    ayanamsha: { type: String, default: "LAHIRI" },
    chartStylePreference: {
      type: String,
      enum: ["NORTH", "SOUTH", "EAST"],
      default: "NORTH",
    },
  },
  baseSchemaOptions,
);

softDeletePlugin(birthDetailsSchema);

export type BirthDetailsDocument = InferSchemaType<typeof birthDetailsSchema> & {
  _id: Schema.Types.ObjectId;
};
export const BirthDetails =
  (models.BirthDetails as Model<BirthDetailsDocument>) ||
  model<BirthDetailsDocument>("BirthDetails", birthDetailsSchema, "birth_details");

const partnerPreferencesSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    ageMin: { type: Number, default: 21 },
    ageMax: { type: Number, default: 40 },
    heightMinCm: { type: Number, default: null },
    heightMaxCm: { type: Number, default: null },
    religions: { type: [String], default: [] },
    communities: { type: [String], default: [] },
    motherTongues: { type: [String], default: [] },
    countries: { type: [String], default: ["India"] },
    cities: { type: [String], default: [] },
    educations: { type: [String], default: [] },
    professions: { type: [String], default: [] },
    maritalStatuses: { type: [String], default: ["NEVER_MARRIED"] },
    diet: { type: [String], default: [] },
    manglikPreference: {
      type: String,
      enum: ["ANY", "NON_MANGLIK", "MANGLIK", "PARTIAL_OK"],
      default: "ANY",
    },
    minCompatibilityScore: { type: Number, default: 18, min: 0, max: 36 },
    maxDistanceKm: { type: Number, default: null },
    openToInternationalMatches: { type: Boolean, default: false },
    openToRelocation: { type: Boolean, default: false },
    preferSameRegion: { type: Boolean, default: false },
    preferredCountries: { type: [String], default: [] },
    preferredLanguages: { type: [String], default: [] },
    notes: { type: String, default: "", maxlength: 2000 },
  },
  baseSchemaOptions,
);

softDeletePlugin(partnerPreferencesSchema);

export type PartnerPreferencesDocument = InferSchemaType<typeof partnerPreferencesSchema> & {
  _id: Schema.Types.ObjectId;
};
export const PartnerPreferences =
  (models.PartnerPreferences as Model<PartnerPreferencesDocument>) ||
  model<PartnerPreferencesDocument>(
    "PartnerPreferences",
    partnerPreferencesSchema,
    "partner_preferences",
  );
