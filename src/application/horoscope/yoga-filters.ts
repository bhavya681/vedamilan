/** Shared filters for auspicious / Raja-style yogas from the stored chart engine. */

export type ChartYoga = {
  code?: string;
  name: string;
  category?: string;
  strength?: number;
  description?: string;
};

const RAJA_PATTERN =
  /raja|gajakesari|dharma.?karma|budhaditya|ruchaka|hamsa|malavya|shasha|bhadra|neecha.?bhanga|vipareeta|harsha|sarala|vimala|pancha.?maha|chandra.?mangal|dhana|pushkala|amala|lakshmi|saraswati/i;

export function isRajaStyleYoga(yoga: ChartYoga) {
  return RAJA_PATTERN.test(`${yoga.code || ""} ${yoga.name}`);
}

export function partitionYogas(yogas: ChartYoga[]) {
  const rajaYogas = yogas.filter(isRajaStyleYoga);
  const otherYogas = yogas.filter((y) => !isRajaStyleYoga(y));
  return { rajaYogas, otherYogas };
}

const CATEGORY_BY_CODE: Record<string, string> = {
  RAJA_YOGA: "Raja Yoga",
  DHARMA_KARMADHIPATI: "Raja Yoga",
  GAJAKESARI: "Raja Yoga",
  NEECHA_BHANGA: "Raja Yoga",
  BUDHADITYA: "Raja Yoga",
  CHANDRA_MANGAL: "Raja Yoga",
  VIPAREETA_RAJA: "Raja Yoga",
  HARSHA: "Raja Yoga",
  SARALA: "Raja Yoga",
  VIMALA: "Raja Yoga",
  RUCHAKA: "Pancha Mahapurusha",
  BHADRA: "Pancha Mahapurusha",
  HAMSA: "Pancha Mahapurusha",
  MALAVYA: "Pancha Mahapurusha",
  SHASHA: "Pancha Mahapurusha",
  RUCHAKA_HINT: "Pancha Mahapurusha",
  DHANA_YOGA: "Dhana Yoga",
  ADHI: "Lunar Yoga",
  SUNAPHA: "Lunar Yoga",
  ANAPHA: "Lunar Yoga",
  DURUDHARA: "Lunar Yoga",
  KEMADRUMA: "Lunar Yoga",
  VASI: "Solar Yoga",
  VESI: "Solar Yoga",
  UBHAYACHARI: "Solar Yoga",
  NABHASA_ASHRAYA: "Nabhasa Yoga",
  NABHASA_DALA: "Nabhasa Yoga",
  NABHASA_AKRITI: "Nabhasa Yoga",
  NABHASA_SANKHYA: "Nabhasa Yoga",
  SARASWATI: "Planetary Yoga",
  LAKSHMI: "Planetary Yoga",
  PARIVARTANA: "Planetary Yoga",
  AMALA: "Planetary Yoga",
  PUSHKALA: "Planetary Yoga",
  SHUBHA_KARTARI: "Planetary Yoga",
  PAPA_KARTARI: "Planetary Yoga",
};

const CATEGORY_BY_NAME: Array<[RegExp, string]> = [
  [/gaja.?kesari/, "Raja Yoga"],
  [/dharma.?karma/, "Raja Yoga"],
  [/budhaditya/, "Raja Yoga"],
  [/chandra.?mangal/, "Raja Yoga"],
  [/neecha.?bhanga/, "Raja Yoga"],
  [/vipareeta|harsha|sarala|vimala/, "Raja Yoga"],
  [/ruchaka|bhadra|hamsa|malavya|shasha|pancha.?maha/, "Pancha Mahapurusha"],
  [/dhana/, "Dhana Yoga"],
  [/adhi|sunapha|anapha|durudhara|kemadruma/, "Lunar Yoga"],
  [/vasi|vesi|ubhayachari/, "Solar Yoga"],
  [
    /nabhasa|ashraya|rajju|musala|nala|maala|sarpa|akriti|gada|shakata|sankhya|veena|damini|pasha|kedara|shula|yuga|gola/,
    "Nabhasa Yoga",
  ],
  [/saraswati|lakshmi|parivartana|amala|pushkala|kartari/, "Planetary Yoga"],
];

export function getYogaCategory(yoga: ChartYoga): string {
  const code = (yoga.code || "").toUpperCase();
  const name = (yoga.name || "").toLowerCase();

  const byCode = CATEGORY_BY_CODE[code];
  if (byCode) return byCode;

  for (const [pattern, category] of CATEGORY_BY_NAME) {
    if (pattern.test(name)) return category;
  }

  if (/raja/.test(`${code} ${name}`.toLowerCase())) return "Raja Yoga";

  return "Other";
}
