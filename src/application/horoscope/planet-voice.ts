/**
 * First-person “planet speaks” guidance for D1 chart hover/tap.
 * Condition is inferred from dignity + house (dusthana) + retrograde — not full shadbala.
 */

export type PlanetVoiceCondition = "thriving" | "steady" | "strained" | "heavy";

export type PlanetVoiceMessage = {
  planet: string;
  karaka: string;
  condition: PlanetVoiceCondition;
  conditionLabel: string;
  headline: string;
  speak: string;
  tips: string[];
};

type PlanetProfile = {
  karaka: string;
  thriving: { speak: string; tips: string[] };
  steady: { speak: string; tips: string[] };
  strained: { speak: string; tips: string[] };
  heavy: { speak: string; tips: string[] };
};

const DUSTHANA = new Set([6, 8, 12]);

const PROFILES: Record<string, PlanetProfile> = {
  Sun: {
    karaka: "soul, father, vitality, authority",
    thriving: {
      speak: "I shine clearly here — your confidence and purpose can lead without forcing.",
      tips: [
        "Lead with honesty and quiet self-respect",
        "Honor father-figures or mentors this week",
        "Morning sunlight or Surya namaskar steadies me",
      ],
    },
    steady: {
      speak: "I hold your will and identity — keep routines that protect your energy.",
      tips: [
        "Own one clear goal instead of many half-starts",
        "Speak less, mean more",
        "Protect midday rest if work drains you",
      ],
    },
    strained: {
      speak: "I’m dimmed in this chart — ego bruises easily; humility heals me faster than pride.",
      tips: [
        "Avoid power struggles; choose graceful exits",
        "Serve before seeking recognition",
        "Warm food, early sleep, and gratitude practice help",
      ],
    },
    heavy: {
      speak: "I’m under pressure — authority feels blocked. Soften the need to control outcomes.",
      tips: [
        "Practice humility with elders and bosses",
        "Offer water to a plant or tree at sunrise",
        "Do not argue when tired — wait for clarity",
      ],
    },
  },
  Moon: {
    karaka: "mind, mother, emotions, peace",
    thriving: {
      speak: "I’m calm and nourishing here — your feelings can guide others without drowning you.",
      tips: [
        "Keep evenings soft and screen-light",
        "Stay close to mother or motherly care",
        "Moonlit walks or journaling settle me",
      ],
    },
    steady: {
      speak: "I carry your inner weather — feed me with rest, kind company, and clean food.",
      tips: [
        "Drink warm milk or herbal tea at night",
        "Check in with your mother or a caring elder",
        "Avoid emotional decisions when hungry",
      ],
    },
    strained: {
      speak: "Hey — I’m feeling afflicted here. Your mind is tender; treat me gently.",
      tips: [
        "Meditate or breathe slowly for ten quiet minutes",
        "Respect and care for your mother (or motherly figures)",
        "Prefer white foods, calm music, and early sleep",
      ],
    },
    heavy: {
      speak: "I’m heavy and restless — worry grows if you push through alone.",
      tips: [
        "Skip late-night scrolling; soothe me with silence",
        "Offer kindness before criticism at home",
        "Moon-day fasting or light dinner can reset me",
      ],
    },
  },
  Mars: {
    karaka: "courage, siblings, drive, boundaries",
    thriving: {
      speak: "I’m sharp and protective — channel my fire into skill, sport, or clear action.",
      tips: [
        "Move your body daily — I love honest effort",
        "Defend boundaries without cruelty",
        "Finish one hard task before noon",
      ],
    },
    steady: {
      speak: "I give you courage — use me to build, not to burn bridges.",
      tips: [
        "Pause three breaths before reacting",
        "Support a sibling or close ally",
        "Keep tools, desk, and promises sharp",
      ],
    },
    strained: {
      speak: "I’m heated and bruised — irritation rises fast; cool me before you speak.",
      tips: [
        "Avoid rash arguments and reckless driving",
        "Donate red lentils or help someone in need",
        "Channel anger into exercise, not words",
      ],
    },
    heavy: {
      speak: "I’m under stress — conflict finds you if you chase it. Choose restraint.",
      tips: [
        "Do not escalate minor fights",
        "Respect Hanuman-like courage: service over ego",
        "Cooling foods and shorter workouts help today",
      ],
    },
  },
  Mercury: {
    karaka: "speech, intellect, trade, curiosity",
    thriving: {
      speak: "I’m quick and clear — your words can teach, negotiate, and delight.",
      tips: [
        "Write, teach, or clarify one idea today",
        "Keep promises about messages and money",
        "Green plants near your desk refresh me",
      ],
    },
    steady: {
      speak: "I govern your thinking — feed me facts, not gossip.",
      tips: [
        "Double-check details before sending",
        "Learn something small each day",
        "Speak sweetly even when correcting",
      ],
    },
    strained: {
      speak: "I’m scattered — mixed signals and overthinking tangle me.",
      tips: [
        "One topic at a time; silence between decisions",
        "Avoid sarcasm and half-truths",
        "Read something wise; skip doom-scroll loops",
      ],
    },
    heavy: {
      speak: "I’m strained in speech and focus — rest your mind before big talks.",
      tips: [
        "Prefer written clarity over rushed calls",
        "Offer food to students or helpers if you can",
        "Short walks clear my static",
      ],
    },
  },
  Jupiter: {
    karaka: "wisdom, teachers, dharma, growth",
    thriving: {
      speak: "I expand grace here — learning and generosity open doors.",
      tips: [
        "Seek a teacher or become one gently",
        "Give without announcing it",
        "Yellow foods, books, and morning study please me",
      ],
    },
    steady: {
      speak: "I hold your faith and judgment — keep ethics ahead of shortcuts.",
      tips: [
        "Study a little scripture or philosophy",
        "Advise only when asked sincerely",
        "Respect teachers, in-laws, and mentors",
      ],
    },
    strained: {
      speak: "I’m muted — guidance feels foggy; don’t force big leaps of faith.",
      tips: [
        "Avoid overpromising or overspending",
        "Sit with elders; listen more than you teach",
        "Thursday prayer or quiet study steadies me",
      ],
    },
    heavy: {
      speak: "I’m weighed down — pride in knowledge can block wisdom.",
      tips: [
        "Practice humility; admit what you don’t know",
        "Support a student’s education if able",
        "Simplify plans; quality over expansion",
      ],
    },
  },
  Venus: {
    karaka: "love, beauty, harmony, pleasures",
    thriving: {
      speak: "I bloom here — affection, art, and grace want to flow through you.",
      tips: [
        "Create or appreciate beauty today",
        "Speak kindly to your partner or close friends",
        "Keep spaces fragrant and uncluttered",
      ],
    },
    steady: {
      speak: "I soften life — balance pleasure with sincerity.",
      tips: [
        "Choose quality over excess",
        "Dress with care; it lifts mood",
        "Music or art for twenty minutes heals me",
      ],
    },
    strained: {
      speak: "I’m tender and low — relationships need gentleness, not drama.",
      tips: [
        "Avoid ego games in love",
        "Offer sweets or flowers with a clean heart",
        "Rest your senses; less scrolling, more presence",
      ],
    },
    heavy: {
      speak: "I’m strained — craving can outrun contentment. Slow the chase.",
      tips: [
        "Do not force romance or luxury purchases",
        "Practice gratitude for what you already have",
        "Friday acts of kindness restore me",
      ],
    },
  },
  Saturn: {
    karaka: "karma, discipline, delays, structure",
    thriving: {
      speak: "I reward patience here — steady work builds lasting respect.",
      tips: [
        "Keep one long habit without skipping",
        "Respect time, elders, and workers",
        "Oil massage or slow walking grounds me",
      ],
    },
    steady: {
      speak: "I teach through effort — shortcuts cost more later.",
      tips: [
        "Finish unfinished duties",
        "Speak less; deliver more",
        "Serve someone who has fewer resources",
      ],
    },
    strained: {
      speak: "I’m heavy on you — delays and pressure are my classroom, not your punishment.",
      tips: [
        "Accept slow progress without bitterness",
        "Help the elderly or those who labor hard",
        "Black sesame / Saturday discipline practices help",
      ],
    },
    heavy: {
      speak: "I’m pressing hard — fear and fatigue rise if you resist every lesson.",
      tips: [
        "Simplify commitments; do the next right thing",
        "Avoid blame; choose responsibility",
        "Sleep on time — I soften when you rest well",
      ],
    },
  },
  Rahu: {
    karaka: "desire, ambition, unconventional paths",
    thriving: {
      speak: "I open unusual doors — innovate, but stay ethical.",
      tips: [
        "Pursue one bold idea with clear boundaries",
        "Avoid hype and shortcuts that stain trust",
        "Ground tech or ambition with daily prayer",
      ],
    },
    steady: {
      speak: "I intensify hunger for more — aim it at growth, not distraction.",
      tips: [
        "Name your craving; don’t let it name you",
        "Limit late-night screens",
        "Mentor someone younger on your craft",
      ],
    },
    strained: {
      speak: "I’m restless and foggy — obsession can steal your peace.",
      tips: [
        "Cut one addiction-like habit this week",
        "Prefer truth over image",
        "Serve quietly; Rahu calms when ego shrinks",
      ],
    },
    heavy: {
      speak: "I’m stormy — illusions tempt you. Slow down before big risks.",
      tips: [
        "Do not chase status for its own sake",
        "Double-check contracts and online deals",
        "Meditation dissolves my smoke",
      ],
    },
  },
  Ketu: {
    karaka: "detachment, past karma, insight",
    thriving: {
      speak: "I grant clear seeing — release what no longer serves.",
      tips: [
        "Declutter one corner of life",
        "Quiet spiritual practice over loud display",
        "Help without needing credit",
      ],
    },
    steady: {
      speak: "I pull you inward — solitude can be medicine, not escape.",
      tips: [
        "Journal what you’re ready to release",
        "Avoid cynicism dressed as wisdom",
        "Short meditation keeps me kind",
      ],
    },
    strained: {
      speak: "I’m unsettled — detachment can tip into numbness or sudden exits.",
      tips: [
        "Stay present with family duties",
        "Don’t ghost people who need clarity",
        "Light a lamp and sit in silence briefly",
      ],
    },
    heavy: {
      speak: "I’m sharp and withdrawing — isolation isn’t the same as peace.",
      tips: [
        "Reconnect gently with one trusted person",
        "Complete unfinished spiritual or study vows",
        "Serve animals or the overlooked",
      ],
    },
  },
};

const CONDITION_LABEL: Record<PlanetVoiceCondition, string> = {
  thriving: "Supported",
  steady: "Steady",
  strained: "Needs care",
  heavy: "Under pressure",
};

export function resolvePlanetVoiceCondition(input: {
  dignity?: string | null;
  mark?: string | null;
  house?: number | null;
  isRetrograde?: boolean;
}): PlanetVoiceCondition {
  const dignity = (input.dignity || "").toLowerCase();
  const mark = input.mark || "";
  const house = input.house ?? null;
  const dusthana = house != null && DUSTHANA.has(house);
  const debilitated = mark === "↓" || dignity.includes("debilit");
  const exalted = mark === "↑" || dignity.includes("exalt");
  const own = mark === "◉" || dignity === "own";

  if (debilitated) return dusthana || input.isRetrograde ? "heavy" : "strained";
  if (dusthana && !exalted && !own) return input.isRetrograde ? "heavy" : "strained";
  if (exalted || own) return "thriving";
  if (input.isRetrograde) return "steady";
  return "steady";
}

export function planetVoiceForGlyph(glyph: {
  planet: string;
  dignity?: string | null;
  mark?: string | null;
  house?: number | null;
  isRetrograde?: boolean;
}): PlanetVoiceMessage {
  const planet = glyph.planet;
  const profile = PROFILES[planet] || {
    karaka: "this graha’s themes in your life",
    thriving: {
      speak: "I am well placed — use my gifts with awareness.",
      tips: ["Act with sincerity", "Stay consistent", "Share credit"],
    },
    steady: {
      speak: "I ask for steady attention — neither ignore nor obsess over me.",
      tips: ["Observe before reacting", "Keep routines simple", "Choose kindness"],
    },
    strained: {
      speak: "I’m under strain — soften habits that irritate my themes.",
      tips: ["Slow down", "Seek wise counsel", "Prefer remedy through character"],
    },
    heavy: {
      speak: "I’m heavy in this chart — patience and humility unlock me.",
      tips: ["Do the next right duty", "Avoid extremes", "Rest and reflect"],
    },
  };

  const condition = resolvePlanetVoiceCondition(glyph);
  const pack = profile[condition];
  const retroNote = glyph.isRetrograde ? " (retrograde — I ask for review, not rush)" : "";

  return {
    planet,
    karaka: profile.karaka,
    condition,
    conditionLabel: CONDITION_LABEL[condition],
    headline: `${planet} says`,
    speak: `${pack.speak}${retroNote}`,
    tips: pack.tips,
  };
}

/** One story-like paragraph for hover tooltip (planet speaking in first person). */
export function formatPlanetStory(message: PlanetVoiceMessage): string {
  const asks = message.tips.slice(0, 3).join("; ");
  return `${message.speak} So I ask of you: ${asks}.`;
}

export function planetVoiceToneClasses(condition: PlanetVoiceCondition) {
  switch (condition) {
    case "thriving":
      return {
        chip: "border-emerald/40 bg-emerald/12 text-foreground",
        bar: "bg-emerald/80",
      };
    case "steady":
      return {
        chip: "border-primary/35 bg-primary/10 text-foreground",
        bar: "bg-primary/70",
      };
    case "strained":
      return {
        chip: "border-saffron/40 bg-saffron/12 text-foreground",
        bar: "bg-saffron/80",
      };
    default:
      return {
        chip: "border-rose/35 bg-rose/10 text-foreground",
        bar: "bg-rose/70",
      };
  }
}
