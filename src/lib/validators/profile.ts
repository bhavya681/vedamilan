import { z } from "zod";

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    headline: z.string().max(160).optional(),
    about: z.string().max(4000).optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "UNDISCLOSED"]).optional(),
    dateOfBirth: z
      .string()
      .datetime()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional()
      .nullable(),
    heightCm: z.number().min(100).max(250).optional().nullable(),
    maritalStatus: z.enum(["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"]).optional(),
    religion: z.string().max(80).optional().nullable(),
    community: z.string().max(80).optional().nullable(),
    motherTongue: z.string().max(80).optional().nullable(),
    languages: z.array(z.string()).optional(),
    education: z.string().max(120).optional().nullable(),
    profession: z.string().max(120).optional().nullable(),
    company: z.string().max(120).optional().nullable(),
    incomeRange: z.string().max(80).optional().nullable(),
    city: z.string().max(80).optional().nullable(),
    state: z.string().max(80).optional().nullable(),
    country: z.string().max(80).optional(),
    lifestyle: z
      .object({
        diet: z.string().optional().nullable(),
        smoking: z.string().optional().nullable(),
        drinking: z.string().optional().nullable(),
      })
      .optional(),
    visibility: z.enum(["PUBLIC", "MEMBERS", "HIDDEN"]).optional(),
    privacy: z
      .object({
        showAge: z.boolean().optional(),
        showMoonSign: z.boolean().optional(),
        showLagna: z.boolean().optional(),
        showManglik: z.boolean().optional(),
        showNakshatra: z.boolean().optional(),
        acceptInterests: z.boolean().optional(),
        showOnlineStatus: z.boolean().optional(),
      })
      .optional(),
    /** Pass true to mark guided onboarding finished (or skipped). */
    completeOnboarding: z.boolean().optional(),
  })
  .strict();

export const partnerPreferencesSchema = z.object({
  ageMin: z.number().min(18).max(80).optional(),
  ageMax: z.number().min(18).max(80).optional(),
  heightMinCm: z.number().min(100).max(250).optional().nullable(),
  heightMaxCm: z.number().min(100).max(250).optional().nullable(),
  religions: z.array(z.string()).optional(),
  communities: z.array(z.string()).optional(),
  motherTongues: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  cities: z.array(z.string()).optional(),
  educations: z.array(z.string()).optional(),
  professions: z.array(z.string()).optional(),
  maritalStatuses: z.array(z.string()).optional(),
  diet: z.array(z.string()).optional(),
  manglikPreference: z.enum(["ANY", "NON_MANGLIK", "MANGLIK", "PARTIAL_OK"]).optional(),
  minCompatibilityScore: z.number().min(0).max(36).optional(),
  maxDistanceKm: z.number().min(1).max(20000).optional().nullable(),
  requireSituationalAlignment: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
});

export const birthDetailsSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  birthTimeUnknown: z.boolean().optional(),
  placeName: z.string().min(2).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(2).max(64).default("Asia/Kolkata"),
  ayanamsha: z.string().optional(),
  chartStylePreference: z.enum(["NORTH", "SOUTH", "EAST"]).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PartnerPreferencesInput = z.infer<typeof partnerPreferencesSchema>;
export type BirthDetailsInput = z.infer<typeof birthDetailsSchema>;
