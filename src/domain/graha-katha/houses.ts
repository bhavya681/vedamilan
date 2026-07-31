/** Shared Bhava titles for house explorer UI */
export const BHAVA_TITLES: Record<number, string> = {
  1: "Self, Body & Vital Presence",
  2: "Wealth, Speech & Family Resources",
  3: "Courage, Effort & Siblings",
  4: "Home, Mother & Inner Peace",
  5: "Creativity, Children & Intelligence",
  6: "Service, Struggle & Daily Discipline",
  7: "Partnership & Relating",
  8: "Transformation, Shared Depth & Hidden Forces",
  9: "Dharma, Teachers & Higher Meaning",
  10: "Career, Reputation & Public Action",
  11: "Gains, Networks & Aspirations",
  12: "Release, Solitude & Spiritual Withdrawal",
};

export type HouseCopy = {
  traditional: string;
  lifeExpression: string;
  possibleLesson: string;
  reflection: string;
};

export function buildHouses(copies: HouseCopy[]) {
  if (copies.length !== 12) {
    throw new Error(`Expected 12 house interpretations, got ${copies.length}`);
  }
  return copies.map((copy, i) => {
    const house = i + 1;
    return {
      house,
      title: BHAVA_TITLES[house]!,
      ...copy,
    };
  });
}
