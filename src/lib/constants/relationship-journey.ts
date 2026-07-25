/**
 * Relationship Journey constants — progressive couple discovery (non-astrological + reflective AI).
 */

export const LIFE_PATH_CATEGORIES = [
  {
    key: "marriageTimeline",
    label: "Marriage timeline",
    options: ["Within 1 year", "1–2 years", "2–3 years", "Open / flexible", "Prefer not to say"],
  },
  {
    key: "location",
    label: "Preferred location",
    options: ["Stay local", "Open within country", "Open internationally", "Undecided"],
  },
  {
    key: "relocation",
    label: "Relocation",
    options: ["Happy to relocate", "Prefer partner relocates", "Prefer stay put", "Case by case"],
  },
  {
    key: "career",
    label: "Career priority",
    options: ["Very high", "High", "Balanced", "Flexible"],
  },
  {
    key: "familyInvolvement",
    label: "Family involvement",
    options: ["Very important", "Important", "Moderate", "Independent"],
  },
  {
    key: "children",
    label: "Children",
    options: ["Yes", "Maybe", "Not sure yet", "No", "Prefer not to say"],
  },
  {
    key: "lifestyle",
    label: "Lifestyle",
    options: ["Urban", "Suburban", "Quiet / rural lean", "Flexible"],
  },
  {
    key: "finances",
    label: "Financial philosophy",
    options: [
      "Shared planning",
      "Independent then merge",
      "Still figuring out",
      "Prefer not to say",
    ],
  },
  {
    key: "spirituality",
    label: "Spirituality",
    options: ["Central", "Important", "Personal / private", "Flexible"],
  },
  {
    key: "workLifeBalance",
    label: "Work–life balance",
    options: ["Family first", "Balanced", "Career seasons OK", "Still defining"],
  },
] as const;

export type LifePathKey = (typeof LIFE_PATH_CATEGORIES)[number]["key"];

export const JOURNEY_STAGES = [
  {
    id: "break_the_ice",
    title: "Break the ice",
    description: "Start gently — shared interests and light conversation.",
    prompts: [
      "What’s something small that made you smile this week?",
      "Coffee or chai — and what do you like with it?",
      "What’s a hobby you’d love someone to try with you once?",
      "Which city feels most like “home” to you, and why?",
    ],
  },
  {
    id: "discover_values",
    title: "Discover values",
    description: "Understand what matters day to day.",
    prompts: [
      "What does respect look like in a partnership for you?",
      "How do you usually handle disagreement?",
      "What personal growth are you focused on this year?",
      "What does emotional support mean to you?",
    ],
  },
  {
    id: "life_goals",
    title: "Discuss life goals",
    description: "Career, place, and the life you want to build.",
    prompts: [
      "Where do you see yourself living in five years?",
      "How important is career growth relative to family time?",
      "Would relocation for a partner’s opportunity be discussable?",
      "What lifestyle pace feels sustainable to you?",
    ],
  },
  {
    id: "family_expectations",
    title: "Family expectations",
    description: "Traditions, closeness, and healthy boundaries.",
    prompts: [
      "How involved do you hope families are after marriage?",
      "What living arrangement feels most comfortable early on?",
      "Which traditions matter most to you?",
      "How do you like to set boundaries with kindness?",
    ],
  },
  {
    id: "marriage_expectations",
    title: "Marriage expectations",
    description: "Timeline, partnership, and long-term vision.",
    prompts: [
      "What does a fulfilling marriage look like to you?",
      "How would you approach shared finances?",
      "Thoughts on children — and how to decide together?",
      "What does day-to-day partnership support look like?",
    ],
  },
] as const;

export type JourneyStageId = (typeof JOURNEY_STAGES)[number]["id"];

export const WHAT_IF_SCENARIOS = [
  {
    id: "relocate_after_marriage",
    title: "Relocate after marriage",
    prompt: "What if we relocate after marriage?",
    focuses: ["location", "relocation", "career", "familyInvolvement"],
  },
  {
    id: "career_priority",
    title: "One career takes priority",
    prompt: "What if one person’s career needs more focus for a season?",
    focuses: ["career", "workLifeBalance", "relocation"],
  },
  {
    id: "high_family_involvement",
    title: "High family involvement",
    prompt: "What if family involvement stays high on both sides?",
    focuses: ["familyInvolvement", "lifestyle", "spirituality"],
  },
  {
    id: "different_lifestyles",
    title: "Different social lifestyles",
    prompt: "What if our social lifestyles stay different?",
    focuses: ["lifestyle", "workLifeBalance"],
  },
  {
    id: "long_distance_phase",
    title: "Living in different places",
    prompt: "What if we need to live in different cities for a while?",
    focuses: ["location", "relocation", "career", "marriageTimeline"],
  },
  {
    id: "frequent_travel",
    title: "Frequent travel",
    prompt: "What if one partner travels often for work?",
    focuses: ["career", "workLifeBalance", "children"],
  },
  {
    id: "dual_demanding_careers",
    title: "Two demanding careers",
    prompt: "What if both of us keep demanding careers?",
    focuses: ["career", "workLifeBalance", "children", "finances"],
  },
  {
    id: "children_timing",
    title: "Children timing",
    prompt: "What if we have different timelines around children?",
    focuses: ["children", "marriageTimeline", "familyInvolvement"],
  },
] as const;

export type WhatIfScenarioId = (typeof WHAT_IF_SCENARIOS)[number]["id"];

export const SHARED_QUESTION_BANK = [
  "What does a fulfilling marriage look like to you?",
  "How do you hope to spend weekends together?",
  "What role should families play in your life as a couple?",
  "How do you like to handle money decisions?",
  "What would make you feel most supported during a hard week?",
] as const;

export const MILESTONE_TYPES = [
  { id: "first_conversation", label: "First conversation" },
  { id: "first_video_call", label: "First video call" },
  { id: "met_in_person", label: "Met in person" },
  { id: "family_introduced", label: "Family introduced" },
  { id: "considering_seriously", label: "Considering seriously" },
] as const;
