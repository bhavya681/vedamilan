import {
  expandAntardashas,
  isDashaCurrent,
  type DashaPeriod,
} from "@/application/horoscope/dasha-engine";

export type DashaPeriodInput = {
  lord: string;
  level: string;
  startDate: string;
  endDate: string;
  parentLord?: string | null;
};

export function dashaLevelLabel(level: string) {
  const normalized = level.toUpperCase();
  if (normalized === "MAHA") return "Mahadasha";
  if (normalized === "ANTAR") return "Antardasha";
  if (normalized === "PRATYANTAR") return "Pratyantardasha";
  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
}

export function dashaPeriodText(maha?: string | null, antar?: string | null) {
  return [maha ? `Mahadasha ${maha}` : null, antar ? `Antardasha ${antar}` : null]
    .filter(Boolean)
    .join(" · ");
}

export function formatDashaDay(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function dashaYearsBetween(start: string | Date, end: string | Date) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return null;
  return (b - a) / (365.2425 * 24 * 60 * 60 * 1000);
}

export function dashaProgress(start: string | Date, end: string | Date, now = Date.now()) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.min(1, Math.max(0, (now - a) / (b - a)));
}

export function buildDashaView(periods: DashaPeriodInput[], now = Date.now()) {
  const maha = periods
    .filter((p) => p.level === "MAHA")
    .slice()
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const antarsByMaha = new Map<string, DashaPeriod[]>();
  for (const m of maha) {
    const key = `${m.lord}::${m.startDate}`;
    antarsByMaha.set(
      key,
      expandAntardashas({
        lord: m.lord,
        startDate: new Date(m.startDate),
        endDate: new Date(m.endDate),
      }),
    );
  }

  const currentMaha = maha.find((p) => isDashaCurrent(p.startDate, p.endDate, now)) ?? null;
  const currentAntars = currentMaha
    ? (antarsByMaha.get(`${currentMaha.lord}::${currentMaha.startDate}`) ?? [])
    : [];
  const currentAntar =
    currentAntars.find((p) => isDashaCurrent(p.startDate, p.endDate, now)) ?? null;

  return { maha, antarsByMaha, currentMaha, currentAntar };
}
