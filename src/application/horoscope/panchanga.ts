import { NAKSHATRAS, VIMSHOTTARI_LORDS } from "./vedic-constants";
import { swissEphemerisService } from "@/lib/services/swiss-ephemeris";

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

const TITHI_NAMES = [
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

const YOGA_NAMES = [
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

const KARANA_NAMES = ["Bhadra", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"];

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
  const offsets: Record<number, number> = { 0: 1, 1: 7, 2: 5, 3: 6, 4: 3, 5: 4, 6: 2 };
  const startOffset = eighth * (offsets[vara] || 1);
  return { start: sunrise + startOffset, end: sunrise + startOffset + eighth };
}

function yamagandaFor(
  vara: number,
  sunrise: number,
  sunset: number,
): { start: number; end: number } {
  const daylight = sunset - sunrise;
  const eighth = daylight / 8;
  const offsets: Record<number, number> = { 0: 5, 1: 3, 2: 7, 3: 6, 4: 4, 5: 2, 6: 1 };
  const startOffset = eighth * (offsets[vara] || 1);
  return { start: sunrise + startOffset, end: sunrise + startOffset + eighth };
}

function gulikaFor(vara: number, sunrise: number, sunset: number): { start: number; end: number } {
  const daylight = sunset - sunrise;
  const eighth = daylight / 8;
  const offsets: Record<number, number> = { 0: 6, 1: 2, 2: 4, 3: 3, 4: 1, 5: 5, 6: 7 };
  const startOffset = eighth * (offsets[vara] || 1);
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

export function computePanchanga(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: string,
): Panchanga {
  swissEphemerisService.initialize(process.env.SWISS_EPHEMERIS_PATH);
  const jd = swissEphemerisService.julDay(date);
  const houses = swissEphemerisService.calculateHouses(jd, latitude, longitude, "P");
  const positions = swissEphemerisService.calculatePlanets(jd);

  const sunLong = positions.sun.longitude;
  const moonLong = positions.moon.longitude;

  const tithiSpan = 360 / 30;
  const tithiProgress = ((((moonLong - sunLong) % 360) + 360) % 360) / tithiSpan;
  const tithiNumber = Math.min(30, Math.max(1, Math.floor(tithiProgress) + 1));
  const tithiName = TITHI_NAMES[Math.min(29, Math.max(0, tithiNumber - 1))];
  const paksha: "Shukla" | "Krishna" = tithiNumber <= 15 ? "Shukla" : "Krishna";
  const pakshaTithi = tithiNumber === 30 ? 15 : tithiNumber > 15 ? tithiNumber - 15 : tithiNumber;

  const vara = new Date(date).getDay();
  const varaName = VARA_NAMES[vara];

  const moonNak = Math.floor((((moonLong % 360) + 360) % 360) / (360 / 27));
  const nakshatraName = NAKSHATRAS[Math.min(26, Math.max(0, moonNak))];

  const yogaSpan = 360 / 27;
  const yogaIndex = Math.floor(((((sunLong + moonLong) % 360) + 360) % 360) / yogaSpan);
  const yogaName = YOGA_NAMES[Math.min(26, Math.max(0, yogaIndex))];

  const karanaIndex = Math.floor((tithiProgress % 1) * 2);
  const isFixed = [1, 8, 15, 22].includes(tithiNumber);
  const karanaName = KARANA_NAMES[Math.min(5, Math.max(0, isFixed ? 0 : karanaIndex + 1))] || "";
  const karanaType: "moving" | "fixed" = isFixed ? "fixed" : "moving";

  const sunriseTs = houses.ascmc[0] ? jdToTimestamp(jd, houses.ascmc[0], timezone) : Date.now();
  const sunsetTs = houses.ascmc[1]
    ? jdToTimestamp(jd, houses.ascmc[1], timezone)
    : Date.now() + 43200000;

  const rahu = rahuKalamFor(vara, sunriseTs, sunsetTs);
  const yamag = yamagandaFor(vara, sunriseTs, sunsetTs);
  const gulik = gulikaFor(vara, sunriseTs, sunsetTs);
  const abhijit = abhijitMuhurta(sunriseTs, sunsetTs);

  return {
    tithi: {
      number: tithiNumber,
      name: tithiName || "",
      progress: parseFloat((tithiProgress % 1).toFixed(3)),
      paksha,
      pakshaTithi,
      meaning: tithiMeaning(tithiNumber, paksha, pakshaTithi),
    },
    vara: {
      number: vara + 1,
      name: varaName || "",
      english: varaName || "",
      sanskrit: VARA_SANSKRIT[vara] || "",
    },
    nakshatra: {
      index: moonNak,
      name: nakshatraName || "",
      lord: VIMSHOTTARI_LORDS[moonNak % 9] || "Moon",
    },
    yoga: {
      index: yogaIndex,
      name: yogaName || "",
      nature: yogaNature(yogaName || ""),
    },
    karana: {
      index: karanaIndex,
      name: karanaName,
      type: karanaType,
      note: karanaNote(karanaName, karanaType),
    },
    sunrise: { time: formatTime(sunriseTs, timezone), timestamp: sunriseTs },
    sunset: { time: formatTime(sunsetTs, timezone), timestamp: sunsetTs },
    moonrise: null,
    moonset: null,
    dayLengthMinutes: Math.max(0, Math.round((sunsetTs - sunriseTs) / 60000)),
    rahuKalam: clockWindow(rahu.start, rahu.end, timezone),
    yamaganda: clockWindow(yamag.start, yamag.end, timezone),
    gulika: clockWindow(gulik.start, gulik.end, timezone),
    abhijit: abhijit ? clockWindow(abhijit.start, abhijit.end, timezone) : null,
  };
}

function jdToTimestamp(jd: number, angle: number, _timezone: string): number {
  const dayFraction = angle / 360;
  const baseDate = new Date(Date.UTC(1970, 0, 1));
  const jd1970 = 2440587.5;
  const diffDays = jd - jd1970 + dayFraction;
  const ts = baseDate.getTime() + diffDays * 86400000;
  return ts;
}

export function computeMuhurta(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: string,
  activity: string,
): MuhurtaWindow[] {
  const panchanga = computePanchanga(date, latitude, longitude, timezone);
  const windows: MuhurtaWindow[] = [];

  const sunrise = panchanga.sunrise.timestamp;
  const sunset = panchanga.sunset.timestamp;
  const abhijit = panchanga.abhijit;
  const rahu = panchanga.rahuKalam;
  const yama = panchanga.yamaganda;
  const gulik = panchanga.gulika;

  const dateStr = date.toISOString().split("T")[0] || "";

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
    windows.push(
      generate(
        sunrise + 1800000,
        sunrise + 5400000,
        "good",
        78,
        [
          "Post-sunrise morning window",
          `Nakshatra: ${panchanga.nakshatra.name}`,
          `Yoga: ${panchanga.yoga.name}`,
          "Rahu Kalam avoided",
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
