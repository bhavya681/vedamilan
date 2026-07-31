import type { GrahaComparePair } from "@/domain/graha-katha/types";

/** Seed pairs for Phase 4 compare UI — educational, not chart conjunction engine. */
export const GRAHA_COMPARE_PAIRS: GrahaComparePair[] = [
  {
    id: "surya-shani",
    a: "surya",
    b: "shani",
    title: "Surya × Shani",
    symbolicRelationship: "Authority meeting accountability; light meeting time.",
    mythology: "Father–son symbolism of Surya and Chhāyā’s child Shani.",
    traditional:
      "Traditionally read as tension or maturation between ego/visibility and duty/delay.",
    constructive: "Leadership that accepts consequence; integrity under pressure.",
    challenging: "Pride versus restriction; father-themes that need healing dialogue.",
  },
  {
    id: "chandra-budha",
    a: "chandra",
    b: "budha",
    title: "Chandra × Budha",
    symbolicRelationship: "Feeling meeting language; ocean meeting messenger.",
    mythology: "Lore linking Moon, Tārā, and the birth of Budha.",
    traditional: "Often discussed for mental agility, speech-emotion harmony, or restlessness.",
    constructive: "Emotional intelligence articulated clearly.",
    challenging: "Overthinking moods; nervous chatter without grounding.",
  },
  {
    id: "shukra-guru",
    a: "shukra",
    b: "guru",
    title: "Shukra × Guru",
    symbolicRelationship: "Desire refined by wisdom; two teachers of life.",
    mythology: "Shukrāchārya and Bṛhaspati as complementary gurus.",
    traditional: "Values around love, learning, pleasure, and ethics in expansion.",
    constructive: "Joy guided by dharma; generosity with taste.",
    challenging: "Indulgence versus dogma; pleasure without principle or principle without warmth.",
  },
  {
    id: "rahu-ketu",
    a: "rahu",
    b: "ketu",
    title: "Rahu × Ketu",
    symbolicRelationship: "Desire axis — hunger and release as one continuum.",
    mythology: "The eclipse pair; head and body of the shadow story.",
    traditional:
      "Always read as an axis: where life amplifies wanting vs where it invites surrender.",
    constructive: "Conscious ambition paired with spiritual insight.",
    challenging: "Obsession without grounding, or detachment without direction.",
  },
  {
    id: "mangal-shukra",
    a: "mangal",
    b: "shukra",
    title: "Mangal × Shukra",
    symbolicRelationship: "Passion meeting refinement; heat meeting harmony.",
    mythology: "Warrior force and the aesthetic guide of desire in dialogue.",
    traditional: "Often discussed for magnetism, creative fire, and relationship intensity.",
    constructive: "Passionate love with consent and craft; art with vitality.",
    challenging: "Conflict in desire; haste that bruises tenderness.",
  },
];

export function listComparePairs() {
  return GRAHA_COMPARE_PAIRS;
}

export function getComparePair(id: string) {
  return GRAHA_COMPARE_PAIRS.find((p) => p.id === id) ?? null;
}
