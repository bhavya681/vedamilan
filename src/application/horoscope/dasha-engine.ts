import { VIMSHOTTARI_LORDS, VIMSHOTTARI_YEARS, longitudeToNakshatra } from "./vedic-constants";

export type DashaPeriod = {
  lord: string;
  startDate: Date;
  endDate: Date;
  level: "MAHA" | "ANTAR";
  parentLord: string | null;
};

const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;

/** Expand Antardasha sub-periods for one Mahadasha (classical Vimshottari proportions). */
export function expandAntardashas(maha: {
  lord: string;
  startDate: Date;
  endDate: Date;
}): DashaPeriod[] {
  const antar: DashaPeriod[] = [];
  let antarCursor = new Date(maha.startDate);
  const startIdx = VIMSHOTTARI_LORDS.indexOf(maha.lord as (typeof VIMSHOTTARI_LORDS)[number]);
  const mahaYears = (maha.endDate.getTime() - maha.startDate.getTime()) / MS_PER_YEAR;

  for (let i = 0; i < 9; i += 1) {
    const aLord = VIMSHOTTARI_LORDS[(startIdx + i) % 9] ?? "Ketu";
    const portion = (VIMSHOTTARI_YEARS[aLord] / 120) * mahaYears;
    const end = new Date(antarCursor.getTime() + portion * MS_PER_YEAR);
    antar.push({
      lord: aLord,
      startDate: new Date(antarCursor),
      endDate: end,
      level: "ANTAR",
      parentLord: maha.lord,
    });
    antarCursor = end;
  }

  return antar;
}

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

  // Antardasha for every Mahadasha — needed for approximate marriage windows
  const antar: DashaPeriod[] = periods.flatMap((maha) => expandAntardashas(maha));

  const all = [...periods, ...antar];
  const now = new Date();
  const currentMaha =
    periods.find((p) => p.startDate <= now && p.endDate > now)?.lord ?? periods[0]?.lord ?? null;
  const currentMahaPeriod =
    periods.find((p) => p.lord === currentMaha && p.startDate <= now && p.endDate > now) ||
    periods.find((p) => p.startDate <= now && p.endDate > now);
  const currentAntarPool = currentMahaPeriod
    ? antar.filter((a) => a.parentLord === currentMahaPeriod.lord)
    : antar;
  const currentAntar =
    currentAntarPool.find((p) => p.startDate <= now && p.endDate > now)?.lord ??
    currentAntarPool[0]?.lord ??
    null;

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
