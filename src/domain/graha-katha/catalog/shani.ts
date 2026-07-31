import { buildHouses } from "@/domain/graha-katha/houses";
import type { GrahaEntity } from "@/domain/graha-katha/types";

export const SHANI: GrahaEntity = {
  id: "shani",
  kind: "graha",
  sanskritName: "शनि",
  englishName: "Saturn",
  engineName: "Saturn",
  archetype: "The Teacher of Karma, Discipline & Time",
  essence: "What can you sustain — not only what can you win quickly?",
  visualConcept: "Shani does not ask: How fast can you win? Shani asks: What can you sustain?",
  deityAssociation: "Shani Dev · traditionally linked with Yama’s justice",
  element: "Air (Vāyu)",
  guna: "Tamas (stabilizing inertia)",
  day: "Saturday",
  colour: "Deep blue / black",
  gemstone: "Blue sapphire (tradition varies — never medical advice)",
  mantra: "Om Sham Shanaischaraya Namah",
  tags: ["karma", "discipline", "time", "responsibility", "patience", "career"],
  accent: "charcoal",
  metadata: ["Karmakaraka", "Discipline", "Time", "Responsibility", "Delayed Rewards"],
  introduction:
    "In classical Jyotisha, Shani is traditionally associated with time, duty, and the ripening of karma. Astrologers may read his placement as highlighting areas where patience, structure, and sustained effort matter more than speed.",
  chapters: [
    {
      id: "who",
      number: 1,
      title: "Who is Shani?",
      narrative:
        "Shani is often described as the slow-moving graha — Shanaischara, “the one who moves slowly.” In story and symbolism, he is not cruelty for its own sake, but the gravity of consequence.",
      symbolizes: "Time, responsibility, patience, and the weight of what we build.",
      astrologicalConnection:
        "Because Shani is traditionally associated with delay and discipline, astrologers often examine his placement when interpreting areas that may require long-term development.",
      keyTeaching: "What matures slowly often roots deeply.",
    },
    {
      id: "surya-chhaya",
      number: 2,
      title: "The Story of Surya & Chhaya",
      narrative:
        "In Purāṇic framing, Shani is born of Surya and Chhāyā (Shadow). The Sun’s brilliance meets shadow, and from that meeting comes a teacher who does not flatter — a son whose gaze tests integrity.",
      symbolizes: "Authority meeting consequence; light learning to respect darkness.",
      astrologicalConnection:
        "The Sun–Saturn symbolic tension is often read as the dialogue between ego/authority and duty/accountability in a chart.",
    },
    {
      id: "karma",
      number: 3,
      title: "Why Shani Represents Karma",
      narrative:
        "As Karmakaraka in many traditional systems, Shani is linked with the ledger of actions — not as punishment theater, but as the principle that results ripen in their season.",
      symbolizes: "Cause and effect unfolding across time.",
      astrologicalConnection:
        "In this tradition, Shani’s house and sign may indicate where life asks for ethical consistency and where shortcuts tend to cost more later.",
    },
    {
      id: "time",
      number: 4,
      title: "Why His Results Often Take Time",
      narrative:
        "Folk and classical lore alike speak of Shani’s slow transit — including the widely known ~2.5-year stay in a sign. The teaching is rhythm: growth that cannot be rushed.",
      symbolizes: "Seasons of effort, harvest delayed but earned.",
      astrologicalConnection:
        "Transit mythology is interpretive storytelling; chart timing always depends on the full horoscope and classical techniques — never a single graha in isolation.",
    },
    {
      id: "in-chart",
      number: 5,
      title: "Understanding Shani in Your Chart",
      narrative:
        "Where Shani sits, life may invite structure. The invitation is not fear — it is craftsmanship of character.",
      symbolizes: "A classroom of discipline placed in a particular life domain.",
      astrologicalConnection:
        "House, sign, dignity, aspects, and dashā context all shape how astrologers may interpret Shani — engine data first, story second.",
    },
  ],
  nature: {
    coreNature:
      "Shani is traditionally the graha of structure, endurance, and karmic accountability.",
    represents: [
      "Discipline and hard work",
      "Delayed but durable rewards",
      "Responsibility and duty",
      "Time and longevity of effort",
      "Boundaries and realism",
      "Feelings of lack that can catalyze maturity",
    ],
    innerLesson: "Build what you can keep — integrity over urgency.",
    whenStrong:
      "Traditionally associated with steady achievement, reliability, ethical leadership, and wisdom earned through experience.",
    whenChallenged:
      "May be interpreted as periods of restriction, loneliness, heavy duty, or fear of inadequacy — invitations to restructure rather than despair.",
    lifeDomains: {
      career: "Public duty, reputation built over years, mastery through practice.",
      relationships: "Loyalty tested by time; commitment over performance.",
      family: "Elder care, ancestral duty, responsibility for lineage stability.",
      mind: "Sobriety, patience, and learning to sit with difficulty.",
      health:
        "Traditionally linked with bones, joints, and chronic patterns — interpretive only, not medical.",
      spirituality: "Detachment from shortcuts; dharma through endurance.",
      wealth: "Slow accumulation; resources earned and conserved.",
    },
  },
  houses: buildHouses([
    {
      traditional:
        "Shani in the 1st may be read as a serious presence, delayed self-confidence, or a life path shaped by responsibility early on.",
      lifeExpression: "Identity forged through duty; maturity that arrives through effort.",
      possibleLesson: "Self-respect grows when you keep promises to yourself.",
      reflection: "Where are you building character instead of image?",
    },
    {
      traditional:
        "In the 2nd, Shani is often linked with careful speech, thrift, and resources that stabilize slowly.",
      lifeExpression: "Family duty and financial prudence may feel heavy yet formative.",
      possibleLesson: "Value what is durable in word and wealth.",
      reflection: "What are you willing to save for rather than spend for?",
    },
    {
      traditional:
        "In the 3rd, effort and courage may develop through repetition rather than flash.",
      lifeExpression: "Skills, writing, or sibling dynamics can carry a serious tone.",
      possibleLesson: "Courage is a practice, not a mood.",
      reflection: "Which small efforts, repeated, would change your path?",
    },
    {
      traditional:
        "In the 4th, home and emotional security may require structure; peace may be earned.",
      lifeExpression: "Property, mother-themes, or inner calm can involve duty and delay.",
      possibleLesson: "Safety is built, not only felt.",
      reflection: "What kind of home are you constructing inside yourself?",
    },
    {
      traditional:
        "In the 5th, creativity and romance may mature slowly; intelligence becomes disciplined.",
      lifeExpression: "Teaching, craft, or children may involve responsibility and patience.",
      possibleLesson: "Joy deepens when craftsmanship meets play.",
      reflection: "What creative work deserves a longer timeline?",
    },
    {
      traditional:
        "In the 6th, Shani is often associated with service, routine, and overcoming obstacles through persistence.",
      lifeExpression: "Daily systems, health habits, and work ethics may define progress.",
      possibleLesson: "Discipline is a form of compassion for your future self.",
      reflection: "Which daily duty is quietly shaping your destiny?",
    },
    {
      traditional: "In the 7th, partnership may emphasize commitment, timing, and serious bonds.",
      lifeExpression: "Marriage or contracts can feel karmic; quality over speed.",
      possibleLesson: "Relating well is a long apprenticeship.",
      reflection: "Are you seeking partnership as comfort — or as shared responsibility?",
    },
    {
      traditional:
        "In the 8th, transformation may be slow and deep; shared resources ask for integrity.",
      lifeExpression: "Crisis can become craftsmanship of the psyche when met with patience.",
      possibleLesson: "Depth requires courage to stay.",
      reflection: "What truth are you learning not to rush?",
    },
    {
      traditional:
        "In the 9th, dharma, teachers, and belief systems may be tested and refined over time.",
      lifeExpression: "Faith becomes practice; wisdom arrives through lived ethics.",
      possibleLesson: "Philosophy without discipline is decoration.",
      reflection: "Which teaching are you ready to live, not only admire?",
    },
    {
      traditional:
        "In the 10th, career and public reputation are classically a strong Shani signature — achievement through sustained effort.",
      lifeExpression: "Authority earned; vocation as duty and craft.",
      possibleLesson: "Success that lasts is paced.",
      reflection: "What kind of success are you building slowly rather than chasing quickly?",
    },
    {
      traditional:
        "In the 11th, gains and networks may arrive through long alliances and realistic goals.",
      lifeExpression: "Friendships and aspirations mature with accountability.",
      possibleLesson: "Choose circles that respect time and integrity.",
      reflection: "Which ambitions deserve a decade, not a week?",
    },
    {
      traditional:
        "In the 12th, solitude, release, and spiritual discipline may color the journey.",
      lifeExpression: "Withdrawal can be productive; letting go becomes skill.",
      possibleLesson: "Not every burden is yours to carry forever.",
      reflection: "What are you ready to release with dignity?",
    },
  ]),
  remedies: [
    {
      id: "discipline",
      title: "Discipline as primary remedy",
      body: "In this tradition, consistent duty — keeping time, finishing work, serving elders — is often emphasized over shortcuts or fear-based rituals alone.",
      kind: "discipline",
    },
    {
      id: "service",
      title: "Service and humility",
      body: "Traditional guidance may include helping those who are overlooked, feeding the needy, or quiet seva — framed as aligning with Shani’s ethic of responsibility.",
      kind: "service",
    },
    {
      id: "nazar",
      title: "Nazar-related traditional guidance",
      body: "Folk practice sometimes links Shani with protection from envious gaze. Treat such guidance as cultural custom, not scientific claim — and never as a substitute for practical care.",
      kind: "lifestyle",
    },
    {
      id: "avoid-shortcuts",
      title: "Avoiding shortcuts",
      body: "Interpretively, Shani rewards paths that can survive scrutiny. Integrity in contracts, speech, and daily labor is the living remedy.",
      kind: "reflection",
    },
  ],
  reflections: [
    {
      id: "sustain",
      prompt: "What can you sustain for the next five years — not only the next five days?",
    },
    { id: "duty", prompt: "Where is life asking you for responsibility rather than recognition?" },
    {
      id: "patience",
      prompt: "What delay in your story might actually be protection or preparation?",
    },
  ],
  relatedGrahaIds: ["surya", "rahu", "ketu"],
  searchKeywords: [
    "saturn",
    "shani",
    "karma",
    "discipline",
    "career",
    "10th house",
    "delay",
    "responsibility",
    "time",
    "remedies",
  ],
};
