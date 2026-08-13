import { NAKSHATRAS, VIMSHOTTARI_LORDS } from "./vedic-constants";
import { swissEphemerisService } from "@/lib/services/swiss-ephemeris";

export type Panchanga = {
  tithi: { number: number; name: string; progress: number };
  vara: { number: number; name: string; english: string };
  nakshatra: { index: number; name: string; lord: string };
  yoga: { index: number; name: string };
  karana: { index: number; name: string; type: "moving" | "fixed" };
  sunrise: { time: string; timestamp: number };
  sunset: { time: string; timestamp: number };
  moonrise: { time: string; timestamp: number } | null;
  moonset: { time: string; timestamp: number } | null;
  rahuKalam: { start: string; end: string };
  yamaganda: { start: string; end: string };
  gulika: { start: string; end: string };
  abhijit: { start: string; end: string } | null;
};

export type MuhurtaWindow = {
  date: string;
  activity: string;
  rating: "excellent" | "good" | "moderate" | "avoid";
  startTime: string;
  endTime: string;
  score: number;
  reasons: string[];
  cautions: string[];
};

const TITHI_NAMES = [
  "Pratipada",
  "Dwitiy",
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
  "Dwitiy",
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
  const quarter = (sunset - sunrise) / 8;
  return { start: midday - quarter, end: midday + quarter };
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
  const tithiNumber = Math.floor(tithiProgress) + 1;
  const tithiName = TITHI_NAMES[Math.min(29, Math.max(0, tithiNumber - 1))];

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
    },
    vara: { number: vara + 1, name: varaName || "", english: varaName || "" },
    nakshatra: {
      index: moonNak,
      name: nakshatraName || "",
      lord: VIMSHOTTARI_LORDS[moonNak % 9] || "Moon",
    },
    yoga: { index: yogaIndex, name: yogaName || "" },
    karana: { index: karanaIndex, name: karanaName, type: karanaType },
    sunrise: { time: formatTime(sunriseTs, timezone), timestamp: sunriseTs },
    sunset: { time: formatTime(sunsetTs, timezone), timestamp: sunsetTs },
    moonrise: null,
    moonset: null,
    rahuKalam: { start: formatTime(rahu.start, timezone), end: formatTime(rahu.end, timezone) },
    yamaganda: { start: formatTime(yamag.start, timezone), end: formatTime(yamag.end, timezone) },
    gulika: { start: formatTime(gulik.start, timezone), end: formatTime(gulik.end, timezone) },
    abhijit: abhijit
      ? { start: formatTime(abhijit.start, timezone), end: formatTime(abhijit.end, timezone) }
      : null,
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

  const _isWeekend = [0, 6].includes(panchanga.vara.number - 1);
  const isTritiya = panchanga.tithi.number === 3;
  const isChaturdashi = panchanga.tithi.number === 14;
  const isAmavasya = panchanga.tithi.number === 30;
  const _isPurnima = panchanga.tithi.number === 15;
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

  const abhijitWindow = abhijit ? { start: abhijit.start, end: abhijit.end } : null;

  const morningWindow = {
    start: formatTime(sunrise + 1800000, timezone),
    end: formatTime(sunrise + 5400000, timezone),
  };
  const midMorning = {
    start: formatTime(sunrise + 5400000, timezone),
    end: formatTime(sunrise + 9000000, timezone),
  };
  const _afternoon = {
    start: formatTime(sunrise + 9000000, timezone),
    end: formatTime(sunset - 5400000, timezone),
  };

  const generate = (
    start: string,
    end: string,
    rating: MuhurtaWindow["rating"],
    score: number,
    reasons: string[],
    cautions: string[],
  ): MuhurtaWindow => ({
    date: dateStr,
    activity: matchedActivity,
    rating,
    startTime: start,
    endTime: end,
    score,
    reasons,
    cautions,
  });

  if (abhijitWindow && matchedActivity !== "travel") {
    windows.push(
      generate(
        abhijitWindow.start,
        abhijitWindow.end,
        "excellent",
        92,
        [
          "Abhijit Muhurta — 24 minutes centered on midday",
          favorableNakshatra
            ? `Favorable Nakshatra: ${panchanga.nakshatra.name}`
            : `Nakshatra: ${panchanga.nakshatra.name}`,
          favorableYoga ? `Favorable Yoga: ${panchanga.yoga.name}` : `Yoga: ${panchanga.yoga.name}`,
          `Tithi: ${panchanga.tithi.name}`,
        ],
        isAmavasya ? ["Amavasya — avoid major ceremonies"] : [],
      ),
    );
  }

  if (!isAmavasya && !isChaturdashi && favorableNakshatra) {
    windows.push(
      generate(
        morningWindow.start,
        morningWindow.end,
        "good",
        78,
        [
          "Post-sunrise Brahma Muhurta window",
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
      "Mid-morning auspicious window",
      `Vara: ${panchanga.vara.name}`,
      favorableNakshatra ? "Favorable Nakshatra" : "",
    ].filter(Boolean);
    windows.push(generate(midMorning.start, midMorning.end, "good", 72, reasons, []));
  }

  windows.push(
    generate(rahu.start, rahu.end, "avoid", 15, [], ["Rahu Kalam — avoid important activities"]),
  );
  windows.push(
    generate(yama.start, yama.end, "avoid", 12, [], ["Yamaganda — avoid important activities"]),
  );
  windows.push(
    generate(gulik.start, gulik.end, "avoid", 10, [], ["Gulika — avoid important activities"]),
  );

  return windows.sort((a, b) => b.score - a.score);
}
