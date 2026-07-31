import { buildHouses } from "@/domain/graha-katha/houses";
import type { GrahaEntity } from "@/domain/graha-katha/types";

export const BUDHA: GrahaEntity = {
  id: "budha",
  kind: "graha",
  sanskritName: "बुध",
  englishName: "Mercury",
  engineName: "Mercury",
  archetype: "The Messenger & Intelligence",
  essence: "Curiosity that connects — mind as bridge.",
  visualConcept: "Budha asks: What are you learning to say clearly?",
  deityAssociation: "Budha · linked in lore with Chandra and Tārā",
  element: "Earth",
  guna: "Rajas",
  day: "Wednesday",
  colour: "Green",
  gemstone: "Emerald (traditional)",
  mantra: "Om Budhaya Namah",
  tags: ["intelligence", "communication", "business", "youth", "learning", "strategy"],
  accent: "cosmic",
  metadata: ["Intelligence", "Speech", "Trade", "Adaptability", "Analysis"],
  introduction:
    "Budha is traditionally the messenger — intellect, speech, calculation, and youthful adaptability. Myths involving Manu, Ilā, and Sudyumna, and the Chandra–Tārā cycle, are historical-literary frames; handle sensitive gender themes as story, not medical fact.",
  chapters: [
    {
      id: "who",
      number: 1,
      title: "Who is Budha?",
      narrative:
        "Budha is quicksilver mind — the student who can wear many hats. He translates heaven into language, numbers, and negotiation.",
      symbolizes: "Intelligence, duality, and skilled communication.",
      astrologicalConnection:
        "Astrologers may examine Mercury for learning style, speech, commerce, and analytical skill.",
      keyTeaching: "Clarity is kindness.",
    },
    {
      id: "ila",
      number: 2,
      title: "Manu, Ilā & Sudyumna — Story Frame",
      narrative:
        "Classical lore includes narratives of gender transformation around Ilā/Sudyumna. In Graha Katha we present this as mythology about fluidity and consequence — never as clinical claim about bodies or sexuality.",
      symbolizes: "Adaptability and the many faces of identity in story.",
      astrologicalConnection:
        "Any traditional notes linking Mercury to duality should be read as symbolic/historical interpretation, not medical advice.",
    },
    {
      id: "tara",
      number: 3,
      title: "Moon, Tārā & Mercury",
      narrative:
        "Budha’s birth story in some Purāṇas arises from the complex bond of Chandra and Tārā — desire, rupture, and a child of extraordinary intelligence.",
      symbolizes: "Wit born from emotional complexity.",
      astrologicalConnection:
        "Moon–Mercury combinations are often discussed for mental agility or restlessness.",
    },
    {
      id: "in-chart",
      number: 4,
      title: "Budha in Your Chart",
      narrative:
        "Where Mercury sits, life may ask for learning, naming, trading, and translating experience into skill.",
      symbolizes: "A classroom of speech and strategy.",
      astrologicalConnection:
        "Sign and conjunctions (especially with Sun) strongly color Mercury’s traditional reading.",
    },
  ],
  nature: {
    coreNature: "Budha is the graha of intellect, speech, and adaptive cleverness.",
    represents: [
      "Analytical intelligence",
      "Communication and writing",
      "Trade and negotiation",
      "Youthful curiosity",
      "Strategy and calculation",
      "Learning and teaching crafts",
    ],
    innerLesson: "Use cleverness in service of truth.",
    whenStrong: "Traditionally linked with eloquence, commercial skill, humor, and quick learning.",
    whenChallenged:
      "May be interpreted as scattered focus, nervous speech, or cunning without ethics — invitations to slow down and mean what you say.",
    lifeDomains: {
      career: "Business, media, tech, teaching, accounting themes.",
      relationships: "Talk as intimacy; wit as bonding.",
      family: "Sibling/peer learning dynamics.",
      mind: "Primary — thought, study, worry loops.",
      health: "Traditionally nerves/skin symbolism — not medical.",
      spirituality: "Scripture study, mantra precision, jñāna paths.",
      wealth: "Gains through skill, trade, and information.",
    },
  },
  houses: buildHouses([
    {
      traditional: "Mercury in the 1st may indicate a communicative, curious persona.",
      lifeExpression: "Identity expressed through ideas and speech.",
      possibleLesson: "Be as clear as you are clever.",
      reflection: "What message is your life trying to articulate?",
    },
    {
      traditional: "In the 2nd, speech and family commerce themes strengthen.",
      lifeExpression: "Voice and values intertwine with livelihood.",
      possibleLesson: "Honest speech is wealth.",
      reflection: "Do your words increase trust in your circle?",
    },
    {
      traditional: "In the 3rd, Mercury is often comfortable — skills and courage of mind.",
      lifeExpression: "Writing, media, siblings as learning lab.",
      possibleLesson: "Practice until skill becomes ease.",
      reflection: "Which craft deserves daily pages?",
    },
    {
      traditional: "In the 4th, education at home and emotional literacy matter.",
      lifeExpression: "Mind seeks a peaceful study nest.",
      possibleLesson: "Inner quiet improves thought quality.",
      reflection: "Where does your mind feel safest to think?",
    },
    {
      traditional: "In the 5th, intelligence and creative wit may shine.",
      lifeExpression: "Playful learning; romance of ideas.",
      possibleLesson: "Teach what delights you.",
      reflection: "What would you love to explain to a child?",
    },
    {
      traditional: "In the 6th, analysis serves problem-solving and routine craft.",
      lifeExpression: "Work systems, health logistics, service skills.",
      possibleLesson: "Detail work can be devotion.",
      reflection: "Which messy process could use a clearer map?",
    },
    {
      traditional: "In the 7th, partnership thrives on dialogue.",
      lifeExpression: "Contracts and counseling themes may appear.",
      possibleLesson: "Listen as carefully as you argue.",
      reflection: "Are you debating to win — or to understand?",
    },
    {
      traditional: "In the 8th, research and occult study may deepen intellect.",
      lifeExpression: "Shared finances and secrets need transparent talk.",
      possibleLesson: "Curiosity into the hidden must stay ethical.",
      reflection: "What truth are you researching with respect?",
    },
    {
      traditional: "In the 9th, higher learning and teaching paths open.",
      lifeExpression: "Philosophy meets communication skill.",
      possibleLesson: "Translate wisdom into plain language.",
      reflection: "Which teacher’s words still shape your sentences?",
    },
    {
      traditional: "In the 10th, career may involve communication or commerce publicly.",
      lifeExpression: "Reputation as the skilled messenger.",
      possibleLesson: "Professional clarity builds trust.",
      reflection: "How do you want your work to speak for you?",
    },
    {
      traditional: "In the 11th, networks and goals benefit from clever alliance.",
      lifeExpression: "Friends as information ecosystems.",
      possibleLesson: "Share knowledge generously.",
      reflection: "Who learns with you rather than from you only?",
    },
    {
      traditional: "In the 12th, the mind may turn private — foreign languages, contemplation.",
      lifeExpression: "Quiet study; dreams as messages.",
      possibleLesson: "Silence is also a language.",
      reflection: "What noise must you reduce to hear yourself?",
    },
  ]),
  remedies: [
    {
      id: "study",
      title: "Honest study",
      body: "Daily learning and careful speech are classic Mercury allies — especially telling the truth even when wit tempts otherwise.",
      kind: "discipline",
    },
  ],
  reflections: [
    { id: "say", prompt: "What are you learning to say with more honesty and less performance?" },
  ],
  relatedGrahaIds: ["chandra", "guru"],
  searchKeywords: [
    "mercury",
    "budha",
    "communication",
    "business",
    "intelligence",
    "learning",
    "speech",
  ],
};
