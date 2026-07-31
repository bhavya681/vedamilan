import type { GrahaId } from "@/domain/graha-katha/types";

/** Graha Katha id → English name stored on horoscope.planets[].planet */
export const GRAHA_ENGINE_NAME: Record<GrahaId, string> = {
  surya: "Sun",
  chandra: "Moon",
  mangal: "Mars",
  budha: "Mercury",
  guru: "Jupiter",
  shukra: "Venus",
  shani: "Saturn",
  rahu: "Rahu",
  ketu: "Ketu",
};

export function engineNameForGraha(id: GrahaId): string {
  return GRAHA_ENGINE_NAME[id];
}

export function grahaIdFromEngineName(planet: string): GrahaId | null {
  const entry = (Object.entries(GRAHA_ENGINE_NAME) as [GrahaId, string][]).find(
    ([, name]) => name === planet,
  );
  return entry?.[0] ?? null;
}
