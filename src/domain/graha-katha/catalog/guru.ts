import { buildHouses } from "@/domain/graha-katha/houses";
import type { GrahaEntity } from "@/domain/graha-katha/types";

export const GURU: GrahaEntity = {
  id: "guru",
  kind: "graha",
  sanskritName: "गुरु / बृहस्पति",
  englishName: "Jupiter",
  engineName: "Jupiter",
  archetype: "The Teacher & Wisdom",
  essence: "Grow through meaning — expand what is true.",
  visualConcept: "Guru asks: What wisdom are you ready to live?",
  deityAssociation: "Bṛhaspati · Devaguru",
  element: "Ether (Ākāśa)",
  guna: "Sattva",
  day: "Thursday",
  colour: "Yellow / saffron",
  gemstone: "Yellow sapphire (traditional)",
  mantra: "Om Gurave Namah",
  tags: ["wisdom", "dharma", "teachers", "expansion", "children", "grace"],
  accent: "gold",
  metadata: ["Wisdom", "Dharma", "Expansion", "Teachers", "Grace"],
  introduction:
    "Guru (Bṛhaspati) is traditionally the teacher of the gods — wisdom, dharma, counsel, and benevolent expansion. Astrologers may read Jupiter as where life offers growth through meaning, mentors, and ethical optimism.",
  chapters: [
    {
      id: "who",
      number: 1,
      title: "Who is Guru?",
      narrative:
        "Bṛhaspati is the counselor whose wealth is understanding. He expands what is true — not merely what is large.",
      symbolizes: "Wisdom, faith, and generative blessing.",
      astrologicalConnection:
        "Jupiter is often examined for teachers, children, fortune themes, and moral outlook.",
      keyTeaching: "Expansion without ethics is inflation.",
    },
    {
      id: "shukra",
      number: 2,
      title: "Guru & Shukra — Two Teachers",
      narrative:
        "Bṛhaspati guides the Devas; Shukrāchārya guides the Daityas. The pair frames two pedagogies: celestial dharma and the fierce wisdom of desire refined.",
      symbolizes: "Complementary paths of teaching and desire.",
      astrologicalConnection:
        "Jupiter–Venus dynamics may be read for values around love, learning, and refinement.",
    },
    {
      id: "in-chart",
      number: 3,
      title: "Guru in Your Chart",
      narrative:
        "Where Jupiter sits, life may invite trust, study, and growth that feels like grace earned through character.",
      symbolizes: "A classroom of meaning.",
      astrologicalConnection:
        "Dignity and house color whether growth feels easy or hard-won — always chart-context dependent.",
    },
  ],
  nature: {
    coreNature: "Guru is the graha of wisdom, dharma, and benevolent growth.",
    represents: [
      "Teachers and counsel",
      "Dharma and ethics",
      "Children and creativity (traditional)",
      "Higher learning",
      "Optimism and faith",
      "Expansion of resources and meaning",
    ],
    innerLesson: "Seek growth that makes you kinder and wiser.",
    whenStrong:
      "Traditionally associated with guidance, generosity, sound judgment, and protective fortune.",
    whenChallenged:
      "May be interpreted as overconfidence, dogma, or excess — invitations to humble study.",
    lifeDomains: {
      career: "Law, teaching, advising, finance symbolism.",
      relationships: "Mentorship within love; ethical relating.",
      family: "Children, elders as gurus.",
      mind: "Belief systems and meaning-making.",
      health: "Traditionally liver/fat metaphors — not medical.",
      spirituality: "Scripture, satsang, guru-principle.",
      wealth: "Growth through dharma-aligned opportunity.",
    },
  },
  houses: buildHouses([
    {
      traditional: "Jupiter in the 1st may indicate a guiding, optimistic presence.",
      lifeExpression: "Identity as student-teacher of life.",
      possibleLesson: "Embody the advice you give.",
      reflection: "What wisdom are people already learning from watching you?",
    },
    {
      traditional: "In the 2nd, speech and family resources may be blessed when ethical.",
      lifeExpression: "Values become wealth philosophy.",
      possibleLesson: "Speak to uplift.",
      reflection: "Does your money story include generosity?",
    },
    {
      traditional: "In the 3rd, courage of conviction and skilled teaching expand.",
      lifeExpression: "Writing and effort as dharma.",
      possibleLesson: "Share knowledge bravely.",
      reflection: "Which idea deserves your courage?",
    },
    {
      traditional: "In the 4th, home and happiness may grow through meaning and faith.",
      lifeExpression: "Inner peace linked to trust.",
      possibleLesson: "Make home a place of learning.",
      reflection: "What belief makes your heart feel housed?",
    },
    {
      traditional: "In the 5th, Jupiter is often celebrated — creativity, children, intelligence.",
      lifeExpression: "Joyful wisdom; mentoring the young.",
      possibleLesson: "Play is also sacred study.",
      reflection: "Where can you teach through delight?",
    },
    {
      traditional: "In the 6th, service and problem-solving become paths of growth.",
      lifeExpression: "Ethics in daily work.",
      possibleLesson: "Help without superiority.",
      reflection: "Whom can you lift this week quietly?",
    },
    {
      traditional: "In the 7th, partnership may involve a teacher-quality bond.",
      lifeExpression: "Marriage as mutual growth.",
      possibleLesson: "Counsel with kindness.",
      reflection: "Do you grow wiser together?",
    },
    {
      traditional: "In the 8th, deep study and transformative faith may arise.",
      lifeExpression: "Shared resources handled with ethics.",
      possibleLesson: "Trust the process of renewal.",
      reflection: "What loss became a teacher?",
    },
    {
      traditional: "In the 9th, Jupiter is classically strong — dharma, gurus, higher truth.",
      lifeExpression: "Life as pilgrimage of meaning.",
      possibleLesson: "Live the scripture you quote.",
      reflection: "Which teaching still asks to be practiced?",
    },
    {
      traditional: "In the 10th, career may involve advising, teaching, or ethical leadership.",
      lifeExpression: "Public role as wise counsel.",
      possibleLesson: "Success includes how you guide others.",
      reflection: "What would dharmic success look like in your field?",
    },
    {
      traditional: "In the 11th, gains and friendships may expand through mentors and networks.",
      lifeExpression: "Aspirations blessed by good company.",
      possibleLesson: "Want for the many, not only the self.",
      reflection: "Which community multiplies your wisdom?",
    },
    {
      traditional: "In the 12th, spiritual retreat and charity may deepen.",
      lifeExpression: "Quiet faith; foreign wisdom paths.",
      possibleLesson: "Give without advertising.",
      reflection: "What can you release as an offering?",
    },
  ]),
  remedies: [
    {
      id: "study-dharma",
      title: "Study and teach",
      body: "Learning sacred or ethical texts and sharing knowledge generously is a classic Jupiterian path.",
      kind: "discipline",
    },
    {
      id: "generosity",
      title: "Generosity",
      body: "Dāna — thoughtful giving — is traditionally associated with Guru’s grace.",
      kind: "service",
    },
  ],
  reflections: [
    { id: "live", prompt: "What wisdom are you ready to live rather than only admire?" },
  ],
  relatedGrahaIds: ["shukra", "surya"],
  searchKeywords: [
    "jupiter",
    "guru",
    "brihaspati",
    "wisdom",
    "dharma",
    "teachers",
    "children",
    "expansion",
  ],
};
