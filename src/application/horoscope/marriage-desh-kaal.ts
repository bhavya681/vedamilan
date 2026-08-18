/** Desh–Kaal–Patra filter for marriage timing. Never invents a wedding day. */

export type MarriageLikelihood = "likely" | "possible" | "not-yet" | "later" | "already-settled";

export type MarriagePlaceNorm = {
  region: string;
  legalMin: number;
  typicalMin: number;
  typicalMax: number;
  lateMax: number;
};

export type DatedPartnershipWindow = {
  label: string;
  range: string;
  role: string;
  startDate: string;
  endDate: string;
};

export type MarriageTimingWindow = DatedPartnershipWindow & {
  dashaRange: string;
  ageYears: number | null;
  likelihood: MarriageLikelihood;
  note: string;
};

export type MarriageDeshKaalRead = {
  country: string;
  city: string | null;
  placeLabel: string;
  ageYears: number | null;
  maritalStatus: string | null;
  region: string;
  legalMin: number;
  typicalMin: number;
  typicalMax: number;
  placeNote: string;
  timeNote: string;
  vesselNote: string;
  verdict: MarriageLikelihood;
  verdictTitle: string;
  verdictReason: string;
  windows: MarriageTimingWindow[];
};

const SOUTH_ASIA = ["india", "nepal", "bangladesh", "sri lanka", "pakistan", "bhutan", "maldives"];
const GULF = ["uae", "united arab emirates", "saudi arabia", "qatar", "kuwait", "oman", "bahrain"];
const EAST_ASIA = ["japan", "south korea", "korea", "china", "singapore", "taiwan", "hong kong"];
const SE_ASIA = ["indonesia", "malaysia", "thailand", "vietnam", "philippines"];
const WEST = [
  "united states",
  "usa",
  "canada",
  "united kingdom",
  "uk",
  "england",
  "australia",
  "new zealand",
  "ireland",
  "germany",
  "france",
  "netherlands",
  "sweden",
  "norway",
  "denmark",
  "switzerland",
  "italy",
  "spain",
];

function asDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function normText(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

export function inferCountryFromPlace(
  country: string | null | undefined,
  placeName: string | null | undefined,
) {
  if (country && country.trim()) return country.trim();
  const hay = normText(placeName);
  if (hay.includes("india")) return "India";
  if (hay.includes("nepal")) return "Nepal";
  if (hay.includes("bangladesh")) return "Bangladesh";
  if (hay.includes("sri lanka")) return "Sri Lanka";
  if (hay.includes("pakistan")) return "Pakistan";
  if (hay.includes("united states") || hay.includes("usa")) return "United States";
  if (hay.includes("united kingdom") || /\buk\b/.test(hay)) return "United Kingdom";
  if (hay.includes("united arab") || hay.includes("dubai") || hay.includes("uae")) {
    return "United Arab Emirates";
  }
  if (hay.includes("canada")) return "Canada";
  if (hay.includes("australia")) return "Australia";
  if (hay.includes("singapore")) return "Singapore";
  return null;
}

function includesAny(haystack: string, needles: string[]) {
  return needles.some((n) => haystack.includes(n));
}

export function ageAt(date: Date, birth: Date) {
  let age = date.getUTCFullYear() - birth.getUTCFullYear();
  const m = date.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && date.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
}

export function dateAtAge(birth: Date, years: number) {
  return new Date(
    Date.UTC(birth.getUTCFullYear() + years, birth.getUTCMonth(), birth.getUTCDate()),
  );
}

export function fmtMonthYearUtc(date: Date) {
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function fmtRangeUtc(start: Date, end: Date) {
  return `${fmtMonthYearUtc(start)} – ${fmtMonthYearUtc(end)}`;
}

export function marriagePlaceNorm(
  country: string | null | undefined,
  city: string | null | undefined,
  gender: string | null | undefined,
): MarriagePlaceNorm & { country: string; placeLabel: string } {
  const countryRaw = (country || "").trim();
  const cityRaw = (city || "").trim();
  const blob = `${countryRaw} ${cityRaw}`;
  const hay = normText(blob);
  const placeLabel = cityRaw
    ? countryRaw && !cityRaw.toLowerCase().includes(countryRaw.toLowerCase())
      ? `${cityRaw}, ${countryRaw}`
      : cityRaw
    : countryRaw || "your lived place";

  let region = "general";
  let typicalMin = 22;
  let typicalMax = 34;
  let lateMax = 42;
  let legalMin = 18;

  if (includesAny(hay, SOUTH_ASIA) || (!countryRaw && !cityRaw)) {
    region = "South Asia";
    typicalMin = 21;
    typicalMax = 32;
    lateMax = 40;
    legalMin = normText(gender) === "male" ? 21 : 18;
  } else if (includesAny(hay, GULF)) {
    region = "Gulf";
    typicalMin = 22;
    typicalMax = 33;
    lateMax = 42;
  } else if (includesAny(hay, EAST_ASIA)) {
    region = "East Asia";
    typicalMin = 26;
    typicalMax = 36;
    lateMax = 44;
  } else if (includesAny(hay, SE_ASIA)) {
    region = "Southeast Asia";
    typicalMin = 23;
    typicalMax = 34;
    lateMax = 42;
  } else if (includesAny(hay, WEST)) {
    region = "Western";
    typicalMin = 26;
    typicalMax = 36;
    lateMax = 45;
  }

  return {
    region,
    legalMin,
    typicalMin,
    typicalMax,
    lateMax,
    country: countryRaw || (region === "South Asia" ? "India" : "your country"),
    placeLabel,
  };
}

function overlap(
  start: Date,
  end: Date,
  bandStart: Date,
  bandEnd: Date,
): { start: Date; end: Date } | null {
  const a = start.getTime() > bandStart.getTime() ? start : bandStart;
  const b = end.getTime() < bandEnd.getTime() ? end : bandEnd;
  if (a >= b) return null;
  return { start: new Date(a), end: new Date(b) };
}

function statusLabel(status: string | null | undefined) {
  if (status === "MARRIED") return "married";
  if (status === "DIVORCED") return "divorced";
  if (status === "WIDOWED") return "widowed";
  if (status === "AWAITING_DIVORCE") return "awaiting divorce";
  return "never married";
}

function isRemarriage(status: string | null | undefined) {
  return status === "DIVORCED" || status === "WIDOWED";
}

function verdictTitle(id: MarriageLikelihood) {
  if (id === "already-settled") return "First marriage is not the question";
  if (id === "likely") return "Age and place support marriage in this season";
  if (id === "possible") return "Marriage is possible, not the most typical year";
  if (id === "not-yet") return "Marriage is not practical yet";
  if (id === "later") return "More typical later than this dasha alone suggests";
  return "Need birth details for a Kaala read";
}

/**
 * Clip partnership dashas to the ages where marriage is practical in this country.
 * Omits windows with no overlap. Does not name a wedding day.
 */
export function applyDeshKaalPatra(input: {
  windows: DatedPartnershipWindow[];
  birthDate?: Date | string | null;
  city?: string | null;
  country?: string | null;
  maritalStatus?: string | null;
  gender?: string | null;
  now?: Date;
}): MarriageDeshKaalRead {
  const now = input.now ?? new Date();
  const place = marriagePlaceNorm(input.country, input.city, input.gender);
  const birth = input.birthDate ? asDate(input.birthDate) : null;
  const validBirth = birth && !Number.isNaN(birth.getTime()) ? birth : null;
  const ageYears = validBirth ? ageAt(now, validBirth) : null;
  const status = input.maritalStatus || "NEVER_MARRIED";

  const placeNote = `Desha — this timing is read for life in ${place.placeLabel} (${place.region}). Local custom commonly places first marriage around ages ${place.typicalMin}–${place.typicalMax}; civil law still applies.`;
  const timeNote =
    ageYears != null
      ? `Kaala — you are about ${ageYears}. Windows are clipped to ages that are practical there, not to a wedding day.`
      : "Kaala — add birth details so age-aware filtering can decide which dashas are practical.";
  const vesselNote = `Patra — profile is ${statusLabel(status)}. ${
    status === "MARRIED"
      ? "First-marriage timing is not applied."
      : isRemarriage(status)
        ? "Read as remarriage, with a later age band."
        : status === "AWAITING_DIVORCE"
          ? "Formal marriage is not treated as practical until the current marriage is resolved."
          : "This is a first-marriage practicality read — directional, not a guarantee."
  }`;

  if (status === "MARRIED") {
    return {
      country: place.country,
      city: input.city || null,
      placeLabel: place.placeLabel,
      ageYears,
      maritalStatus: status,
      region: place.region,
      legalMin: place.legalMin,
      typicalMin: place.typicalMin,
      typicalMax: place.typicalMax,
      placeNote,
      timeNote,
      vesselNote,
      verdict: "already-settled",
      verdictTitle: verdictTitle("already-settled"),
      verdictReason:
        "Patra is already married, so these dashas are not used as a first-wedding forecast.",
      windows: [],
    };
  }

  if (status === "AWAITING_DIVORCE") {
    return {
      country: place.country,
      city: input.city || null,
      placeLabel: place.placeLabel,
      ageYears,
      maritalStatus: status,
      region: place.region,
      legalMin: place.legalMin,
      typicalMin: place.typicalMin,
      typicalMax: place.typicalMax,
      placeNote,
      timeNote,
      vesselNote,
      verdict: "not-yet",
      verdictTitle: verdictTitle("not-yet"),
      verdictReason: "Patra is still legally married. New marriage timing is withheld.",
      windows: [],
    };
  }

  if (!validBirth) {
    return {
      country: place.country,
      city: input.city || null,
      placeLabel: place.placeLabel,
      ageYears: null,
      maritalStatus: status,
      region: place.region,
      legalMin: place.legalMin,
      typicalMin: place.typicalMin,
      typicalMax: place.typicalMax,
      placeNote,
      timeNote,
      vesselNote,
      verdict: "possible",
      verdictTitle: "Dasha periods only — age not available",
      verdictReason:
        "Partnership dashas are dated from the natal Moon. Without birth date, Kaala cannot say whether marriage is practical in this country.",
      windows: input.windows.map((w) => ({
        ...w,
        dashaRange: w.range,
        ageYears: null,
        likelihood: "possible" as const,
        note: "Add birth details to clip this period to a practical marriage age.",
      })),
    };
  }

  const remarriage = isRemarriage(status);
  const bandMin = remarriage ? Math.max(place.legalMin, place.typicalMin + 2) : place.typicalMin;
  const bandMax = remarriage ? place.lateMax + 4 : place.typicalMax;
  const possibleMax = remarriage ? place.lateMax + 8 : place.lateMax;
  const likelyStart = dateAtAge(validBirth, Math.max(place.legalMin, bandMin));
  const likelyEnd = dateAtAge(validBirth, bandMax);
  const possibleStart = dateAtAge(validBirth, place.legalMin);
  const possibleEnd = dateAtAge(validBirth, possibleMax);

  const windows: MarriageTimingWindow[] = [];
  for (const raw of input.windows) {
    const start = asDate(raw.startDate);
    const end = asDate(raw.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;

    const likelyHit = overlap(start, end, likelyStart, likelyEnd);
    const possibleHit = overlap(start, end, possibleStart, possibleEnd);
    const hit = likelyHit || possibleHit;
    const midSource = hit ?? { start, end };
    const mid = new Date((midSource.start.getTime() + midSource.end.getTime()) / 2);
    const age = ageAt(mid, validBirth);
    if (!hit) {
      windows.push({
        label: raw.label,
        role: raw.role,
        startDate: raw.startDate,
        endDate: raw.endDate,
        range: raw.range,
        dashaRange: raw.range,
        ageYears: age,
        likelihood: "later",
        note: `This dasha does not overlap the usual ${place.typicalMin}–${place.typicalMax} marriage ages in ${place.placeLabel}. Age at the midpoint is about ${age}.`,
      });
      continue;
    }
    const clipped = hit.start.getTime() > start.getTime() || hit.end.getTime() < end.getTime();
    const likelihood: MarriageLikelihood = likelyHit
      ? "likely"
      : age < place.legalMin
        ? "not-yet"
        : age > bandMax
          ? "later"
          : "possible";
    if (likelihood === "not-yet") continue;

    windows.push({
      label: raw.label,
      role: raw.role,
      startDate: hit.start.toISOString(),
      endDate: hit.end.toISOString(),
      range: fmtRangeUtc(hit.start, hit.end),
      dashaRange: raw.range,
      ageYears: age,
      likelihood,
      note: clipped
        ? `${raw.label} runs ${raw.range}. Practical overlap for ${remarriage ? "remarriage" : "marriage"} in ${place.placeLabel} is ${fmtRangeUtc(hit.start, hit.end)} (about age ${age}).`
        : `This period sits at about age ${age} in ${place.placeLabel} — inside the ${likelihood === "likely" ? "typical" : "possible"} band, not a wedding date.`,
    });
  }

  windows.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const near = windows.filter((w) => {
    const start = asDate(w.startDate);
    const end = asDate(w.endDate);
    const horizon = new Date(now);
    horizon.setUTCFullYear(horizon.getUTCFullYear() + 3);
    return start <= horizon && end >= now;
  });
  const hasLikelyNear = near.some((w) => w.likelihood === "likely");
  const hasLikely = windows.some((w) => w.likelihood === "likely");
  const hasPossible = windows.some((w) => w.likelihood === "possible");

  let verdict: MarriageLikelihood = "possible";
  if (ageYears != null && ageYears < place.legalMin) verdict = "not-yet";
  else if (hasLikelyNear) verdict = "likely";
  else if (hasLikely) verdict = "possible";
  else if (hasPossible) verdict = "possible";
  else if (windows.length) verdict = "later";
  else if (ageYears != null && ageYears < place.typicalMin) verdict = "not-yet";
  else verdict = "later";

  const shown =
    hasLikely || hasPossible
      ? windows.filter((w) => w.likelihood === "likely" || w.likelihood === "possible")
      : windows;

  const reason =
    verdict === "not-yet"
      ? `At about ${ageYears}, marriage is not yet practical under ${place.region} custom and typical civil majority (${place.legalMin}+).`
      : verdict === "likely"
        ? `Current or near-term dasha overlap sits inside the usual ${place.typicalMin}–${place.typicalMax} band for ${place.placeLabel}. That is a practical season — not a wedding day.`
        : verdict === "later"
          ? `Stored partnership dashas do not overlap the usual first-marriage ages for ${place.placeLabel}.`
          : hasLikely
            ? `A later dasha overlaps typical marriage ages in ${place.placeLabel}. Treat it as a season, not a date.`
            : `Partnership dashas exist, but Desh–Kaal–Patra only weakly supports marriage in the near term.`;

  return {
    country: place.country,
    city: input.city || null,
    placeLabel: place.placeLabel,
    ageYears,
    maritalStatus: status,
    region: place.region,
    legalMin: place.legalMin,
    typicalMin: place.typicalMin,
    typicalMax: place.typicalMax,
    placeNote,
    timeNote,
    vesselNote,
    verdict,
    verdictTitle: verdictTitle(verdict),
    verdictReason: reason,
    windows: shown,
  };
}
