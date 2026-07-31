import type { GrahaId } from "@/domain/graha-katha/types";

export const GRAHA_IDS: readonly GrahaId[] = [
  "surya",
  "chandra",
  "mangal",
  "budha",
  "guru",
  "shukra",
  "shani",
  "rahu",
  "ketu",
] as const;

export function isGrahaId(id: string): id is GrahaId {
  return (GRAHA_IDS as readonly string[]).includes(id);
}
