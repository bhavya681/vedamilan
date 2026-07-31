import { buildHouses } from "@/domain/graha-katha/houses";
import type { GrahaEntity } from "@/domain/graha-katha/types";

export const RAHU: GrahaEntity = {
  id: "rahu",
  kind: "graha",
  sanskritName: "राहु",
  englishName: "Rahu",
  engineName: "Rahu",
  archetype: "The Force of Desire, Ambition & Expansion",
  essence: "Where Rahu is, desire becomes louder — meet it with awareness.",
  visualConcept: "Where Rahu is, desire becomes louder.",
  deityAssociation: "Shadow graha · eclipse lore with Surya & Chandra",
  element: "Air / smoke symbolism",
  day: "Saturday (assoc. varies)",
  colour: "Smoky / multi-hue",
  gemstone: "Hessonite (traditional — varies)",
  mantra: "Om Rahave Namah",
  tags: ["desire", "ambition", "technology", "unconventional", "illusion", "growth"],
  accent: "cosmic",
  metadata: ["Desire", "Ambition", "Innovation", "Obsession", "Foreign paths"],
  introduction:
    "Rahu is a shadow graha — traditionally associated with intense desire, unconventional paths, foreign or technological frontiers, and the amplifying of hunger. Read without fear: Rahu highlights where appetite is loud so consciousness can grow.",
  chapters: [
    {
      id: "who",
      number: 1,
      title: "Who is Rahu?",
      narrative:
        "Rahu is the head that still hungers after the nectar story — appetite without a complete body. He is the force that reaches beyond the familiar.",
      symbolizes: "Ambition, illusion, and exponential craving.",
      astrologicalConnection:
        "Astrologers may read Rahu as where life pulls toward novelty, intensity, and unconventional success — with equal need for discernment.",
      keyTeaching: "Hunger is information; it is not always instruction.",
    },
    {
      id: "eclipse",
      number: 2,
      title: "Rahu with Sun & Moon",
      narrative:
        "Eclipse lore binds Rahu to the luminaries — temporary obscuration of clarity or feeling. The teaching is humility: light and mind can be covered, then revealed again.",
      symbolizes: "Temporary loss of clear seeing; return of light.",
      astrologicalConnection:
        "Rahu with Sun/Moon is often discussed carefully as identity or emotional intensity — never as doom.",
    },
    {
      id: "dispositor",
      number: 3,
      title: "The Dispositor Principle",
      narrative:
        "Classical technique looks to the lord of Rahu’s sign — the dispositor — to understand how desire may be guided or grounded.",
      symbolizes: "Appetite needs a wise steward.",
      astrologicalConnection:
        "Always read Rahu with his dispositor and full chart context — never Rahu alone.",
    },
    {
      id: "in-chart",
      number: 4,
      title: "Rahu in Your Chart",
      narrative:
        "Where Rahu sits, life may amplify wanting. The spiritual task is to aim that voltage toward growth without losing ethics.",
      symbolizes: "A laboratory of desire.",
      astrologicalConnection:
        "House themes show the domain of hunger; dashā timing modulates expression.",
    },
  ],
  nature: {
    coreNature: "Rahu is the shadow graha of amplified desire and unconventional expansion.",
    represents: [
      "Ambition and worldly hunger",
      "Foreign / unconventional paths",
      "Technology and innovation symbolism",
      "Illusion and fascination",
      "Subconscious patterns of craving",
      "Sudden rises (and tests of integrity)",
    ],
    innerLesson: "Name the desire — then choose consciously.",
    whenStrong:
      "Traditionally associated with breakthrough success, innovative thinking, and magnetic pursuit of goals when ethically steered.",
    whenChallenged:
      "May be interpreted as obsession, confusion, or shortcut temptation — invitations to slow down and verify reality.",
    lifeDomains: {
      career: "Tech, media, foreign markets, disruptive paths.",
      relationships: "Intense attraction; unconventional bonds.",
      family: "Breaks from tradition or complex lineage themes.",
      mind: "Fascination loops; need for digital hygiene.",
      health: "Avoid medical claims from shadow grahas.",
      spirituality: "Tantric edge or modern seeking — with guidance.",
      wealth: "Speculative gains symbolism — risk awareness required.",
    },
  },
  houses: buildHouses([
    {
      traditional: "Rahu in the 1st may amplify personality and hunger for recognition.",
      lifeExpression: "Identity experiments; strong presence.",
      possibleLesson: "Be authentic beneath the persona.",
      reflection: "What desire is driving how you present yourself?",
    },
    {
      traditional: "In the 2nd, speech and wealth appetite may intensify.",
      lifeExpression: "Family resources and voice become charged.",
      possibleLesson: "Truth over persuasive illusion.",
      reflection: "Where might words be selling more than they deliver?",
    },
    {
      traditional: "In the 3rd, courage and media skill may become unconventional strengths.",
      lifeExpression: "Bold communication; restless effort.",
      possibleLesson: "Aim the hustle.",
      reflection: "Which skill are you obsessing toward mastery?",
    },
    {
      traditional: "In the 4th, home and belonging may feel unsettled or unconventional.",
      lifeExpression: "Emotional security sought in unusual places.",
      possibleLesson: "Build inner home amid change.",
      reflection: "What does ‘home’ mean when desire pulls outward?",
    },
    {
      traditional: "In the 5th, creative risk and romance intensity may rise.",
      lifeExpression: "Speculative creativity; dramatic heart.",
      possibleLesson: "Play with awareness.",
      reflection: "Is this inspiration — or compulsion?",
    },
    {
      traditional: "In the 6th, competition and problem-solving may become obsessive strengths.",
      lifeExpression: "Service through unconventional methods.",
      possibleLesson: "Win without becoming the conflict.",
      reflection: "Which daily battle is worth your voltage?",
    },
    {
      traditional: "In the 7th, partnership may be unusual, foreign, or intensely magnetic.",
      lifeExpression: "Relating as a frontier.",
      possibleLesson: "See the person, not only the projection.",
      reflection: "What are you hungry for in partnership — truly?",
    },
    {
      traditional: "In the 8th, research, occult interest, and shared resources intensify.",
      lifeExpression: "Deep curiosity; transformative craving.",
      possibleLesson: "Seek depth without exploitation.",
      reflection: "What mystery deserves ethical study?",
    },
    {
      traditional: "In the 9th, belief systems and foreign wisdom may fascinate.",
      lifeExpression: "Unorthodox faith or teachers.",
      possibleLesson: "Question without becoming cynical.",
      reflection: "Which teaching are you amplifying — and why?",
    },
    {
      traditional: "In the 10th, career ambition and public image may surge.",
      lifeExpression: "Unconventional vocation; visibility hunger.",
      possibleLesson: "Let integrity outpace hype.",
      reflection: "What success would still matter if no one posted it?",
    },
    {
      traditional: "In the 11th, networks and gains may expand rapidly in symbolism.",
      lifeExpression: "Large ambitions; influential circles.",
      possibleLesson: "Choose tribes that ground you.",
      reflection: "Which alliances feed growth versus illusion?",
    },
    {
      traditional: "In the 12th, foreign lands, isolation, or spiritual hunger deepen.",
      lifeExpression: "Private obsessions; release practices needed.",
      possibleLesson: "Surrender the endless chase sometimes.",
      reflection: "What craving softens in solitude?",
    },
  ]),
  remedies: [
    {
      id: "awareness",
      title: "Awareness over fear",
      body: "Traditional spiritual guidance emphasizes honesty about desire, reducing intoxicating shortcuts, and grounding practices — never panic rituals as the whole path.",
      kind: "reflection",
    },
    {
      id: "dispositor",
      title: "Strengthen the dispositor’s virtues",
      body: "Working the ethical strengths of Rahu’s sign-lord is a classical interpretive strategy.",
      kind: "discipline",
    },
  ],
  reflections: [
    {
      id: "loud",
      prompt: "Where is desire loudest in your life — and what is it asking for beneath the noise?",
    },
  ],
  relatedGrahaIds: ["ketu", "shani", "chandra"],
  searchKeywords: [
    "rahu",
    "desire",
    "ambition",
    "technology",
    "illusion",
    "eclipse",
    "foreign",
    "obsession",
  ],
};
