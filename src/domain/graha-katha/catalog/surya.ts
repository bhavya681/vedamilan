import { buildHouses } from "@/domain/graha-katha/houses";
import type { GrahaEntity } from "@/domain/graha-katha/types";

export const SURYA: GrahaEntity = {
  id: "surya",
  kind: "graha",
  sanskritName: "सूर्य",
  englishName: "Sun",
  engineName: "Sun",
  archetype: "The Soul & Inner Authority",
  essence: "Lead without losing your integrity.",
  visualConcept: "The Sun asks you to lead without losing your integrity.",
  deityAssociation: "Sūrya · Ātman symbolism",
  element: "Fire (Agni)",
  guna: "Sattva",
  day: "Sunday",
  colour: "Gold / copper",
  gemstone: "Ruby (traditional association)",
  mantra: "Om Suryaya Namah",
  tags: ["atma", "authority", "father", "leadership", "integrity", "power"],
  accent: "gold",
  metadata: ["Ātmakāraka themes", "Authority", "Vitality", "Father", "Integrity"],
  introduction:
    "Surya is traditionally associated with the soul’s radiance, self-respect, and rightful authority. In Jyotisha, the Sun may indicate how a person expresses identity, leadership, and moral courage.",
  chapters: [
    {
      id: "who",
      number: 1,
      title: "Who is Surya?",
      narrative:
        "Surya is the visible king of the sky — the light by which all else is seen. In Vedic symbolism he is linked with Ātman, conscience, and the courage to stand in one’s truth.",
      symbolizes: "Soul-force, clarity, and the center of a life’s orbit.",
      astrologicalConnection:
        "Astrologers may examine the Sun for vitality, confidence, father-themes, and how authority is claimed or avoided.",
      keyTeaching: "True power illuminates; it does not merely dominate.",
    },
    {
      id: "shani",
      number: 2,
      title: "Surya & Shani — Father and Consequence",
      narrative:
        "The father–son symbolism of Surya and Shani is a living teaching: brilliance must answer to time, and authority must accept accountability.",
      symbolizes: "Ego meeting duty; light learning humility.",
      astrologicalConnection:
        "Sun–Saturn dynamics in a chart are often read as tension or maturation between self-expression and responsibility.",
    },
    {
      id: "integrity",
      number: 3,
      title: "Authority Without Ego",
      narrative:
        "Classical stories of the Sun emphasize dharma in rulership — government, administration, and public trust as extensions of inner integrity.",
      symbolizes: "Service through leadership.",
      astrologicalConnection:
        "A strong Sun is traditionally associated with clarity of purpose; a challenged Sun may indicate struggles with recognition or self-worth — interpretive, not fatalistic.",
    },
    {
      id: "in-chart",
      number: 4,
      title: "Surya in Your Chart",
      narrative:
        "Wherever the Sun sits, life may ask you to show up as someone whose presence has moral weight.",
      symbolizes: "A throne of responsibility placed in a particular house.",
      astrologicalConnection:
        "Sign, house, and dignity shape traditional readings of solar expression — always alongside the full chart.",
    },
  ],
  nature: {
    coreNature: "Surya is the graha of soul-identity, vitality, and conscious authority.",
    represents: [
      "Ātman and self-respect",
      "Father and mentors in authority",
      "Leadership and visibility",
      "Morality and integrity",
      "Government and administration (traditional)",
      "Will to live with dignity",
    ],
    innerLesson: "Shine in a way that warms others without burning them.",
    whenStrong:
      "Traditionally linked with confidence, clear purpose, honorable leadership, and resilient vitality.",
    whenChallenged:
      "May be interpreted as ego wounds, conflicts with authority, or difficulty owning one’s light — invitations to rebuild self-respect ethically.",
    lifeDomains: {
      career: "Public role, leadership, government, or visible craft.",
      relationships: "Pride, protection, and the need for mutual respect.",
      family: "Father-line themes; becoming a reliable pillar.",
      mind: "Clarity of will; conscious intention.",
      health: "Traditionally vitality and heart themes — interpretive only.",
      spirituality: "Seeing the Self as light in action.",
      wealth: "Resources linked to status earned through merit.",
    },
  },
  houses: buildHouses([
    {
      traditional:
        "Sun in the 1st may indicate a strong personal presence and life-force orientation.",
      lifeExpression: "Identity seeks clarity and recognition through character.",
      possibleLesson: "Lead your life as if your example teaches.",
      reflection: "Where can you stand taller without standing over others?",
    },
    {
      traditional: "In the 2nd, speech and family resources may carry pride or authority themes.",
      lifeExpression: "Values and voice become instruments of dignity.",
      possibleLesson: "Speak as one whose words create light.",
      reflection: "Does your speech honor what you claim to value?",
    },
    {
      traditional: "In the 3rd, courage and effort may shine through initiative and skill.",
      lifeExpression: "Communication and siblings can involve leadership dynamics.",
      possibleLesson: "Brave action needs ethical aim.",
      reflection: "What brave step would align with your integrity?",
    },
    {
      traditional:
        "In the 4th, home and heart may seek noble peace; mother/land themes can be solar.",
      lifeExpression: "Emotional security linked to self-respect.",
      possibleLesson: "Inner throne before outer throne.",
      reflection: "Is your private self as honorable as your public self?",
    },
    {
      traditional: "In the 5th, creativity, romance, and intelligence may radiate strongly.",
      lifeExpression: "Teaching, art, or children become stages for soul expression.",
      possibleLesson: "Create from essence, not applause alone.",
      reflection: "What would you create if no one were watching?",
    },
    {
      traditional: "In the 6th, service and struggle refine the will.",
      lifeExpression: "Duty and competition may define growth.",
      possibleLesson: "Victory includes how you treat those you serve.",
      reflection: "Which daily battle is worthy of your light?",
    },
    {
      traditional: "In the 7th, partnership may involve pride, visibility, or strong counterparts.",
      lifeExpression: "Relating becomes a mirror of self-respect.",
      possibleLesson: "Share the sun — do not eclipse the other.",
      reflection: "Can you love without needing to be the brighter star?",
    },
    {
      traditional: "In the 8th, transformation tests ego; shared power asks for honesty.",
      lifeExpression: "Crisis can purify identity.",
      possibleLesson: "True strength survives the dark.",
      reflection: "What part of your pride is ready to die into wisdom?",
    },
    {
      traditional: "In the 9th, dharma, teachers, and higher purpose may be strongly solar.",
      lifeExpression: "Belief becomes a path of honorable living.",
      possibleLesson: "Philosophy must walk.",
      reflection: "Which truth are you ready to embody publicly?",
    },
    {
      traditional:
        "In the 10th, career and reputation are classically emphasized — public action and authority.",
      lifeExpression: "Vocation as a stage for integrity.",
      possibleLesson: "Power is stewardship.",
      reflection: "What legacy would make your name a blessing?",
    },
    {
      traditional: "In the 11th, gains and networks may involve influential circles.",
      lifeExpression: "Aspirations shine through alliances.",
      possibleLesson: "Elevate the group, not only yourself.",
      reflection: "Which community is worthy of your leadership?",
    },
    {
      traditional:
        "In the 12th, the Sun may turn inward — solitude, service, or spiritual surrender.",
      lifeExpression: "Ego softens into offering.",
      possibleLesson: "Light also knows how to rest.",
      reflection: "Where can you let go of needing to be seen?",
    },
  ]),
  remedies: [
    {
      id: "integrity",
      title: "Integrity in speech and role",
      body: "Traditional emphasis falls on truthful speech, respectful conduct toward father/elders, and honorable use of any authority you hold.",
      kind: "discipline",
    },
    {
      id: "surya-namaskar",
      title: "Sunrise awareness",
      body: "Many traditions encourage greeting the dawn with gratitude or Surya Namaskāra — as spiritual practice, not a medical prescription.",
      kind: "lifestyle",
    },
    {
      id: "service",
      title: "Service to rightful authority",
      body: "Supporting just leadership and refusing corrupt shortcuts is itself a solar ethic.",
      kind: "service",
    },
  ],
  reflections: [
    { id: "lead", prompt: "Where is life asking you to lead with integrity rather than image?" },
    { id: "father", prompt: "What did authority teach you — and what will you teach differently?" },
  ],
  relatedGrahaIds: ["shani", "mangal"],
  searchKeywords: [
    "sun",
    "surya",
    "father",
    "authority",
    "leadership",
    "atma",
    "government",
    "integrity",
  ],
};
