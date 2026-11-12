/**
 * Shared types for the VedaMilan classical yoga system.
 *
 * Design goals:
 * - One source of truth for every cataloged classical yoga (metadata + source).
 * - Independent, deterministic, testable detection rules per yoga.
 * - Strict separation of Parashari and Jaimini rules.
 * - Explicit status so a cataloged-but-undetected yoga is never confused with an
 *   "absent" yoga.
 */

import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Categories                                                         */
/* ------------------------------------------------------------------ */

export type YogaCategoryId =
  | "raja"
  | "dhana"
  | "solar"
  | "lunar"
  | "mahapurusha"
  | "nabhasa"
  | "planetary"
  | "other"
  | "jaimini"
  | "nakshatra";

export const YOGA_CATEGORY_ORDER: YogaCategoryId[] = [
  "raja",
  "dhana",
  "solar",
  "lunar",
  "mahapurusha",
  "nabhasa",
  "planetary",
  "jaimini",
  "nakshatra",
  "other",
];

export type YogaCategoryLabel = {
  raja: "Raja Yoga";
  dhana: "Dhana Yoga";
  solar: "Solar Yoga";
  lunar: "Lunar Yoga";
  mahapurusha: "Pancha Mahapurusha";
  nabhasa: "Nabhasa Yoga";
  planetary: "Planetary Yoga";
  jaimini: "Jaimini Yoga";
  nakshatra: "Nakshatra Yoga";
  other: "Other Classical Yogas";
}[YogaCategoryId];

export type YogaGroup = "Raja Yoga" | "Dhana Yoga" | "Pancha Mahapurusha" | "Lunar Yoga" | "Solar Yoga" | "Nabhasa Yoga" | "Planetary Yoga" | "Jaimini Yoga" | "Nakshatra Yoga" | "Other Classical Yogas";

/* ------------------------------------------------------------------ */
/* Sources                                                            */
/* ------------------------------------------------------------------ */

export type YogaSourceText =
  | "BPHS"
  | "Phaladeepika"
  | "Saravali"
  | "Jataka_Parijata"
  | "Brihat_Jataka"
  | "Jaimini_Sutras"
  | "Multiple"
  | "Classical"
  | "Modern_Convention";

export interface YogaClassicalReference {
  text: YogaSourceText;
  /** Chapter reference (verified where known). Omit when not verified. */
  chapter?: string;
  /** Verse reference (verified where known). Omit when not verified. */
  verse?: string;
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Catalog entry                                                      */
/* ------------------------------------------------------------------ */

export type ImplementationStatus =
  | "implemented"
  | "partial"
  | "planned"
  | "not_implemented";

export interface YogaCatalogEntry {
  /** Stable, unique identifier (used in URLs, tests, storage). */
  id: string;
  /** Commonly used name. */
  name: string;
  /** Sanskrit / classical name when known. */
  sanskritName?: string;
  /** Alternative / regional names. */
  alternativeNames: string[];
  category: YogaCategoryId;
  group: YogaGroup;
  icon: LucideIcon;
  description: string;
  shortMeaning?: string;
  classicalReferences: YogaClassicalReference[];
  /** The classical house/sign inputs this yoga reads (for transparency). */
  inputs: {
    planets: string[];
    houses: number[];
    signs?: string[];
    fromLagna?: boolean;
    fromMoon?: boolean;
    fromSun?: boolean;
  };
  /** Human-readable formation conditions. */
  formation: string[];
  exclusions: string[];
  cancellation: string[];
  /** Classical interpretation. */
  interpretation: string;
  lifeAreas: string[];
  strengthFactors: string[];
  /** Whether the detection rule exists and is unit-tested. */
  implementationStatus: ImplementationStatus;
  /** True only when a passing unit test exists for this entry. */
  tested: boolean;
  /** When false, the library shows "Detection not yet implemented" rather than "Not formed". */
  calculationSupported: boolean;
}

/* ------------------------------------------------------------------ */
/* Detection result                                                   */
/* ------------------------------------------------------------------ */

export type YogaPresence = "present" | "absent" | "cancelled" | "insufficient_data" | "not_implemented";

export interface YogaDetectionResult {
  id: string;
  name: string;
  category: YogaCategoryId;
  group: YogaGroup;
  presence: YogaPresence;
  /** 0-100 qualitative strength where calculable; null when not calculable. */
  strength: number | null;
  /** Planets actually involved in this instance. */
  planets: string[];
  houses: number[];
  signs: string[];
  /** Short plain-language condition satisfied (or why absent). */
  condition: string;
  /** Classical reference for this instance. */
  classicalReference: string | null;
  /** Cancellation notes when present === "cancelled". */
  cancellationNote: string | null;
  /** Detailed explanation exposed on the detail page. */
  explanation: string;
  /** Why present / absent / cancelled (for transparency). */
  rationale: string;
}

export interface YogaEngineContext {
  planets: ChartPlanetLike[];
  houseLords: Record<string, string>;
  lagnaSign: string;
  lagnaSignId: number;
  lagnaLongitude: number;
  moon?: ChartPlanetLike;
  sun?: ChartPlanetLike;
}

export interface ChartPlanetLike {
  planet: string;
  sign: string;
  signId: number;
  house: number;
  longitude: number;
  latitude: number;
  speed: number;
  isRetrograde: boolean;
  nakshatra: string;
  nakshatraPada: number;
  dignity: string | null;
}

/* ------------------------------------------------------------------ */
/* Rule function signature                                            */
/* ------------------------------------------------------------------ */

export type YogaRule = (ctx: YogaEngineContext) => YogaDetectionResult | null;

/* ------------------------------------------------------------------ */
/* Registry                                                           */
/* ------------------------------------------------------------------ */

export interface YogaRuleRegistryEntry {
  id: string;
  rule: YogaRule;
  entry: YogaCatalogEntry;
}
