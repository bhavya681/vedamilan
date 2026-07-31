/**
 * Extensible Vedic learning content model (Graha Katha).
 * Future kinds: nakshatra, rashi, bhava, yoga, deity, concept.
 */

export type KnowledgeKind =
  "graha" | "nakshatra" | "rashi" | "bhava" | "yoga" | "deity" | "concept";

export type GrahaId =
  "surya" | "chandra" | "mangal" | "budha" | "guru" | "shukra" | "shani" | "rahu" | "ketu";

export type GrahaAccent = "gold" | "saffron" | "cosmic" | "rose" | "ivory" | "charcoal";

/** Content section labels — always shown to users for epistemic clarity. */
export type ContentLabel =
  "traditional" | "story" | "interpretive" | "remedy" | "reflection" | "chart";

export type StoryChapter = {
  id: string;
  number: number;
  title: string;
  narrative: string;
  symbolizes: string;
  astrologicalConnection: string;
  keyTeaching?: string;
};

export type HouseInterpretation = {
  house: number;
  title: string;
  traditional: string;
  lifeExpression: string;
  possibleLesson: string;
  reflection: string;
};

export type Remedy = {
  id: string;
  title: string;
  body: string;
  /** Traditional practice — not medical advice */
  kind: "discipline" | "mantra" | "service" | "lifestyle" | "offering" | "reflection";
};

export type ReflectionPrompt = {
  id: string;
  prompt: string;
};

export type LifeDomain =
  "career" | "relationships" | "family" | "mind" | "health" | "spirituality" | "wealth";

export type GrahaNature = {
  coreNature: string;
  represents: string[];
  innerLesson: string;
  whenStrong: string;
  whenChallenged: string;
  lifeDomains: Partial<Record<LifeDomain, string>>;
};

export type GrahaIdentity = {
  id: GrahaId;
  kind: "graha";
  sanskritName: string;
  englishName: string;
  /** Engine planet name used in horoscope.planets */
  engineName: string;
  archetype: string;
  essence: string;
  visualConcept: string;
  deityAssociation?: string;
  element?: string;
  guna?: string;
  day?: string;
  colour?: string;
  gemstone?: string;
  mantra?: string;
  tags: string[];
  accent: GrahaAccent;
  metadata: string[];
};

export type GrahaEntity = GrahaIdentity & {
  introduction: string;
  chapters: StoryChapter[];
  nature: GrahaNature;
  houses: HouseInterpretation[];
  remedies: Remedy[];
  reflections: ReflectionPrompt[];
  relatedGrahaIds: GrahaId[];
  searchKeywords: string[];
  /** Extra labeled sections (e.g. Shukra & Relationships) */
  specialSections?: Array<{
    id: string;
    label: ContentLabel;
    title: string;
    body: string;
  }>;
};

export type GrahaComparePair = {
  id: string;
  a: GrahaId;
  b: GrahaId;
  title: string;
  symbolicRelationship: string;
  mythology: string;
  traditional: string;
  constructive: string;
  challenging: string;
};
