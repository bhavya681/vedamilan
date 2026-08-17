/**
 * Public surface for the numerology domain layer.
 *
 * Re-exports calculations, number knowledge, and combination logic.
 * UI components import from here — never from internal files directly.
 */
export type {
  CombinationInterpretation,
  GrahaName,
  InterpretationBlock,
  KnowledgeLabel,
  LearningModule,
  LifeAspect,
  MasterNumber,
  NumberId,
  NumberProfile,
  NumberTheme,
  NumerologyCompatibilityResult,
  NumerologyDateInput,
  NumerologyResult,
  PersonalizedGuidance,
} from "./types";

export {
  NUMEROLOGY_NUMBERS,
  NUMBER_KEYWORDS,
  NUMBER_CORE_ENERGY,
  planetForNumber,
  themeForNumber,
  numberForPlanet,
} from "./numbers";

export { NUMBER_PROFILES, getNumberProfile, listNumberProfiles } from "./interpretations";

export {
  MASTER_NUMBERS,
  calculateBhagyank,
  calculateMulank,
  calculationTrace,
  dateToNumerologyInput,
  digitSum,
  isMasterNumber,
  reduceToSingle,
  type CalculationTrace,
} from "./calculations";

export { getCombination, getCombinationOrGeneric, genericInteraction } from "./combinations";

export { NUMBER_LUCKY, luckyForNumber, type NumberLucky } from "./lucky";

export {
  LOSHU_LAYOUT,
  PERSONAL_YEAR_THEME,
  buildLoshuGrid,
  calculateChaldeanNameNumber,
  calculatePersonalYear,
  compoundBhagyank,
  dateDigits,
  type LoshuGrid,
  type NameNumberResult,
} from "./grids";
