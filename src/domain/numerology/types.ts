/**
 * Vedic numerology content model.
 *
 * Numbers 1–9 map to the nine classical grahas (planets). The
 * number→planet mapping and per-number interpretations below are
 * tagged with a knowledge label so the UI can distinguish:
 *
 *  - "traditional"   — planetary/number associations of this system
 *  - "contemporary"  — interpretations sourced from teaching notes
 *  - "personalized"  — the product's synthesis of number + the member's Kundli
 */

export type NumberId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type GrahaName =
  "Sun" | "Moon" | "Jupiter" | "Rahu" | "Mercury" | "Venus" | "Ketu" | "Saturn" | "Mars";

export type KnowledgeLabel = "traditional" | "contemporary" | "personalized";

export type NumberTheme =
  | "leadership"
  | "emotions"
  | "wisdom"
  | "innovation"
  | "communication"
  | "harmony"
  | "intuition"
  | "discipline"
  | "courage";

export type LifeAspect =
  | "core"
  | "strength"
  | "growth"
  | "career"
  | "relationship"
  | "communication"
  | "learning"
  | "remedy";

/** A labeled block of interpretation text. */
export type InterpretationBlock = {
  label: KnowledgeLabel;
  body: string;
};

/** Full per-number profile used by cards, detail views, and the calculator. */
export type MasterNumber = 11 | 22;

export type NumerologyDateInput = {
  day: number;
  month: number;
  year: number;
};

export type NumberProfile = {
  number: NumberId;
  planet: GrahaName;
  keyword: string;
  coreEnergy: string;
  theme: NumberTheme;
  /** Core tendencies — always shown */
  coreTendencies: InterpretationBlock[];
  /** Strengths */
  strengths: InterpretationBlock[];
  /** Growth areas / challenges */
  growthAreas: InterpretationBlock[];
  /** Career tendencies */
  career: InterpretationBlock[];
  /** Relationship tendencies */
  relationships: InterpretationBlock[];
  /** Communication style */
  communication: InterpretationBlock[];
  /** Learning style */
  learning: InterpretationBlock[];
  /** Remedial / balancing suggestions */
  remedies: InterpretationBlock[];
  /** Master-number note for 11 / 22 paths that collapse here */
  masterNote?: string;
};

/** Personalized guidance drawn from number + the member's Kundli context. */
export type PersonalizedGuidance = {
  number: NumberId;
  planet: GrahaName;
  /** e.g. "Moon in Taurus (own sign), H6" */
  kundliPlacement?: string;
  synthesis: string;
  practicalTip: string;
};

export type NumerologyResult = {
  mulank: NumberId;
  bhagyank: NumberId;
  /** 11 / 22 preserved when calculateBhagyank is called with masters option and present */
  bhagyankMaster?: number | null;
  day: number;
  month: number;
  year: number;
  dateDisplay: string;
};

export type CombinationInterpretation = {
  mulank: NumberId;
  bhagyank: NumberId;
  /** Whether the knowledge base defines this specific pair. */
  defined: boolean;
  interaction?: string;
  complement?: string;
  tension?: string;
  strengths?: string;
  practicalAdvice?: string;
};

/** Learning module in the progressive path. */
export type LearningModule = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  order: number;
};

/**
 * Numerology-based compatibility between two people.
 * Complements the Vedic astrological compatibility system; never replaces it.
 */
export type NumerologyCompatibilityResult = {
  /** Two people's numbers: Person A = viewer, Person B = candidate. */
  personA: {
    mulank: NumberId;
    bhagyank: NumberId;
    mulankPlanet: GrahaName;
    bhagyankPlanet: GrahaName;
  };
  personB: {
    mulank: NumberId;
    bhagyank: NumberId;
    mulankPlanet: GrahaName;
    bhagyankPlanet: GrahaName;
  };
  /** 0-100 harmony score derived from number resonance + planet harmony + combination quality. */
  score: number;
  /** Human-readable summary of the numerological dynamic. */
  insight: string;
  /** Whether the harmony is generally supportive (true) or requires conscious bridging (false). */
  isHarmonious: boolean;
  /** Specific resonant/non-resonant number pair explanations. */
  pairNotes: Array<{
    pair: string;
    score: number;
    description: string;
  }>;
};
