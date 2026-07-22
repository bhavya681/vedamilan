/**
 * @deprecated Prefer `@/application/rules/timing-prediction` for full Gochar + dasha reads.
 * Kept as a thin re-export so existing imports keep working.
 */
export type { TimingWindow as MarriageWindow } from "./timing-prediction";
export { computeMarriageWindows } from "./timing-prediction";
