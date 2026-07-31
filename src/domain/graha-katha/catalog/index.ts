import { BUDHA } from "@/domain/graha-katha/catalog/budha";
import { CHANDRA } from "@/domain/graha-katha/catalog/chandra";
import { GURU } from "@/domain/graha-katha/catalog/guru";
import { KETU } from "@/domain/graha-katha/catalog/ketu";
import { MANGAL } from "@/domain/graha-katha/catalog/mangal";
import { RAHU } from "@/domain/graha-katha/catalog/rahu";
import { SHANI } from "@/domain/graha-katha/catalog/shani";
import { SHUKRA } from "@/domain/graha-katha/catalog/shukra";
import { SURYA } from "@/domain/graha-katha/catalog/surya";
import { isGrahaId } from "@/domain/graha-katha/ids";
import type { GrahaEntity, GrahaId } from "@/domain/graha-katha/types";

const GRAHAS: GrahaEntity[] = [SURYA, CHANDRA, MANGAL, BUDHA, GURU, SHUKRA, SHANI, RAHU, KETU];

const BY_ID = Object.fromEntries(GRAHAS.map((g) => [g.id, g])) as Record<GrahaId, GrahaEntity>;

/** Sync full catalog — heavy. Prefer summaries + loadGraha in client routes. */
export function listGrahas(): GrahaEntity[] {
  return GRAHAS;
}

export function getGraha(id: string): GrahaEntity | null {
  if (!isGrahaId(id)) return null;
  return BY_ID[id] ?? null;
}

export { isGrahaId };

/** Keyword search over titles, tags, and searchKeywords (Phase 5 semantic later). */
export function searchGrahas(query: string): GrahaEntity[] {
  const q = query.trim().toLowerCase();
  if (!q) return GRAHAS;
  return GRAHAS.filter((g) => {
    const hay = [
      g.id,
      g.sanskritName,
      g.englishName,
      g.archetype,
      g.essence,
      ...g.tags,
      ...g.searchKeywords,
      ...g.metadata,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export { SURYA, CHANDRA, MANGAL, BUDHA, GURU, SHUKRA, SHANI, RAHU, KETU };
