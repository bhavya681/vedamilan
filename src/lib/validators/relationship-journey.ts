import { z } from "zod";

export const lifePathUpdateSchema = z.object({
  answers: z.record(z.string(), z.string().max(80).nullable()).default({}),
});

export const noteCreateSchema = z.object({
  partnerUserId: z.string().min(1),
  body: z.string().trim().min(2).max(2000),
});

export const noteUpdateSchema = z.object({
  body: z.string().trim().min(2).max(2000),
});

export const journeyStageSchema = z.object({
  partnerUserId: z.string().min(1),
  stageId: z.enum([
    "break_the_ice",
    "discover_values",
    "life_goals",
    "family_expectations",
    "marriage_expectations",
  ]),
});

export const shareInsightSchema = z.object({
  partnerUserId: z.string().min(1),
  title: z.string().trim().min(2).max(160),
  body: z.string().trim().min(2).max(2000),
  category: z.enum(["ALIGN", "DIFFER", "DISCUSS", "CUSTOM"]).optional(),
  source: z.enum(["COMPATIBILITY", "LIFE_PATH", "USER"]).optional(),
});

export const whatIfSchema = z.object({
  partnerUserId: z.string().min(1),
  scenarioId: z.enum([
    "relocate_after_marriage",
    "career_priority",
    "high_family_involvement",
    "different_lifestyles",
    "long_distance_phase",
    "frequent_travel",
    "dual_demanding_careers",
    "children_timing",
  ]),
});

export const sharedQuestionCreateSchema = z.object({
  partnerUserId: z.string().min(1),
  question: z.string().trim().min(8).max(400),
});

export const sharedQuestionAnswerSchema = z.object({
  partnerUserId: z.string().min(1),
  questionId: z.string().min(1),
  body: z.string().trim().min(2).max(2000),
  reveal: z.boolean().optional().default(false),
});

export const milestoneSchema = z.object({
  partnerUserId: z.string().min(1),
  milestoneType: z.enum([
    "first_conversation",
    "first_video_call",
    "met_in_person",
    "family_introduced",
    "considering_seriously",
  ]),
  occurredOn: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional()
    .nullable(),
});
