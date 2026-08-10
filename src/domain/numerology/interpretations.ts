/**
 * Per-number interpretation content.
 *
 * Each NumberProfile is data-driven — never hardcoded in components.
 *
 * Knowledge labels:
 *  - "traditional"   — planetary/number associations of this numerology system
 *  - "contemporary"  — interpretations from teaching notes (not classical doctrine)
 *  - "personalized"  — product synthesis of number + Kundli context (filled at runtime)
 */

import type { InterpretationBlock, KnowledgeLabel, NumberId, NumberProfile } from "./types";

function block(label: KnowledgeLabel, body: string): InterpretationBlock {
  return { label, body };
}

function traditional(body: string): InterpretationBlock {
  return block("traditional", body);
}

function contemporary(body: string): InterpretationBlock {
  return block("contemporary", body);
}

export function personalized(body: string): InterpretationBlock {
  return block("personalized", body);
}

export const NUMBER_PROFILES: Record<NumberId, NumberProfile> = {
  1: {
    number: 1,
    planet: "Sun",
    keyword: "Leadership",
    coreEnergy: "Initiative that begins and leads.",
    theme: "leadership",
    coreTendencies: [
      traditional(
        "Number 1 is associated with Surya (Sun) — the source of light, vitality, and inner authority in this system.",
      ),
      contemporary(
        "A Mulank/Bhagyank of 1 gives a native who often starts initiatives, prefers to lead rather than follow, and values independence.",
      ),
    ],
    strengths: [
      contemporary("Natural leadership and the ability to take charge of new projects."),
      contemporary("Clear sense of purpose and direction."),
    ],
    growthAreas: [
      contemporary("Watch for impatience with slower team members."),
      contemporary("Stubbornness can block learning from others."),
    ],
    career: [
      contemporary(
        "Thrives in roles with autonomy: entrepreneurship, management, public-facing work.",
      ),
    ],
    relationships: [
      contemporary("Often takes the lead in partnerships but benefits from equal collaboration."),
    ],
    communication: [
      contemporary("Direct and confident; prefers requests over commands to earn goodwill."),
    ],
    learning: [contemporary("Leads by doing; learns best through hands-on initiative.")],
    remedies: [
      traditional(
        "Offer water to the Sun (Surya Namaskar or sunrise salute) and wear ruby if indicated by the full Kundli.",
      ),
      traditional("Practice restraint in speech — discipline sharpens authority more than volume."),
    ],
  },

  2: {
    number: 2,
    planet: "Moon",
    keyword: "Emotional intelligence",
    coreEnergy: "Balance that connects and nurtures.",
    theme: "emotions",
    coreTendencies: [
      traditional(
        "Number 2 is associated with Chandra (Moon) — mind, moods, and nurturing currents.",
      ),
      contemporary(
        "A Mulank/Bhagyank of 2 gives a cooperative, intuitive native who seeks harmony and reads emotional undercurrents.",
      ),
    ],
    strengths: [
      contemporary("High emotional intelligence and mediation skills."),
      contemporary("Naturally supportive and relationship-minded."),
    ],
    growthAreas: [
      contemporary("Tendency to avoid conflict can delay decisions."),
      contemporary("Over-accommodating others may dilute personal boundaries."),
    ],
    career: [contemporary("Excels in counseling, diplomacy, caregiving, and team support roles.")],
    relationships: [contemporary("Deeply loyal but needs emotional authenticity over drama.")],
    communication: [contemporary("Listens more than it speaks; values a peaceful tone.")],
    learning: [
      contemporary("Learns through feeling and reflection; thrives in calm environments."),
    ],
    remedies: [
      traditional(
        "Strengthen the Moon through cool routines: early morning stillness, white lotus or moonstone.",
      ),
      traditional("Avoid getting lost in controversy — choose one clear path per decision."),
    ],
  },

  3: {
    number: 3,
    planet: "Jupiter",
    keyword: "Wisdom",
    coreEnergy: "Joy that teaches and expands.",
    theme: "wisdom",
    coreTendencies: [
      traditional("Number 3 is associated with Guru (Jupiter) — expansion, teaching, and dharma."),
      contemporary(
        "A Mulank/Bhagyank of 3 gives an optimistic, expressive native drawn to learning, creativity, and sharing knowledge.",
      ),
    ],
    strengths: [
      contemporary("Natural teaching/advisory tendencies and a bright outlook."),
      contemporary("Creative communication and a gift for encouragement."),
    ],
    growthAreas: [
      contemporary("Restlessness can scatter focus across too many interests."),
      contemporary("Over-enthusiasm may outpace follow-through."),
    ],
    career: [
      contemporary("Thrives in education, writing, coaching, and creative communication roles."),
    ],
    relationships: [
      contemporary("Inspiring friend and mentor; offers advice appropriately when asked."),
    ],
    communication: [contemporary("Enthusiastic storyteller; best received when listening first.")],
    learning: [contemporary("Thrives when teaching others — learning by sharing.")],
    remedies: [
      traditional(
        "Honour Jupiter through study, teaching, and sattvic diet; wear guru stone (yellow sapphire) if Kundli supports it.",
      ),
      traditional("Channel enthusiasm into one chosen path at a time."),
    ],
  },

  4: {
    number: 4,
    planet: "Rahu",
    keyword: "Unconventional thinking",
    coreEnergy: "Structure that builds and grounds.",
    theme: "innovation",
    coreTendencies: [
      traditional(
        "Number 4 is associated with Rahu — the shadow that drives material ambition and unconventional paths.",
      ),
      contemporary(
        "A Mulank/Bhagyank of 4 gives a pragmatic, methodical native who builds systems but may feel restless when too routine-bound.",
      ),
    ],
    strengths: [
      contemporary("Strong work ethic and ability to turn ideas into solid foundations."),
      contemporary("Practical problem-solver who plans for the long term."),
    ],
    growthAreas: [
      contemporary(
        "Overthinking can stall progress — physical activity helps release mental tension.",
      ),
      contemporary("Ambition without patience may chase quick material gains."),
    ],
    career: [
      contemporary("Excels in engineering, project management, construction, and system-building."),
    ],
    relationships: [
      contemporary("Values stability and loyalty; needs partners who respect discipline."),
    ],
    communication: [contemporary("Prefers clear, structured communication — gets to the point.")],
    learning: [
      contemporary("Learns by building and doing; theory must connect to tangible results."),
    ],
    remedies: [
      traditional("Ground through disciplined routine and physical work."),
      traditional("Avoid fast-money traps — verify opportunities carefully."),
    ],
  },

  5: {
    number: 5,
    planet: "Mercury",
    keyword: "Communication",
    coreEnergy: "Movement that communicates and adapts.",
    theme: "communication",
    coreTendencies: [
      traditional(
        "Number 5 is associated with Budha (Mercury) — intellect, speech, and adaptability.",
      ),
      contemporary(
        "A Mulank/Bhagyank of 5 gives a versatile, curious native who thrives on variety, communication, and new experiences.",
      ),
    ],
    strengths: [
      contemporary("Quick wit, persuasive communication, and natural adaptability."),
      contemporary("Comfort with travel and people-facing situations."),
    ],
    growthAreas: [
      contemporary("Restlessness can lead to scattered commitments."),
      contemporary("Over-talking may reduce influence — listen more than you speak."),
    ],
    career: [contemporary("Excels in sales, media, writing, teaching, and travel-based work.")],
    relationships: [
      contemporary("Keeps relationships lively but values mental connection over routine."),
    ],
    communication: [contemporary("Expressive and curious; adapts style to the audience.")],
    learning: [contemporary("Learns through conversation, movement, and variety.")],
    remedies: [
      traditional("Honour Mercury through communication, learning, and green foods."),
      traditional("Channel travel/people energy into one learning project at a time."),
    ],
  },

  6: {
    number: 6,
    planet: "Venus",
    keyword: "Beauty & material harmony",
    coreEnergy: "Care that harmonises and refines.",
    theme: "harmony",
    coreTendencies: [
      traditional("Number 6 is associated with Shukra (Venus) — beauty, desire, and harmony."),
      contemporary(
        "A Mulank/Bhagyank of 6 gives a warm, responsible native who seeks aesthetic balance and harmonious relationships.",
      ),
    ],
    strengths: [
      contemporary("Natural grace, artistic sensibility, and nurturing responsibility."),
      contemporary("Skilled at creating beauty and resolving interpersonal tension."),
    ],
    growthAreas: [
      contemporary("Over-indulgence in comfort can reduce motivation."),
      contemporary("People-pleasing may neglect personal needs."),
    ],
    career: [
      contemporary("Excels in design, arts, counseling, hospitality, and relationship-based work."),
    ],
    relationships: [contemporary("Loves deeply and seeks balanced, committed partnerships.")],
    communication: [contemporary("Diplomatic and pleasant; communicates with tact.")],
    learning: [contemporary("Learns best through beauty, art, and sensory-rich environments.")],
    remedies: [
      traditional(
        "Honour Venus through beauty, music, and artistic expression; balance giving with receiving.",
      ),
      traditional("Maintain relationship balance — attend to self as well as others."),
    ],
  },

  7: {
    number: 7,
    planet: "Ketu",
    keyword: "Intuition & detachment",
    coreEnergy: "Depth that questions and withdraws.",
    theme: "intuition",
    coreTendencies: [
      traditional(
        "Number 7 is associated with Ketu — the south node of detachment, intuition, and spiritual seeking.",
      ),
      contemporary(
        "A Mulank/Bhagyank of 7 gives an introspective, intuitive native drawn to truth, mystery, and inner development.",
      ),
    ],
    strengths: [
      contemporary("Strong intuition, research ability, and depth of focus."),
      contemporary("Naturally philosophical and discerning."),
    ],
    growthAreas: [
      contemporary("Isolation can become withdrawal — engagement is still needed."),
      contemporary("Over-analysis may delay decision-making."),
    ],
    career: [contemporary("Excels in research, spirituality, psychology, and analytical work.")],
    relationships: [
      contemporary("Values deep connection over surface interaction; trust must be earned."),
    ],
    communication: [
      contemporary("Says less but means more; communication is thoughtful and probing."),
    ],
    learning: [contemporary("Learns through introspection, study, and solitary inquiry.")],
    remedies: [
      traditional("Honour Ketu through meditation, fasting, and quiet study."),
      traditional("Be careful with trust — verify before fully opening."),
    ],
  },

  8: {
    number: 8,
    planet: "Saturn",
    keyword: "Discipline & endurance",
    coreEnergy: "Effort that endures and realigns.",
    theme: "discipline",
    coreTendencies: [
      traditional(
        "Number 8 is associated with Shani (Saturn) — discipline, karma, and long-term effort.",
      ),
      contemporary(
        "A Mulank/Bhagyank of 8 gives a determined, responsible native who builds lasting results through sustained effort.",
      ),
    ],
    strengths: [
      contemporary("Exceptional discipline, strategic thinking, and long-term vision."),
      contemporary("Earned authority through consistent action."),
    ],
    growthAreas: [
      contemporary("Impatience with slow progress can cause frustration."),
      contemporary("Taking on too much responsibility may lead to burnout."),
    ],
    career: [
      contemporary(
        "Excels in leadership, management, finance, and any field rewarding consistency.",
      ),
    ],
    relationships: [contemporary("Loyal but needs partners who respect commitment and structure.")],
    communication: [contemporary("Measured and deliberate; speaks with earned authority.")],
    learning: [contemporary("Learns through repetition, mentorship, and real-world application.")],
    remedies: [
      traditional("Honour Saturn through disciplined routine and patience."),
      traditional("Long-term effort beats short-term intensity — stay consistent."),
    ],
  },

  9: {
    number: 9,
    planet: "Mars",
    keyword: "Courage & action",
    coreEnergy: "Drive that completes and protects.",
    theme: "courage",
    coreTendencies: [
      traditional(
        "Number 9 is associated with Mangal (Mars) — courage, drive, and protective action.",
      ),
      contemporary(
        "A Mulank/Bhagyank of 9 gives an energetic, courageous native driven to complete what they start and protect what matters.",
      ),
    ],
    strengths: [
      contemporary("Raw courage, decisiveness, and the ability to push through resistance."),
      contemporary("Natural protector and motivator of others."),
    ],
    growthAreas: [
      contemporary("Impulsiveness can create unnecessary conflict."),
      contemporary("Over-assertion may alienate allies — channel energy constructively."),
    ],
    career: [
      contemporary("Excels in law enforcement, entrepreneurship, sports, and crisis leadership."),
    ],
    relationships: [contemporary("Passionate and loyal but benefits from tempering directness.")],
    communication: [contemporary("Direct and energetic; must guard against sounding aggressive.")],
    learning: [contemporary("Learns by doing; needs active, challenging environments.")],
    remedies: [
      traditional("Honour Mars through physical activity and righteous action."),
      traditional("Channel energy into constructive, protective purposes."),
    ],
  },
};

export function getNumberProfile(n: NumberId): NumberProfile {
  return NUMBER_PROFILES[n];
}

export function listNumberProfiles(): NumberProfile[] {
  return Object.values(NUMBER_PROFILES);
}
