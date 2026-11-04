import { VIMSHOTTARI_LORDS, VIMSHOTTARI_YEARS, longitudeToNakshatra } from "./vedic-constants";

export type DashaPeriod = {
  lord: string;
  startDate: Date;
  endDate: Date;
  level: "MAHA" | "ANTAR";
  parentLord: string | null;
};

export type DashaPeriodLike = {
  lord: string;
  startDate: Date | string;
  endDate: Date | string;
  level: string;
  parentLord?: string | null;
};

const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;
const MIN_ANTAR_MS = 60_000;

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function dashaInstant(value: Date | string): number {
  const t = toDate(value).getTime();
  return Number.isFinite(t) ? t : Number.NaN;
}

export function isDashaCurrent(
  start: Date | string,
  end: Date | string,
  now: Date | number = Date.now(),
): boolean {
  const a = dashaInstant(start);
  const b = dashaInstant(end);
  const n = typeof now === "number" ? now : now.getTime();
  return Number.isFinite(a) && Number.isFinite(b) && a <= n && n < b;
}

/**
 * Expand Antardasha sub-periods for one Mahadasha.
 *
 * Uses the full classical Vimshottari length of that lord, then clips to the
 * actual Mahadasha window. The first (balance) Mahadasha is almost always a
 * remainder — compressing all 9 Antardashas into the leftover years is wrong.
 */
export function expandAntardashas(maha: {
  lord: string;
  startDate: Date;
  endDate: Date;
}): DashaPeriod[] {
  const fullYears = VIMSHOTTARI_YEARS[maha.lord as keyof typeof VIMSHOTTARI_YEARS];
  const startIdx = VIMSHOTTARI_LORDS.indexOf(maha.lord as (typeof VIMSHOTTARI_LORDS)[number]);
  if (startIdx < 0 || !fullYears) return [];

  const mahaStart = maha.startDate.getTime();
  const mahaEnd = maha.endDate.getTime();
  if (!Number.isFinite(mahaStart) || !Number.isFinite(mahaEnd) || mahaEnd <= mahaStart) return [];

  const actualMs = mahaEnd - mahaStart;
  const fullMs = fullYears * MS_PER_YEAR;
  const elapsedBeforeMs = Math.max(0, fullMs - actualMs);
  const reconstructedStart =
    elapsedBeforeMs > MS_PER_YEAR * 0.002 ? mahaStart - elapsedBeforeMs : mahaStart;

  const antar: DashaPeriod[] = [];
  let cursor = reconstructedStart;

  for (let i = 0; i < 9; i += 1) {
    const aLord = VIMSHOTTARI_LORDS[(startIdx + i) % 9] ?? "Ketu";
    const portionMs = (VIMSHOTTARI_YEARS[aLord] / 120) * fullMs;
    const rawEnd = i === 8 ? reconstructedStart + fullMs : cursor + portionMs;
    const clipStart = Math.max(cursor, mahaStart);
    const clipEnd = Math.min(rawEnd, mahaEnd);
    if (clipEnd - clipStart >= MIN_ANTAR_MS) {
      antar.push({
        lord: aLord,
        startDate: new Date(clipStart),
        endDate: new Date(clipEnd),
        level: "ANTAR",
        parentLord: maha.lord,
      });
    }
    cursor = rawEnd;
  }

  if (antar.length > 0) {
    antar[antar.length - 1]!.endDate = new Date(mahaEnd);
  }

  return antar;
}

export function rebuildDashaFromMahas(
  periods: DashaPeriodLike[],
  now: Date = new Date(),
): {
  periods: DashaPeriod[];
  currentMaha: string | null;
  currentAntar: string | null;
  currentMahaPeriod: DashaPeriod | null;
  currentAntarPeriod: DashaPeriod | null;
} {
  const maha: DashaPeriod[] = periods
    .filter((p) => p.level === "MAHA")
    .map((p) => ({
      lord: p.lord,
      startDate: toDate(p.startDate),
      endDate: toDate(p.endDate),
      level: "MAHA" as const,
      parentLord: null,
    }))
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const antar = maha.flatMap((m) => expandAntardashas(m));
  const all = [...maha, ...antar];
  const currentMahaPeriod = maha.find((p) => isDashaCurrent(p.startDate, p.endDate, now)) ?? null;
  const currentAntarPeriod = currentMahaPeriod
    ? (antar.find(
        (p) =>
          p.parentLord === currentMahaPeriod.lord &&
          p.startDate.getTime() >= currentMahaPeriod.startDate.getTime() - MIN_ANTAR_MS &&
          p.endDate.getTime() <= currentMahaPeriod.endDate.getTime() + MIN_ANTAR_MS &&
          isDashaCurrent(p.startDate, p.endDate, now),
      ) ?? null)
    : null;

  return {
    periods: all,
    currentMaha: currentMahaPeriod?.lord ?? null,
    currentAntar: currentAntarPeriod?.lord ?? null,
    currentMahaPeriod,
    currentAntarPeriod,
  };
}

export function resolveCurrentDasha(periods: DashaPeriodLike[], now: Date = new Date()) {
  const rebuilt = rebuildDashaFromMahas(periods, now);
  return {
    currentMaha: rebuilt.currentMaha,
    currentAntar: rebuilt.currentAntar,
    currentMahaPeriod: rebuilt.currentMahaPeriod,
    currentAntarPeriod: rebuilt.currentAntarPeriod,
    periods: rebuilt.periods,
  };
}

export function hydrateStoredDasha<
  T extends {
    periods?: DashaPeriodLike[] | null;
    currentMaha?: string | null;
    currentAntar?: string | null;
  },
>(dasha: T, now: Date = new Date()): T {
  const periods = Array.isArray(dasha.periods) ? dasha.periods : [];
  if (!periods.length) return dasha;
  const rebuilt = rebuildDashaFromMahas(periods, now);
  return {
    ...dasha,
    periods: rebuilt.periods,
    currentMaha: rebuilt.currentMaha,
    currentAntar: rebuilt.currentAntar,
  };
}

export function computeVimshottari(
  moonLongitude: number,
  birthDate: Date,
  now: Date = new Date(),
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

  const maha: DashaPeriod[] = [];
  let cursor = new Date(birthDate.getTime());
  const firstEnd = new Date(cursor.getTime() + yearsRemaining * MS_PER_YEAR);
  maha.push({
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
    maha.push({
      lord: nextLord,
      startDate: new Date(cursor),
      endDate: end,
      level: "MAHA",
      parentLord: null,
    });
    cursor = end;
  }

  const rebuilt = rebuildDashaFromMahas(maha, now);

  return {
    balanceAtBirth: {
      lord,
      yearsRemaining: Number(yearsRemaining.toFixed(4)),
      nakshatra,
    },
    periods: rebuilt.periods,
    currentMaha: rebuilt.currentMaha,
    currentAntar: rebuilt.currentAntar,
  };
}
