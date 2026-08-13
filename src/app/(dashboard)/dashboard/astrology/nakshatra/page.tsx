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
    effect: string;
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
    effect:
      "Grants speed, healing ability, and initiative. Favors new beginnings and compassionate action.",
  },
  Bharani: {
    deity: "Yama",
    symbol: "Womb / Elephant",
    gana: "Manushya",
    yoni: "Elephant",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Nurturing", "Disciplined", "Transformative"],
    effect:
      "Carries the weight of restraint and creative nurture. Can manifest as intense responsibility or artistic purification.",
  },
  Krittika: {
    deity: "Agni",
    symbol: "Flame / Axe",
    gana: "Rakshasa",
    yoni: "Goat",
    element: "Fire",
    motivation: "Kama",
    qualities: ["Fiery", "Critical", "Purifying"],
    effect:
      "Agni burns away impurity. Sharp intellect, but may incline toward criticism or inner friction.",
  },
  Rohini: {
    deity: "Brahma",
    symbol: "Chariot / Temple",
    gana: "Manushya",
    yoni: "Serpent",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Creative", "Grounded", "Fertile"],
    effect:
      "Most fertile nakshatra. Supports growth, beauty, material prosperity, and creative expression.",
  },
  Mrigashira: {
    deity: "Soma",
    symbol: "Deer head",
    gana: "Deva",
    yoni: "Serpent",
    element: "Air",
    motivation: "Kama",
    qualities: ["Curious", "Gentle", "Seeking"],
    effect:
      "Seeks, researches, and wanders. Favors discovery, communication, and subtle intuition.",
  },
  Ardra: {
    deity: "Rudra",
    symbol: "Teardrop / Diamond",
    gana: "Manushya",
    yoni: "Dog",
    element: "Air",
    motivation: "Kama",
    qualities: ["Intense", "Transformative", "Stormy"],
    effect: "Storms clear the sky. Can bring upheaval followed by profound clarity and reform.",
  },
  Punarvasu: {
    deity: "Aditi",
    symbol: "Bow / Quiver",
    gana: "Deva",
    yoni: "Cat",
    element: "Air",
    motivation: "Moksha",
    qualities: ["Renewing", "Nurturing", "Adaptable"],
    effect:
      "Returns and restores. Favors return of lost things, renewed energy, and adaptable wisdom.",
  },
  Pushya: {
    deity: "Brihaspati",
    symbol: "Lotus / Arrow",
    gana: "Deva",
    yoni: "Goat",
    element: "Air",
    motivation: "Kama",
    qualities: ["Nourishing", "Protective", "Wise"],
    effect:
      "Most auspicious for nourishment, learning, and spiritual nourishment. Strengthens dharma.",
  },
  Ashlesha: {
    deity: "Nagas",
    symbol: "Coiled serpent",
    gana: "Rakshasa",
    yoni: "Cat",
    element: "Air",
    motivation: "Kama",
    qualities: ["Mysterious", "Clinging", "Wise"],
    effect:
      "Kundalini-like intensity. Can bring wisdom through mystery, but also warns against poison or entanglement.",
  },
  Magha: {
    deity: "Pitris",
    symbol: "Royal throne",
    gana: "Rakshasa",
    yoni: "Rat",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Dignified", "Lineage", "Ambitious"],
    effect: "Honors ancestors and authority. Favors leadership, legacy, and dignified power.",
  },
  "Purva Phalguni": {
    deity: "Aryaman",
    symbol: "Blanket / Hammock",
    gana: "Manushya",
    yoni: "Monkey",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Warm", "Social", "Creative"],
    effect:
      "Supports marriage, creativity, and social bonds. Favors enjoyment and artistic expression.",
  },
  "Uttara Phalguni": {
    deity: "Bhaga",
    symbol: "Small bed / Couch",
    gana: "Manushya",
    yoni: "Cow",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Stable", "Loyal", "Supportive"],
    effect:
      "Firm in friendship and partnership. Favors steady growth, loyalty, and lasting unions.",
  },
  Hasta: {
    deity: "Savitar",
    symbol: "Hand / Conch",
    gana: "Deva",
    yoni: "Buffalo",
    element: "Air",
    motivation: "Kama",
    qualities: ["Skillful", "Clever", "Serviceful"],
    effect:
      "Skill of the hands and mind. Favors craftsmanship, healing touch, and practical magic.",
  },
  Chitra: {
    deity: "Tvastar",
    symbol: "Bright jewel / Pearl",
    gana: "Rakshasa",
    yoni: "Tiger",
    element: "Earth",
    motivation: "Kama",
    qualities: ["Artistic", "Charming", "Vain"],
    effect: "Architect of beauty. Favors art, design, and charisma, but warns against vanity.",
  },
  Swati: {
    deity: "Vayu",
    symbol: "Coral / Sword",
    gana: "Deva",
    yoni: "Buffalo",
    element: "Air",
    motivation: "Dharma",
    qualities: ["Independent", "Flexible", "Diplomatic"],
    effect: "Wind of change. Favors independence, adaptability, and diplomatic skill.",
  },
  Vishakha: {
    deity: "Indra-Agni",
    symbol: "Archway / Triumphal gate",
    gana: "Rakshasa",
    yoni: "Tiger",
    element: "Air",
    motivation: "Artha",
    qualities: ["Determined", "Goal-oriented", "Intense"],
    effect:
      "Triumphant but tested. Strong drive for achievement; may face obstacles before success.",
  },
  Anuradha: {
    deity: "Mitra",
    symbol: "Lotus / Staff",
    gana: "Deva",
    yoni: "Deer",
    element: "Air",
    motivation: "Kama",
    qualities: ["Devoted", "Loyal", "Balanced"],
    effect:
      "Friendship and devotion. Favors loyalty, balanced relationships, and following one's path.",
  },
  Jyeshtha: {
    deity: "Indra",
    symbol: "Earring / Umbrella",
    gana: "Rakshasa",
    yoni: "Deer",
    element: "Air",
    motivation: "Kama",
    qualities: ["Senior", "Protective", "Responsible"],
    effect: "Senior, protective, and responsible. May carry burdens of leadership or elder duty.",
  },
  Mula: {
    deity: "Nirriti",
    symbol: "Bunch of roots / Elephant goad",
    gana: "Rakshasa",
    yoni: "Dog",
    element: "Earth",
    motivation: "Moksha",
    qualities: ["Rooted", "Investigative", "Destructive"],
    effect:
      "Destroys to rebuild at the root. Favors deep research, occult knowledge, and radical transformation.",
  },
  "Purva Ashadha": {
    deity: "Aja Ekapada",
    symbol: "Back legs of cot / Fan",
    gana: "Manushya",
    yoni: "Monkey",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Initiating", "Bold", "Energetic"],
    effect:
      "Invincible beginning. Favors early vigor, purification through effort, and invincible resolve.",
  },
  "Uttara Ashadha": {
    deity: "Ahir Budhnya",
    symbol: "Small bed / Snake",
    gana: "Manushya",
    yoni: "Mongoose",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Patient", "Loyal", "Organized"],
    effect: "Slow but permanent victory. Favors patience, integrity, and lasting achievement.",
  },
  Shravana: {
    deity: "Vishnu",
    symbol: "Ear / Footprint",
    gana: "Deva",
    yoni: "Monkey",
    element: "Earth",
    motivation: "Moksha",
    qualities: ["Learning", "Listening", "Travel"],
    effect: "Sacred hearing and learning. Favors teaching, travel for wisdom, and dharma.",
  },
  Dhanishta: {
    deity: "Vasus",
    symbol: "Drum / Flute",
    gana: "Rakshasa",
    yoni: "Lion",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Musical", "Generous", "Rhythmic"],
    effect: "Rhythm of prosperity. Favors music, wealth, and rhythmical skill.",
  },
  Shatabhisha: {
    deity: "Varuna",
    symbol: "Circle / Thousand stars",
    gana: "Rakshasa",
    yoni: "Horse",
    element: "Air",
    motivation: "Moksha",
    qualities: ["Healing", "Mystical", "Independent"],
    effect:
      "Cosmic healing and secrecy. Favors medicine, mysticism, and independent healing paths.",
  },
  "Purva Bhadrapada": {
    deity: "Aja Ekapada",
    symbol: "Sword / Two legs of cot",
    gana: "Manushya",
    yoni: "Lion",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Fierce", "Passionate", "Courageous"],
    effect:
      "Fiery sacrifice. Favors intense spirituality, transformation through fire, and courage.",
  },
  "Uttara Bhadrapada": {
    deity: "Ahir Budhnya",
    symbol: "Serpent / Cot",
    gana: "Manushya",
    yoni: "Cow",
    element: "Earth",
    motivation: "Artha",
    qualities: ["Compassionate", "Wise", "Serviceful"],
    effect: "Deep compassion and wisdom. Favors moksha, service, and secret spiritual knowledge.",
  },
  Revati: {
    deity: "Pushan",
    symbol: "Fish / Drum",
    gana: "Deva",
    yoni: "Elephant",
    element: "Earth",
    motivation: "Moksha",
    qualities: ["Nurturing", "Protective", "Abundant"],
    effect:
      "Guides the journey home. Favors safe travels, nourishment, and abundance at life's transitions.",
  },
};

function getNakshatraDetails(name: string | undefined) {
  const clean = name?.trim() || "Ashwini";
  if (clean in NAKSHATRA_DETAILS)
    return NAKSHATRA_DETAILS[clean as keyof typeof NAKSHATRA_DETAILS]!;
  const first = clean.split(" ")[0] || clean;
  if (first in NAKSHATRA_DETAILS)
    return NAKSHATRA_DETAILS[first as keyof typeof NAKSHATRA_DETAILS]!;
  return NAKSHATRA_DETAILS["Ashwini"];
}

export default function AstrologyNakshatraPage() {
  const { data, error, loading } = useHoroscope();
  const planets = data?.horoscope?.planets || [];

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Vedic birth star intelligence"
        title="Nakshatra"
        description="Every planet sits in a nakshatra. See each placement, its pada, and its traditional effect."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Back to kundli</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <PanelSkeleton lines={6} /> : null}

      {!loading && planets.length === 0 ? (
        <EmptyState
          title="No nakshatra data"
          description="Generate kundli to see planet-wise nakshatras and padas."
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate</Link>
            </Button>
          }
        />
      ) : null}

      {!loading && planets.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {planets.map((p) => {
            const details = getNakshatraDetails(p.nakshatra)!;
            return (
              <GlassCard key={p.planet} className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-base sm:text-lg">{p.planet}</p>
                    <p className="text-muted-foreground text-xs break-words">
                      {p.sign} · {p.nakshatra}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    Pada {p.nakshatraPada ?? "—"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                      Lord
                    </p>
                    <p className="mt-0.5 font-medium break-words">{details.deity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                      Gana
                    </p>
                    <p className="mt-0.5 font-medium">{details.gana}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                      Yoni
                    </p>
                    <p className="mt-0.5 font-medium break-words">{details.yoni}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                      Element
                    </p>
                    <p className="mt-0.5 font-medium">{details.element}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    Traditional effect
                  </p>
                  <p className="mt-1 text-xs leading-relaxed break-words">{details.effect}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {details.qualities.map((q) => (
                    <Badge key={q} variant="secondary" className="text-[10px]">
                      {q}
                    </Badge>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
