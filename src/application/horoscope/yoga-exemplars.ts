/**
 * Motivating public-life parallels for yogas & doshas.
 * These are teaching illustrations of the *theme* — not claims that VedaMilan
 * calculated any celebrity’s kundli or that the user will copy their life.
 */

export type YogaExemplar = {
  /** Short badge on collapsed card */
  badge: string;
  /** Who / what path this yoga is classically linked with */
  parallelTitle: string;
  /** Famous-path illustration (archetypal / public discourse — not a verified chart claim) */
  parallelStory: string;
  /** What that path is known for achieving */
  knownOutcome: string;
  /** How the user can apply the same theme */
  yourEdge: string;
  disclaimer: string;
};

const DISCLAIMER =
  "Illustrative parallel only — not a verified celebrity kundli, and not a guarantee of the same results.";

const BY_CODE: Record<string, YogaExemplar> = {
  RAJA_YOGA: {
    badge: "Leadership path",
    parallelTitle: "Public leaders & high office",
    parallelStory:
      "Raja Yoga is the combination teachers use when explaining why some people rise into visible authority — cabinet-level duty, board leadership, or national recognition. Popular culture often points to celebrated statesmen and institution-builders when describing this theme.",
    knownOutcome: "Recognition, responsibility, and trust from large groups of people",
    yourEdge:
      "Your chart shows a similar recognition theme. During yoga-planet dashas, step toward roles that need competence, calm authority, and service — not shortcuts.",
    disclaimer: DISCLAIMER,
  },
  GAJAKESARI: {
    badge: "Wisdom & prestige",
    parallelTitle: "Counselors, scholars & dignified public voices",
    parallelStory:
      "Gajakesari (Jupiter in kendra from Moon) is classically linked with wise speech and steady prestige. Teachers often illustrate it with mentors, jurists, and public intellectuals whose reputation grows through counsel rather than noise.",
    knownOutcome: "Respect, sound judgment, and prosperity tied to wisdom",
    yourEdge:
      "Lean into learning, mentoring, and clear speech when Jupiter or Moon periods run — your chart supports a dignified growth path.",
    disclaimer: DISCLAIMER,
  },
  BUDHADITYA: {
    badge: "Intellect & media",
    parallelTitle: "Analysts, writers & tech communicators",
    parallelStory:
      "Budhaditya (Sun–Mercury) is popularly linked with sharp minds who explain, invent, or persuade — founders, editors, strategists, and product thinkers known for clarity under pressure.",
    knownOutcome: "Visibility through ideas, writing, and decision quality",
    yourEdge:
      "Ship work that shows thinking: documents, talks, products. Sun/Mercury windows favour intellect-led progress.",
    disclaimer: DISCLAIMER,
  },
  DHARMA_KARMA: {
    badge: "Purpose + vocation",
    parallelTitle: "Purpose-driven professionals",
    parallelStory:
      "Dharma–Karma Adhipati Yoga (9th–10th lords) is taught as the bond of calling and career — people whose work feels like mission, from educators to reformers and mission-led founders.",
    knownOutcome: "Meaningful vocation and fortune through aligned duty",
    yourEdge:
      "Choose projects that match your values. When these lords’ periods run, purpose and profession can reinforce each other.",
    disclaimer: DISCLAIMER,
  },
  GURU_BHAVA: {
    badge: "Growth & guidance",
    parallelTitle: "Teachers, coaches & expanders",
    parallelStory:
      "Supportive Jupiter placements are linked with people who grow through teaching, ethics, and expansion — mentors whose optimism opens doors for others as well as themselves.",
    knownOutcome: "Expansion, guidance, and ethical opportunity",
    yourEdge:
      "Seek mentors and become one. Jupiter windows favour study, travel for growth, and fair deals.",
    disclaimer: DISCLAIMER,
  },
  VENUS_HARMONY: {
    badge: "Harmony & craft",
    parallelTitle: "Artists, diplomats & relationship builders",
    parallelStory:
      "Venus support is illustrated with people known for aesthetic taste, partnership skill, and cultural refinement — creators and connectors who succeed through harmony.",
    knownOutcome: "Creative success, partnership ease, and refined comfort",
    yourEdge:
      "Invest in relationships and craft. Venus periods favour collaboration, design, and sincere alliance.",
    disclaimer: DISCLAIMER,
  },
  MOON_OWN: {
    badge: "Emotional mastery",
    parallelTitle: "Steady minds & caregivers",
    parallelStory:
      "Moon in its own sign is linked with emotional self-possession — public figures and caregivers known for calm presence and intuitive care of people or communities.",
    knownOutcome: "Mental steadiness, empathy, and trusted presence",
    yourEdge:
      "Protect sleep, family bonds, and intuitive routines. Your chart supports emotional leadership when the Moon is strong by timing.",
    disclaimer: DISCLAIMER,
  },
  RUCHAKA_HINT: {
    badge: "Courage & drive",
    parallelTitle: "Competitors, builders & first-movers",
    parallelStory:
      "Strong Mars themes (Ruchaka-like) are taught with athletes, commanders, and builders who win through courage and decisive action — energy that must be steered, not suppressed.",
    knownOutcome: "Breakthroughs through bravery and disciplined force",
    yourEdge:
      "Channel drive into training, competition, and clear goals. Temper impulsiveness — Mars rewards courage with control.",
    disclaimer: DISCLAIMER,
  },
  LAGNA_SET: {
    badge: "Identity foundation",
    parallelTitle: "Self-made presence",
    parallelStory:
      "A clear Lagna is the chart’s stage. Public personalities with a strong sense of self are often used to teach how identity and vitality frame every other yoga.",
    knownOutcome: "Coherent self-presentation and life direction",
    yourEdge:
      "Invest in health, image, and honest self-definition — every other yoga expresses through your Lagna.",
    disclaimer: DISCLAIMER,
  },
  MANGLIK: {
    badge: "Directed fire",
    parallelTitle: "High-energy achievers",
    parallelStory:
      "Manglik themes are often misunderstood as only delay. In teaching, Mars intensity also appears in highly driven people — entrepreneurs and performers who succeed when energy is trained, not feared.",
    knownOutcome: "Assertiveness, stamina, and breakthrough capacity when guided",
    yourEdge:
      "Use Mars for discipline, fitness, and clear boundaries in partnerships. Intensity becomes an asset with maturity and timing.",
    disclaimer: DISCLAIMER,
  },
  KALA_SARPA: {
    badge: "Transformative arc",
    parallelTitle: "Comeback & reinvention stories",
    parallelStory:
      "Kaal Sarp discussions often cite lives of intense chapters and reinvention — public figures who remade themselves after pressure. The theme is transformation, not doom.",
    knownOutcome: "Depth, resilience, and powerful mid-life turns",
    yourEdge:
      "Treat pressure seasons as forging, not fate. Grounding routines and Rahu/Ketu awareness help you use the intensity.",
    disclaimer: DISCLAIMER,
  },
  PITRA: {
    badge: "Lineage strength",
    parallelTitle: "Family torchbearers",
    parallelStory:
      "Pitra themes are taught with people who carry family duty forward — public servants and community elders whose success includes honouring lineage.",
    knownOutcome: "Support through roots, remembrance, and responsible continuity",
    yourEdge:
      "Honour family duty and ethical roots. Lineage work can become quiet strength, not burden.",
    disclaimer: DISCLAIMER,
  },
};

const BY_CATEGORY: Record<string, YogaExemplar> = {
  CAREER: {
    badge: "Career rise",
    parallelTitle: "Professionals who become known for their craft",
    parallelStory:
      "Career yogas are illustrated with people whose vocation became their public identity — specialists who climbed through skill and timing.",
    knownOutcome: "Professional visibility and durable reputation",
    yourEdge:
      "Build proof of skill now so dasha windows can amplify it — yogas reward prepared effort.",
    disclaimer: DISCLAIMER,
  },
  WEALTH: {
    badge: "Resource path",
    parallelTitle: "Builders of lasting value",
    parallelStory:
      "Wealth combinations are taught with patient value-builders — investors and enterprise founders known for compounding, not luck alone.",
    knownOutcome: "Steady resource growth and financial clarity",
    yourEdge: "Favour habits that compound: skills, savings, fair partnerships.",
    disclaimer: DISCLAIMER,
  },
  MARRIAGE: {
    badge: "Partnership path",
    parallelTitle: "Alliances that elevate both people",
    parallelStory:
      "Relationship yogas are illustrated with public partnerships that grew through mutual respect — alliances that lifted both careers and character.",
    knownOutcome: "Supportive partnership and shared growth",
    yourEdge: "Invest in sincerity and timing — partnership yogas favour maturity over haste.",
    disclaimer: DISCLAIMER,
  },
  HEALTH: {
    badge: "Vitality path",
    parallelTitle: "Disciplined vitality icons",
    parallelStory:
      "Health-leaning combinations are taught with people known for stamina and routine — athletes and practitioners who treat the body as an instrument.",
    knownOutcome: "Endurance and mind-body balance",
    yourEdge: "Protect sleep, food, and movement — vitality yogas need daily practice.",
    disclaimer: DISCLAIMER,
  },
  GENERAL: {
    badge: "Supportive theme",
    parallelTitle: "Quiet strengths in public stories",
    parallelStory:
      "Even modest yogas appear in the backgrounds of admired lives — supporting factors that made effort land better when timing aligned.",
    knownOutcome: "Background support that amplifies honest work",
    yourEdge:
      "Treat this as a tailwind: keep showing up; let dasha and Gochar do the highlighting.",
    disclaimer: DISCLAIMER,
  },
};

export function exemplarForYoga(input: {
  code?: string | null;
  category?: string | null;
  name?: string | null;
}): YogaExemplar {
  if (input.code && BY_CODE[input.code]) return BY_CODE[input.code]!;
  if (input.category && BY_CATEGORY[input.category]) return BY_CATEGORY[input.category]!;
  return BY_CATEGORY.GENERAL!;
}

export function exemplarForDosha(code: string): YogaExemplar {
  return (
    BY_CODE[code] || {
      badge: "Aware path",
      parallelTitle: "People who turned friction into focus",
      parallelStory:
        "Dosha themes are often taught with lives that looked intense from outside — yet produced mastery when the native chose discipline over fear.",
      knownOutcome: "Resilience and conscious self-management",
      yourEdge:
        "Read this as a training ground. Remedies, routine, and mature timing turn friction into focus.",
      disclaimer: DISCLAIMER,
    }
  );
}
