/**
 * Public Graha Katha surface for UI:
 * - summaries / search for the library (light)
 * - loadGraha / prefetchGraha for detail pages (code-split)
 *
 * Full sync catalog: import from `@/domain/graha-katha/catalog` (tests / scripts only).
 */
export * from "@/domain/graha-katha/types";
export * from "@/domain/graha-katha/houses";
export * from "@/domain/graha-katha/engine-map";
export * from "@/domain/graha-katha/ids";
export * from "@/domain/graha-katha/summaries";
export * from "@/domain/graha-katha/compare";
export { loadGraha, prefetchGraha } from "@/domain/graha-katha/loaders";
