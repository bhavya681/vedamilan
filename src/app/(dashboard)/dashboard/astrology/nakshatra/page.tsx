"use client";

import Link from "next/link";
import { useHoroscope } from "@/hooks/use-horoscope";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

const NAKSHATRA_DETAILS: Record<
  string,
  {
    deity: string;
    symbol: string;
    gana: string;
    yoni: string;
    element: string;
    motivation: string;
    qualities: string[];
  }
> = {
  Ashwini: {
    deity: "Ashwini Kumaras",
    symbol: "Horse head",
    gana: "Deva",
    yoni: "Horse",
    element: "Earth",
    motivation: "Dharma",
    qualities: ["Swift", "Healing", "Pioneering"],
  },
  Bharani: {
    deity: "Yama",
    symbol: "Womb / Elephant",
    gana: "Manushya",
    yoni: "Elephant",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Nurturing", "Disciplined", "Transformative"],
  },
  Krittika: {
    deity: "Agni",
    symbol: "Flame / Axe",
    gana: "Rakshasa",
    yoni: "Goat",
    element: "Fire",
    motivation: "Kama",
    qualities: ["Fiery", "Critical", "Purifying"],
  },
  Rohini: {
    deity: "Brahma",
    symbol: "Chariot / Temple",
    gana: "Manushya",
    yoni: "Serpent",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Creative", "Grounded", "Fertile"],
  },
  Mrigashira: {
    deity: "Soma",
    symbol: "Deer head",
    gana: "Deva",
    yoni: "Serpent",
    element: "Air",
    motivation: "Kama",
    qualities: ["Curious", "Gentle", "Seeking"],
  },
  Ardra: {
    deity: "Rudra",
    symbol: "Teardrop / Diamond",
    gana: "Manushya",
    yoni: "Dog",
    element: "Air",
    motivation: "Kama",
    qualities: ["Intense", "Transformative", "Stormy"],
  },
  Punarvasu: {
    deity: "Aditi",
    symbol: "Bow / Quiver",
    gana: "Deva",
    yoni: "Cat",
    element: "Air",
    motivation: "Moksha",
    qualities: ["Renewing", "Nurturing", "Adaptable"],
  },
  Pushya: {
    deity: "Brihaspati",
    symbol: "Lotus / Arrow",
    gana: "Deva",
    yoni: "Goat",
    element: "Air",
    motivation: "Kama",
    qualities: ["Nourishing", "Protective", "Wise"],
  },
  Ashlesha: {
    deity: "Nagas",
    symbol: "Coiled serpent",
    gana: "Rakshasa",
    yoni: "Cat",
    element: "Air",
    motivation: "Kama",
    qualities: ["Mysterious", "Clinging", "Wise"],
  },
  Magha: {
    deity: "Pitris",
    symbol: "Royal throne",
    gana: "Rakshasa",
    yoni: "Rat",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Dignified", "Lineage", "Ambitious"],
  },
  "Purva Phalguni": {
    deity: "Aryaman",
    symbol: "Blanket / Hammock",
    gana: "Manushya",
    yoni: "Monkey",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Warm", "Social", "Creative"],
  },
  "Uttara Phalguni": {
    deity: "Bhaga",
    symbol: "Small bed / Couch",
    gana: "Manushya",
    yoni: "Cow",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Stable", "Loyal", "Supportive"],
  },
  Hasta: {
    deity: "Savitar",
    symbol: "Hand / Conch",
    gana: "Deva",
    yoni: "Buffalo",
    element: "Air",
    motivation: "Kama",
    qualities: ["Skillful", "Clever", "Serviceful"],
  },
  Chitra: {
    deity: "Tvastar",
    symbol: "Bright jewel / Pearl",
    gana: "Rakshasa",
    yoni: "Tiger",
    element: "Earth",
    motivation: "Kama",
    qualities: ["Artistic", "Charming", "Vain"],
  },
  Swati: {
    deity: "Vayu",
    symbol: "Coral / Sword",
    gana: "Deva",
    yoni: "Buffalo",
    element: "Air",
    motivation: "Dharma",
    qualities: ["Independent", "Flexible", "Diplomatic"],
  },
  Vishakha: {
    deity: "Indra-Agni",
    symbol: "Archway / Triumphal gate",
    gana: "Rakshasa",
    yoni: "Tiger",
    element: "Air",
    motivation: "Artha",
    qualities: ["Determined", "Goal-oriented", "Intense"],
  },
  Anuradha: {
    deity: "Mitra",
    symbol: "Lotus / Staff",
    gana: "Deva",
    yoni: "Deer",
    element: "Air",
    motivation: "Kama",
    qualities: ["Devoted", "Loyal", "Balanced"],
  },
  Jyeshtha: {
    deity: "Indra",
    symbol: "Earring / Umbrella",
    gana: "Rakshasa",
    yoni: "Deer",
    element: "Air",
    motivation: "Kama",
    qualities: ["Senior", "Protective", "Responsible"],
  },
  Mula: {
    deity: "Nirriti",
    symbol: "Bunch of roots / Elephant goad",
    gana: "Rakshasa",
    yoni: "Dog",
    element: "Earth",
    motivation: "Moksha",
    qualities: ["Rooted", "Investigative", "Destructive"],
  },
  "Purva Ashadha": {
    deity: "Aja Ekapada",
    symbol: "Back legs of cot / Fan",
    gana: "Manushya",
    yoni: "Monkey",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Initiating", "Bold", "Energetic"],
  },
  "Uttara Ashadha": {
    deity: "Ahir Budhnya",
    symbol: "Small bed / Snake",
    gana: "Manushya",
    yoni: "Mongoose",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Patient", "Loyal", "Organized"],
  },
  Shravana: {
    deity: "Vishnu",
    symbol: "Ear / Footprint",
    gana: "Deva",
    yoni: "Monkey",
    element: "Earth",
    motivation: "Moksha",
    qualities: ["Learning", "Listening", "Travel"],
  },
  Dhanishta: {
    deity: "Vasus",
    symbol: "Drum / Flute",
    gana: "Rakshasa",
    yoni: "Lion",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Musical", "Generous", "Rhythmic"],
  },
  Shatabhisha: {
    deity: "Varuna",
    symbol: "Circle / Thousand stars",
    gana: "Rakshasa",
    yoni: "Horse",
    element: "Air",
    motivation: "Moksha",
    qualities: ["Healing", "Mystical", "Independent"],
  },
  "Purva Bhadrapada": {
    deity: "Aja Ekapada",
    symbol: "Sword / Two legs of cot",
    gana: "Manushya",
    yoni: "Lion",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Fierce", "Passionate", "Courageous"],
  },
  "Uttara Bhadrapada": {
    deity: "Ahir Budhnya",
    symbol: "Serpent / Cot",
    gana: "Manushya",
    yoni: "Cow",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Compassionate", "Wise", "Serviceful"],
  },
  Revati: {
    deity: "Pushan",
    symbol: "Fish / Drum",
    gana: "Deva",
    yoni: "Elephant",
    element: "Earth",
    motivation: "Moksha",
    qualities: ["Nurturing", "Protective", "Abundant"],
  },
};

function getNakshatraDetails(name: string | undefined) {
  const clean = name?.trim() || "Ashwini";
  if (clean in NAKSHATRA_DETAILS) return NAKSHATRA_DETAILS[clean];
  const first = clean.split(" ")[0] || clean;
  if (first in NAKSHATRA_DETAILS) return NAKSHATRA_DETAILS[first];
  return NAKSHATRA_DETAILS["Ashwini"];
}

export default function AstrologyNakshatraPage() {
  const { data, error, loading } = useHoroscope();
  const planets = data?.horoscope?.planets || [];
  const moon = planets.find((p) => p.planet === "Moon");

  const details = moon ? getNakshatraDetails(moon.nakshatra) : null;

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Vedic birth star intelligence"
        title="Nakshatra"
        description="Your Janma Nakshatra, its symbolism, and how it shapes emotional tendencies, learning, relationships, and spiritual themes."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Back to kundli</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <PanelSkeleton lines={5} /> : null}
      {!loading && !moon ? (
        <EmptyState
          title="No nakshatra data"
          description="Generate kundli to see Moon and planet nakshatras."
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate</Link>
            </Button>
          }
        />
      ) : (
        <>
          {details ? (
            <GlassCard className="space-y-4">
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Janma Nakshatra
                </p>
                <h2 className="font-display mt-2 text-3xl">{moon?.nakshatra}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {moon?.sign} · Pada {moon?.nakshatraPada ?? "—"}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Lord", value: details.deity },
                  { label: "Symbol", value: details.symbol },
                  { label: "Gana", value: details.gana },
                  { label: "Yoni", value: details.yoni },
                  { label: "Element", value: details.element },
                  { label: "Motivation", value: details.motivation },
                ].map((item) => (
                  <div key={item.label} className="border-border/50 rounded-xl border p-3">
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Traditional qualities
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {details.qualities.map((q: string) => (
                    <Badge key={q} variant="secondary">
                      {q}
                    </Badge>
                  ))}
                </div>
              </div>
            </GlassCard>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {planets.map((p) => (
              <GlassCard key={p.planet} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{p.planet}</p>
                  <p className="text-muted-foreground text-xs">{p.nakshatra}</p>
                </div>
                <Badge variant="outline">P{p.nakshatraPada ?? "—"}</Badge>
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
