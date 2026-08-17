import type { GrahaName, NumberId } from "./types";
import { NUMEROLOGY_NUMBERS } from "./numbers";

export type NumberLucky = {
  number: NumberId;
  planet: GrahaName;
  colors: string[];
  day: string;
  gem: string;
  metal: string;
};

/** Traditional Cheiro / Indian numerology lucky associations for 1–9. */
export const NUMBER_LUCKY: Record<NumberId, Omit<NumberLucky, "number" | "planet">> = {
  1: { colors: ["Gold", "Orange", "Copper"], day: "Sunday", gem: "Ruby", metal: "Gold" },
  2: { colors: ["White", "Cream", "Silver"], day: "Monday", gem: "Pearl", metal: "Silver" },
  3: { colors: ["Yellow", "Gold"], day: "Thursday", gem: "Yellow sapphire", metal: "Gold" },
  4: { colors: ["Blue", "Grey"], day: "Saturday", gem: "Hessonite (Gomed)", metal: "Lead" },
  5: { colors: ["Green"], day: "Wednesday", gem: "Emerald", metal: "Bronze" },
  6: { colors: ["White", "Pink", "Light blue"], day: "Friday", gem: "Diamond", metal: "Silver" },
  7: { colors: ["Brown", "Green", "Grey"], day: "Tuesday", gem: "Cat’s eye", metal: "Silver" },
  8: { colors: ["Black", "Dark blue"], day: "Saturday", gem: "Blue sapphire", metal: "Iron" },
  9: { colors: ["Red", "Coral"], day: "Tuesday", gem: "Red coral", metal: "Copper" },
};

export function luckyForNumber(n: NumberId): NumberLucky {
  return { number: n, planet: NUMEROLOGY_NUMBERS[n].planet, ...NUMBER_LUCKY[n] };
}
