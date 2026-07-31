import { buildHouses } from "@/domain/graha-katha/houses";
import type { GrahaEntity } from "@/domain/graha-katha/types";

export const KETU: GrahaEntity = {
  id: "ketu",
  kind: "graha",
  sanskritName: "केतु",
  englishName: "Ketu",
  engineName: "Ketu",
  archetype: "The Path of Detachment & Liberation",
  essence: "Where Ketu is, the soul may already know what the mind is still learning.",
  visualConcept:
    "Where Ketu is, the soul may already know something the mind is still trying to understand.",
  deityAssociation: "Shadow graha · Gaṇeśa associations in many remedial traditions",
  element: "Fire / ether symbolism",
  colour: "Ash / smoky grey",
  gemstone: "Cat’s eye (traditional — varies)",
  mantra: "Om Ketave Namah",
  tags: ["detachment", "spirituality", "past-life", "intuition", "liberation", "moksha"],
  accent: "charcoal",
  metadata: ["Detachment", "Intuition", "Mokṣa themes", "Past patterns", "Insight"],
  introduction:
    "Ketu is the complementary shadow to Rahu — traditionally associated with detachment, spiritual insight, and complexity that feels ‘already known.’ Past-life language here is spiritual/traditional interpretation, not empirical claim.",
  chapters: [
    {
      id: "who",
      number: 1,
      title: "Who is Ketu?",
      narrative:
        "Ketu is the body without the hungry head — completion, cut, and the strange peace after release. He is the graha of what we are learning to need less.",
      symbolizes: "Detachment, intuition, and liberation themes.",
      astrologicalConnection:
        "Astrologers may read Ketu as where life feels karmically familiar, spiritually sharp, or oddly incomplete until surrendered.",
      keyTeaching: "Letting go can be a form of intelligence.",
    },
    {
      id: "ganesha",
      number: 2,
      title: "Ketu & Gaṇeśa",
      narrative:
        "Many remedial traditions link Ketu with Gaṇeśa — remover of obstacles on the inner path. The teaching: wisdom clears the road that force alone cannot.",
      symbolizes: "Insight that opens closed doors.",
      astrologicalConnection:
        "Devotional framing is optional and personal; never presented as mandatory belief.",
    },
    {
      id: "past",
      number: 3,
      title: "Past-Life Symbolism",
      narrative:
        "In spiritual Jyotisha discourse, Ketu is often linked with prior-life mastery or unfinished renunciation. Treat this as tradition’s poetry of the soul — not proof of prior incarnations.",
      symbolizes: "Inherited spiritual instincts and sudden disinterest.",
      astrologicalConnection:
        "Label clearly as traditional/spiritual interpretation whenever discussing past lives.",
    },
    {
      id: "in-chart",
      number: 4,
      title: "Ketu in Your Chart",
      narrative:
        "Where Ketu sits, the mind may feel less greedy — or strangely blocked until meaning appears. The invitation is insight over acquisition.",
      symbolizes: "A monastery of one life domain.",
      astrologicalConnection:
        "Always pair with Rahu’s house for the full axis of desire and release.",
    },
  ],
  nature: {
    coreNature: "Ketu is the shadow graha of detachment, insight, and mokṣa-oriented themes.",
    represents: [
      "Spiritual detachment",
      "Intuitive / non-linear intelligence",
      "Past-life symbolism (traditional)",
      "Complexity and specialization",
      "Liberation from craving",
      "Sudden cuts and redirects",
    ],
    innerLesson: "Know when enough has been learned through wanting.",
    whenStrong:
      "Traditionally associated with spiritual insight, research depth, and freedom from shallow goals.",
    whenChallenged:
      "May be interpreted as confusion, isolation, or apathy — invitations to meaning and gentle structure.",
    lifeDomains: {
      career: "Research, occult/tech specialization, spiritual vocations.",
      relationships: "Detach-attach cycles; need for soul-level honesty.",
      family: "Unusual bonds; karmic distance themes.",
      mind: "Non-linear knowing; meditation aptitude symbolism.",
      health: "No medical claims from Ketu placements.",
      spirituality: "Primary — mokṣa, meditation, mystical paths.",
      wealth: "Disinterest or unconventional resource patterns.",
    },
  },
  houses: buildHouses([
    {
      traditional: "Ketu in the 1st may indicate a detached or spiritually inclined persona.",
      lifeExpression: "Identity seeks meaning beyond image.",
      possibleLesson: "Presence without clinging to persona.",
      reflection: "What part of ‘me’ am I ready to hold lightly?",
    },
    {
      traditional: "In the 2nd, speech or family values may feel atypical or renunciatory.",
      lifeExpression: "Resources handled with unusual detachment.",
      possibleLesson: "Speak from essence.",
      reflection: "What words still matter when status falls away?",
    },
    {
      traditional: "In the 3rd, courage may turn inward; skill becomes specialized.",
      lifeExpression: "Effort without loud ambition.",
      possibleLesson: "Quiet mastery.",
      reflection: "Which craft do you practice even without applause?",
    },
    {
      traditional:
        "In the 4th, emotional belonging may feel incomplete until inner peace is found.",
      lifeExpression: "Home as ashram; mother-themes complex.",
      possibleLesson: "Build peace that travel cannot steal.",
      reflection: "Where does your heart rest without needing more?",
    },
    {
      traditional: "In the 5th, creativity may be mystical or oddly gifted.",
      lifeExpression: "Romance of the spirit; children symbolism varies widely.",
      possibleLesson: "Create as offering.",
      reflection: "What art arrives when ego steps aside?",
    },
    {
      traditional: "In the 6th, service and healing work may feel karmic.",
      lifeExpression: "Duty without drama.",
      possibleLesson: "Serve without identity fusion.",
      reflection: "Which service feels like remembering?",
    },
    {
      traditional: "In the 7th, partnership may require spiritual honesty or unconventional form.",
      lifeExpression: "Relating beyond ordinary scripts.",
      possibleLesson: "See the soul, not only the role.",
      reflection: "Can you love without possessing?",
    },
    {
      traditional: "In the 8th, Ketu may deepen occult interest and transformative insight.",
      lifeExpression: "Research into the hidden; shared depths.",
      possibleLesson: "Seek truth without sensationalism.",
      reflection: "What mystery are you ready to meet with humility?",
    },
    {
      traditional: "In the 9th, faith may be unconventional or suddenly piercing.",
      lifeExpression: "Teachers appear as catalysts of release.",
      possibleLesson: "Belief without bondage.",
      reflection: "Which dogma are you ready to outgrow?",
    },
    {
      traditional: "In the 10th, career may feel destined yet detached from status hunger.",
      lifeExpression: "Vocation as calling more than ladder.",
      possibleLesson: "Serve the work, not the title.",
      reflection: "What work would you do even if unrecognized?",
    },
    {
      traditional: "In the 11th, gains and networks may feel selective or spiritually filtered.",
      lifeExpression: "Few true allies; wide ideals.",
      possibleLesson: "Want less, mean more.",
      reflection: "Which aspiration is ego — and which is dharma?",
    },
    {
      traditional: "In the 12th, Ketu is often linked with mokṣa themes and deep solitude.",
      lifeExpression: "Retreat, meditation, release.",
      possibleLesson: "Surrender as intelligence.",
      reflection: "What can you put down that your soul already finished?",
    },
  ]),
  remedies: [
    {
      id: "ganesha",
      title: "Gaṇeśa devotion (optional)",
      body: "Where it fits personal faith, Gaṇeśa upāsanā is traditionally suggested for Ketu — framed as cultivating clarity and obstacle-wisdom.",
      kind: "offering",
    },
    {
      id: "meditation",
      title: "Meditation and silence",
      body: "Quiet practice, reduced sensory overload, and honest solitude are classic Ketu allies.",
      kind: "lifestyle",
    },
  ],
  reflections: [
    {
      id: "know",
      prompt:
        "Where might your soul already know something your mind is still trying to understand?",
    },
  ],
  relatedGrahaIds: ["rahu", "shani", "guru"],
  searchKeywords: [
    "ketu",
    "detachment",
    "moksha",
    "past life",
    "spirituality",
    "intuition",
    "ganesha",
    "liberation",
  ],
};
