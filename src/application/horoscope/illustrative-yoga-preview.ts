import { horoscopeService } from "./horoscope.service";
import { ENGINE_VERSION } from "./vedic-constants";

export type IllustrativeYogaPreviewItem = {
  code: string;
  name: string;
  category: string;
  strength: number;
  description: string;
  relationship: string;
};

export type IllustrativeYogaPreview = {
  reference: string;
  ayanamsha: string;
  engineVersion: string;
  yogas: IllustrativeYogaPreviewItem[];
};

const FEATURED_CODES = ["GAJAKESARI", "BUDHADITYA", "RAJA_YOGA", "PUSHKALA"];

let cachedPreview: IllustrativeYogaPreview | null = null;

function relationshipText(details: unknown): string {
  if (!details || typeof details !== "object")
    return "Planetary relationship from the reference chart";
  const value = details as { condition?: unknown; planets?: unknown; houses?: unknown };
  if (typeof value.condition === "string" && value.condition.length > 0) return value.condition;
  const planets = Array.isArray(value.planets) ? value.planets.filter(Boolean).join(" · ") : "";
  const houses = Array.isArray(value.houses) ? value.houses.filter(Boolean).join(" · ") : "";
  if (planets && houses) return `${planets} · houses ${houses}`;
  return planets || houses || "Planetary relationship from the reference chart";
}

export function getIllustrativeYogaPreview(): IllustrativeYogaPreview {
  if (cachedPreview) return cachedPreview;

  const natal = horoscopeService.computeNatal({
    birthDate: new Date("2000-01-01T00:00:00.000Z"),
    birthTime: "12:00:00",
    timezone: "Asia/Kolkata",
    latitude: 28.6139,
    longitude: 77.209,
    ayanamsha: "LAHIRI",
  });

  const yogas = FEATURED_CODES.flatMap((code) => {
    const yoga = natal.yogas.find((item) => item.code === code);
    if (!yoga) return [];
    return [
      {
        code: yoga.code,
        name: yoga.name,
        category: yoga.category,
        strength: yoga.strength,
        description: yoga.description,
        relationship: relationshipText(yoga.details),
      },
    ];
  });

  cachedPreview = {
    reference: "1 Jan 2000 · 12:00 IST · New Delhi",
    ayanamsha: natal.ayanamsha,
    engineVersion: ENGINE_VERSION,
    yogas,
  };

  return cachedPreview;
}
