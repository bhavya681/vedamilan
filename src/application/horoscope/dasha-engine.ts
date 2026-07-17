import { VIMSHOTTARI_LORDS, VIMSHOTTARI_YEARS, longitudeToNakshatra } from "./vedic-constants";

export type DashaPeriod = {
  lord: string;
  startDate: Date;
  endDate: Date;
  level: "MAHA" | "ANTAR";
  parentLord: string | null;
};

const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;

export function computeVimshottari(
  moonLongitude: number,
  birthDate: Date,
): {
  balanceAtBirth: { lord: string; yearsRemaining: number; nakshatra: string };
  periods: DashaPeriod[];
  currentMaha: string | null;
  currentAntar: string | null;
} {
  const { nakshatraIndex, nakshatra } = longitudeToNakshatra(moonLongitude);
  const lordIndex = nakshatraIndex % 9;
  const lord = VIMSHOTTARI_LORDS[lordIndex] ?? "Ketu";
  const span = 360 / 27;
  const norm = ((moonLongitude % 360) + 360) % 360;
  const progressed = (norm % span) / span;
  const totalYears = VIMSHOTTARI_YEARS[lord];
  const yearsRemaining = totalYears * (1 - progressed);

  const periods: DashaPeriod[] = [];
  let cursor = new Date(birthDate.getTime());
  const firstEnd = new Date(cursor.getTime() + yearsRemaining * MS_PER_YEAR);
  periods.push({
    lord,
    startDate: new Date(cursor),
    endDate: firstEnd,
    level: "MAHA",
    parentLord: null,
  });
  cursor = firstEnd;

  for (let i = 1; i < 9; i += 1) {
    const nextLord = VIMSHOTTARI_LORDS[(lordIndex + i) % 9] ?? "Ketu";
    const years = VIMSHOTTARI_YEARS[nextLord];
    const end = new Date(cursor.getTime() + years * MS_PER_YEAR);
    periods.push({
      lord: nextLord,
      startDate: new Date(cursor),
      endDate: end,
      level: "MAHA",
      parentLord: null,
    });
    cursor = end;
  }

  // Antardasha for current/first maha only (compact persistence)
  const firstMaha = periods[0]!;
  const antar: DashaPeriod[] = [];
  let antarCursor = new Date(firstMaha.startDate);
  const startIdx = VIMSHOTTARI_LORDS.indexOf(firstMaha.lord as (typeof VIMSHOTTARI_LORDS)[number]);
  for (let i = 0; i < 9; i += 1) {
    const aLord = VIMSHOTTARI_LORDS[(startIdx + i) % 9] ?? "Ketu";
    const portion =
      (VIMSHOTTARI_YEARS[aLord] / 120) *
      ((firstMaha.endDate.getTime() - firstMaha.startDate.getTime()) / MS_PER_YEAR);
    const end = new Date(antarCursor.getTime() + portion * MS_PER_YEAR);
    antar.push({
      lord: aLord,
      startDate: new Date(antarCursor),
      endDate: end,
      level: "ANTAR",
      parentLord: firstMaha.lord,
    });
    antarCursor = end;
  }

  const all = [...periods, ...antar];
  const now = new Date();
  const currentMaha =
    periods.find((p) => p.startDate <= now && p.endDate > now)?.lord ?? periods[0]?.lord ?? null;
  const currentAntar =
    antar.find((p) => p.startDate <= now && p.endDate > now)?.lord ?? antar[0]?.lord ?? null;

  return {
    balanceAtBirth: {
      lord,
      yearsRemaining: Number(yearsRemaining.toFixed(4)),
      nakshatra,
    },
    periods: all,
    currentMaha,
    currentAntar,
  };
}
