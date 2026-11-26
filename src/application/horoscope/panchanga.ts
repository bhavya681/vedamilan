import { NAKSHATRAS, VIMSHOTTARI_LORDS } from "./vedic-constants";
import { swissEphemerisService, type AyanamshaMode } from "@/lib/services/swiss-ephemeris";
import { AppError } from "@/lib/utils/error-handler";

export type Panchanga = {
  tithi: {
    number: number;
    name: string;
    progress: number;
    paksha: "Shukla" | "Krishna";
    pakshaTithi: number;
    meaning: string;
  };
  vara: { number: number; name: string; english: string; sanskrit: string };
  nakshatra: { index: number; name: string; lord: string };
  yoga: { index: number; name: string; nature: "auspicious" | "inauspicious" | "mixed" };
  karana: { index: number; name: string; type: "moving" | "fixed"; note: string };
  sunrise: { time: string; timestamp: number };
  sunset: { time: string; timestamp: number };
  moonrise: { time: string; timestamp: number } | null;
  moonset: { time: string; timestamp: number } | null;
  dayLengthMinutes: number;
  rahuKalam: { start: string; end: string; startTs: number; endTs: number };
  yamaganda: { start: string; end: string; startTs: number; endTs: number };
  gulika: { start: string; end: string; startTs: number; endTs: number };
  abhijit: { start: string; end: string; startTs: number; endTs: number } | null;
  localDate: string;
  timezone: string;
  basis: "sunrise";
};

export type MuhurtaWindow = {
  date: string;
  activity: string;
  rating: "excellent" | "good" | "moderate" | "avoid";
  startTime: string;
  endTime: string;
  startTs: number;
  endTs: number;
  score: number;
  reasons: string[];
  cautions: string[];
};

export const TITHI_NAMES = [
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Amavasya",
];

export const YOGA_NAMES = [
  "Vishkumbha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Sobhana",
  "Atiganda",
  "Sukarman",
  "Dhriti",
  "Shula",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyan",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhrti",
];

export const MOVING_KARANAS = [
  "Bava",
  "Balava",
  "Kaulava",
  "Taitila",
  "Gara",
  "Vanija",
  "Vishti",
] as const;

export const FIXED_KARANAS = ["Kimstughna", "Shakuni", "Chatushpada", "Naga"] as const;

const VARA_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const VARA_SANSKRIT = [
  "Ravivara",
  "Somavara",
  "Mangalavara",
  "Budhavara",
  "Guruvara",
  "Shukravara",
  "Shanivara",
];

const INAUSPICIOUS_YOGAS = new Set([
  "Vishkumbha",
  "Atiganda",
  "Shula",
  "Ganda",
  "Vyaghata",
  "Vajra",
  "Vyatipata",
  "Parigha",
  "Vaidhrti",
]);

const TITHI_MEANING: Record<number, string> = {
  1: "Beginnings and first steps",
  2: "Stabilising a new effort",
  3: "Growth after a start — mixed for some rites",
  4: "Obstacle-clearing; avoid hasty launches",
  5: "Learning, remedies, and steady work",
  6: "Courage and decisive action",
  7: "Friendship, travel, and negotiation",
  8: "Ancestral and protective rites; caution for new starts",
  9: "Completion of a cycle of effort",
  10: "Dharma, duty, and public work",
  11: "Fasting, devotion, and restraint",
  12: "Preparation before culmination",
  13: "Fulfilment of ongoing work",
  14: "Winding down — traditionally avoided for major starts",
  15: "Purnima — fullness, teaching, and completion",
  30: "Amavasya — ancestors, endings, and quiet work",
};

function rahuKalamFor(
  vara: number,
  sunrise: number,
  sunset: number,
): { start: number; end: number } {
  const daylight = sunset - sunrise;
  const eighth = daylight / 8;
  const parts: Record<number, number> = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 };
  const startOffset = eighth * ((parts[vara] || 8) - 1);
  return { start: sunrise + startOffset, end: sunrise + startOffset + eighth };
}

function yamagandaFor(
  vara: number,
  sunrise: number,
  sunset: number,
): { start: number; end: number } {
  const daylight = sunset - sunrise;
  const eighth = daylight / 8;
  const parts: Record<number, number> = { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6 };
  const startOffset = eighth * ((parts[vara] || 5) - 1);
  return { start: sunrise + startOffset, end: sunrise + startOffset + eighth };
}

function gulikaFor(vara: number, sunrise: number, sunset: number): { start: number; end: number } {
  const daylight = sunset - sunrise;
  const eighth = daylight / 8;
  const parts: Record<number, number> = { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 };
  const startOffset = eighth * ((parts[vara] || 7) - 1);
  return { start: sunrise + startOffset, end: sunrise + startOffset + eighth };
}

function abhijitMuhurta(sunrise: number, sunset: number): { start: number; end: number } | null {
  const midday = (sunrise + sunset) / 2;
  const half = 12 * 60 * 1000;
  return { start: midday - half, end: midday + half };
}

function clockWindow(start: number, end: number, timezone: string) {
  return {
    start: formatTime(start, timezone),
    end: formatTime(end, timezone),
    startTs: start,
    endTs: end,
  };
}

function subtractBlocks(
  start: number,
  end: number,
  blocks: Array<{ start: number; end: number }>,
): Array<{ start: number; end: number }> {
  let segments = [{ start, end }];
  for (const block of blocks) {
    segments = segments.flatMap((segment) => {
      if (block.end <= segment.start || block.start >= segment.end) return [segment];
      const parts: Array<{ start: number; end: number }> = [];
      if (block.start > segment.start) {
        parts.push({ start: segment.start, end: Math.min(segment.end, block.start) });
      }
      if (block.end < segment.end) {
        parts.push({ start: Math.max(segment.start, block.end), end: segment.end });
      }
      return parts;
    });
  }
  return segments.filter((segment) => segment.end - segment.start >= 5 * 60 * 1000);
}

function yogaNature(name: string): "auspicious" | "inauspicious" | "mixed" {
  if (INAUSPICIOUS_YOGAS.has(name)) return "inauspicious";
  const auspicious = new Set([
    "Priti",
    "Ayushman",
    "Saubhagya",
    "Sobhana",
    "Sukarman",
    "Dhriti",
    "Vriddhi",
    "Dhruva",
    "Harshana",
    "Siddhi",
    "Variyan",
    "Shiva",
    "Siddha",
    "Sadhya",
    "Shubha",
    "Shukla",
    "Brahma",
    "Indra",
  ]);
  if (auspicious.has(name)) return "auspicious";
  return "mixed";
}

function karanaNote(name: string, type: "moving" | "fixed"): string {
  if (name === "Vishti" || name === "Bhadra") {
    return "Vishti (Bhadra) — traditionally avoided for auspicious starts";
  }
  if (type === "fixed") return "Fixed karana — used for ancestral, spiritual, or specialised work";
  return "Moving karana — generally suitable for worldly activity";
}

function tithiMeaning(
  tithiNumber: number,
  paksha: "Shukla" | "Krishna",
  pakshaTithi: number,
): string {
  if (tithiNumber === 15) return TITHI_MEANING[15] || "Fullness and completion";
  if (tithiNumber === 30) return TITHI_MEANING[30] || "Ancestral and ending work";
  const base = TITHI_MEANING[pakshaTithi] || "Lunar day in the current paksha";
  return `${base} · ${paksha} paksha`;
}

export function norm360(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function tithiForDifference(difference: number) {
  const progress = norm360(difference) / 12;
  const number = Math.min(30, Math.floor(progress) + 1);
  const paksha: "Shukla" | "Krishna" = number <= 15 ? "Shukla" : "Krishna";
  const pakshaTithi = number === 30 ? 15 : number > 15 ? number - 15 : number;
  return {
    number,
    name: TITHI_NAMES[number - 1] || "Pratipada",
    progress: Number((progress - Math.floor(progress)).toFixed(3)),
    paksha,
    pakshaTithi,
    meaning: tithiMeaning(number, paksha, pakshaTithi),
  };
}

export function nakshatraForLongitude(longitude: number) {
  const span = 360 / 27;
  const normalized = norm360(longitude);
  const index = Math.min(26, Math.floor(normalized / span));
  const pada = Math.min(4, Math.floor((normalized % span) / (span / 4)) + 1) as 1 | 2 | 3 | 4;
  return {
    index,
    name: NAKSHATRAS[index] || "Ashwini",
    pada,
    lord: VIMSHOTTARI_LORDS[index % 9] || "Ketu",
  };
}

export function nityaYogaFor(longitudes: { sun: number; moon: number }) {
  const span = 360 / 27;
  const index = Math.min(26, Math.floor(norm360(longitudes.sun + longitudes.moon) / span));
  const name = YOGA_NAMES[index] || "Vishkumbha";
  return { index, name, nature: yogaNature(name) };
}

export function karanaForDifference(difference: number) {
  const halfIndex = Math.floor(norm360(difference) / 6);
  if (halfIndex === 0) {
    const name = FIXED_KARANAS[0] ?? "Kimstughna";
    return {
      index: halfIndex,
      name,
      type: "fixed" as const,
      note: karanaNote(name, "fixed"),
    };
  }
  if (halfIndex >= 57) {
    const name = FIXED_KARANAS[halfIndex - 56] ?? "Naga";
    return { index: halfIndex, name, type: "fixed" as const, note: karanaNote(name, "fixed") };
  }
  const name = MOVING_KARANAS[(halfIndex - 1) % MOVING_KARANAS.length] ?? "Bava";
  return { index: halfIndex, name, type: "moving" as const, note: karanaNote(name, "moving") };
}

function formatTime(timestamp: number, timezone: string): string {
  const d = new Date(timestamp);
  try {
    return d.toLocaleTimeString("en-IN", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return d.toISOString();
  }
}

function zonedParts(date: Date, timezone: string) {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);
  } catch {
    throw new AppError("INVALID_TIMEZONE", `Unknown IANA timezone: ${timezone}`, 422);
  }
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

function timezoneOffsetMs(date: Date, timezone: string): number {
  const parts = zonedParts(date, timezone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - date.getTime();
}

export function localMidnightUtc(date: Date, timezone: string): Date {
  const parts = zonedParts(date, timezone);
  const base = Date.UTC(parts.year, parts.month - 1, parts.day, 0, 0, 0);
  let utc = base - timezoneOffsetMs(new Date(base), timezone);
  utc = base - timezoneOffsetMs(new Date(utc), timezone);
  return new Date(utc);
}

export function jdToUnixMs(jd: number): number {
  return (jd - 2440587.5) * 86400000;
}

export function localDateToUtc(dateString: string, timezone: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) {
    throw new AppError("INVALID_DATE", "Date must be YYYY-MM-DD", 422);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const base = Date.UTC(year, month - 1, day, 0, 0, 0);
  if (Number.isNaN(base)) {
    throw new AppError("INVALID_DATE", "Invalid calendar date", 422);
  }
  let utc = base - timezoneOffsetMs(new Date(base), timezone);
  utc = base - timezoneOffsetMs(new Date(utc), timezone);
  return new Date(utc);
}

export function computePanchanga(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: string,
  ayanamsha: AyanamshaMode = "LAHIRI",
): Panchanga {
  swissEphemerisService.initialize(process.env.SWISS_EPHEMERIS_PATH);
  const localMidnight = localMidnightUtc(date, timezone);
  const dayParts = zonedParts(localMidnight, timezone);
  const localDate = `${dayParts.year}-${String(dayParts.month).padStart(2, "0")}-${String(
    dayParts.day,
  ).padStart(2, "0")}`;
  const dayJd = swissEphemerisService.julDay(localMidnight);
  const sunEvents = swissEphemerisService.calculateRiseSet(dayJd, latitude, longitude, "sun");
  const moonEvents = swissEphemerisService.calculateRiseSet(dayJd, latitude, longitude, "moon");

  if (sunEvents.rise === null || sunEvents.set === null) {
    throw new AppError(
      "SUNRISE_SUNSET_UNAVAILABLE",
      `Sunrise or sunset is not defined for ${localDate} at this location; Panchanga times cannot be calculated without invented data.`,
      422,
    );
  }

  const sunriseTs = jdToUnixMs(sunEvents.rise);
  const sunsetTs = jdToUnixMs(sunEvents.set);
  const positions = swissEphemerisService.calculatePlanets(sunEvents.rise, ayanamsha);
  const difference = positions.moon.longitude - positions.sun.longitude;
  const tithi = tithiForDifference(difference);
  const nakshatra = nakshatraForLongitude(positions.moon.longitude);
  const yoga = nityaYogaFor({ sun: positions.sun.longitude, moon: positions.moon.longitude });
  const karana = karanaForDifference(difference);
  const vara = new Date(Date.UTC(dayParts.year, dayParts.month - 1, dayParts.day)).getUTCDay();
  const varaName = VARA_NAMES[vara];

  const rahu = rahuKalamFor(vara, sunriseTs, sunsetTs);
  const yamag = yamagandaFor(vara, sunriseTs, sunsetTs);
  const gulik = gulikaFor(vara, sunriseTs, sunsetTs);
  const abhijit = abhijitMuhurta(sunriseTs, sunsetTs);

  return {
    tithi,
    vara: {
      number: vara + 1,
      name: varaName || "",
      english: varaName || "",
      sanskrit: VARA_SANSKRIT[vara] || "",
    },
    nakshatra,
    yoga,
    karana,
    sunrise: { time: formatTime(sunriseTs, timezone), timestamp: sunriseTs },
    sunset: { time: formatTime(sunsetTs, timezone), timestamp: sunsetTs },
    moonrise:
      moonEvents.rise !== null
        ? {
            time: formatTime(jdToUnixMs(moonEvents.rise), timezone),
            timestamp: jdToUnixMs(moonEvents.rise),
          }
        : null,
    moonset:
      moonEvents.set !== null
        ? {
            time: formatTime(jdToUnixMs(moonEvents.set), timezone),
            timestamp: jdToUnixMs(moonEvents.set),
          }
        : null,
    dayLengthMinutes: Math.max(0, Math.round((sunsetTs - sunriseTs) / 60000)),
    rahuKalam: clockWindow(rahu.start, rahu.end, timezone),
    yamaganda: clockWindow(yamag.start, yamag.end, timezone),
    gulika: clockWindow(gulik.start, gulik.end, timezone),
    abhijit: abhijit ? clockWindow(abhijit.start, abhijit.end, timezone) : null,
    localDate,
    timezone,
    basis: "sunrise",
  };
}

export function computeMuhurta(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: string,
  activity: string,
  ayanamsha: AyanamshaMode = "LAHIRI",
): MuhurtaWindow[] {
  const panchanga = computePanchanga(date, latitude, longitude, timezone, ayanamsha);
  const windows: MuhurtaWindow[] = [];

  const sunrise = panchanga.sunrise.timestamp;
  const sunset = panchanga.sunset.timestamp;
  const abhijit = panchanga.abhijit;
  const rahu = panchanga.rahuKalam;
  const yama = panchanga.yamaganda;
  const gulik = panchanga.gulika;

  const dateStr = panchanga.localDate;

  const activityKeywords: Record<string, string[]> = {
    marriage: ["marriage", "wedding", "engagement", "vivaha"],
    business: ["business", "launch", "startup", "enterprise"],
    job: ["job", "career", "joining", "employment", "office"],
    travel: ["travel", "journey", "trip", "vacation"],
    property: ["property", "house", "home", "real estate", "purchase"],
    education: ["education", "exam", "study", "learning", "school"],
    naming: ["naming", "child", "baby", "ceremony"],
    meeting: ["meeting", "negotiation", "discussion", "interview"],
    houseEntry: ["house entry", "gruhapravesh", "home entry"],
    religious: ["religious", "puja", "worship", "temple", "spiritual"],
  };

  const activityLower = activity.toLowerCase();
  let matchedActivity = "general";
  for (const [key, keywords] of Object.entries(activityKeywords)) {
    if (keywords.some((k) => activityLower.includes(k))) {
      matchedActivity = key;
      break;
    }
  }

  const isTritiya = panchanga.tithi.number === 3;
  const isChaturdashi = panchanga.tithi.number === 14;
  const isAmavasya = panchanga.tithi.number === 30;
  const favorableNakshatras = [
    "Ashwini",
    "Rohini",
    "Pushya",
    "Hasta",
    "Swati",
    "Anuradha",
    "Shravana",
    "Dhanishta",
    "Shatabhisha",
    "Revati",
  ];
  const favorableNakshatra = favorableNakshatras.includes(panchanga.nakshatra.name);
  const favorableYogas = ["Shubha", "Shukla", "Brahma", "Dhruva", "Siddhi", "Sadhya"];
  const favorableYoga = favorableYogas.includes(panchanga.yoga.name);

  const generate = (
    startTs: number,
    endTs: number,
    rating: MuhurtaWindow["rating"],
    score: number,
    reasons: string[],
    cautions: string[],
  ): MuhurtaWindow => ({
    date: dateStr,
    activity: matchedActivity,
    rating,
    startTime: formatTime(startTs, timezone),
    endTime: formatTime(endTs, timezone),
    startTs,
    endTs,
    score,
    reasons,
    cautions,
  });

  if (abhijit && matchedActivity !== "travel") {
    windows.push(
      generate(
        abhijit.startTs,
        abhijit.endTs,
        "excellent",
        92,
        [
          "Abhijit Muhurta — 24 minutes centered on local midday",
          favorableNakshatra
            ? `Favorable Nakshatra: ${panchanga.nakshatra.name}`
            : `Nakshatra: ${panchanga.nakshatra.name}`,
          favorableYoga ? `Favorable Yoga: ${panchanga.yoga.name}` : `Yoga: ${panchanga.yoga.name}`,
          `${panchanga.tithi.paksha} ${panchanga.tithi.name}`,
        ],
        isAmavasya ? ["Amavasya — avoid major ceremonies"] : [],
      ),
    );
  }

  if (!isAmavasya && !isChaturdashi && favorableNakshatra) {
    const morningStart = sunrise + 1800000;
    const morningEnd = sunrise + 5400000;
    const avoidsRahu = morningEnd <= rahu.startTs || morningStart >= rahu.endTs;
    windows.push(
      generate(
        morningStart,
        morningEnd,
        "good",
        78,
        [
          "Post-sunrise morning window",
          `Nakshatra: ${panchanga.nakshatra.name}`,
          `Yoga: ${panchanga.yoga.name}`,
          avoidsRahu ? "Rahu Kalam avoided" : "Rahu Kalam overlaps part of this window",
        ],
        isTritiya ? ["Tritiya — moderate for new beginnings"] : [],
      ),
    );
  }

  if (
    matchedActivity === "marriage" ||
    matchedActivity === "business" ||
    matchedActivity === "houseEntry"
  ) {
    const reasons = [
      "Mid-morning window for contracts and beginnings",
      `Vara: ${panchanga.vara.sanskrit}`,
      favorableNakshatra ? "Favorable Nakshatra" : "",
    ].filter(Boolean);
    windows.push(generate(sunrise + 5400000, sunrise + 9000000, "good", 72, reasons, []));
  }

  const afternoonStart = sunrise + 9000000;
  const afternoonEnd = sunset - 5400000;
  if (afternoonEnd > afternoonStart && !isAmavasya && !isChaturdashi) {
    windows.push(
      generate(
        afternoonStart,
        afternoonEnd,
        "moderate",
        55,
        [
          "Afternoon window — usable for routine work",
          `${panchanga.tithi.paksha} ${panchanga.tithi.name}`,
          `Yoga: ${panchanga.yoga.name} (${panchanga.yoga.nature})`,
        ],
        ["Prefer morning or Abhijit for major starts"],
      ),
    );
  }

  const avoidBlocks = [rahu, yama, gulik].map((window) => ({
    start: window.startTs,
    end: window.endTs,
  }));
  const trimmed: MuhurtaWindow[] = [];
  for (const window of windows) {
    if (window.rating === "avoid") {
      trimmed.push(window);
      continue;
    }
    subtractBlocks(window.startTs, window.endTs, avoidBlocks).forEach((segment, index) => {
      trimmed.push({
        ...window,
        startTime: formatTime(segment.start, timezone),
        endTime: formatTime(segment.end, timezone),
        startTs: segment.start,
        endTs: segment.end,
        score: index === 0 ? window.score : Math.max(0, window.score - 10),
        cautions:
          index === 0
            ? window.cautions
            : [...window.cautions, "Trimmed to avoid Rahu Kalam, Yamaganda, or Gulika"],
      });
    });
  }
  windows.splice(0, windows.length, ...trimmed);

  windows.push(
    generate(
      rahu.startTs,
      rahu.endTs,
      "avoid",
      15,
      [],
      ["Rahu Kalam — avoid important activities"],
    ),
  );
  windows.push(
    generate(yama.startTs, yama.endTs, "avoid", 12, [], ["Yamaganda — avoid important activities"]),
  );
  windows.push(
    generate(gulik.startTs, gulik.endTs, "avoid", 10, [], ["Gulika — avoid important activities"]),
  );

  return windows.sort((a, b) => b.score - a.score);
}
