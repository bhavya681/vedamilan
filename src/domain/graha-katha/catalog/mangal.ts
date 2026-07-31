import { buildHouses } from "@/domain/graha-katha/houses";
import type { GrahaEntity } from "@/domain/graha-katha/types";

export const MANGAL: GrahaEntity = {
  id: "mangal",
  kind: "graha",
  sanskritName: "मंगल",
  englishName: "Mars",
  engineName: "Mars",
  archetype: "The Warrior & Willpower",
  essence: "Courage with conscience — action that protects life.",
  visualConcept: "Mangal asks: What is worth your courage?",
  deityAssociation:
    "Bhūmi Putra · Senāpati · Hanumān / Kāla Bhairava associations in some traditions",
  element: "Fire",
  guna: "Tamas (active force)",
  day: "Tuesday",
  colour: "Red",
  gemstone: "Red coral (traditional)",
  mantra: "Om Angarakaya Namah",
  tags: ["courage", "action", "will", "siblings", "land", "crisis"],
  accent: "saffron",
  metadata: ["Warrior", "Willpower", "Stamina", "Initiative", "Protection"],
  introduction:
    "Mangal is traditionally the warrior graha — courage, drive, and the capacity to act under pressure. Classical symbolism links Mars with land (Bhūmi Putra), blood vitality, and ancestral themes of protection — never as medical diagnosis.",
  chapters: [
    {
      id: "who",
      number: 1,
      title: "Who is Mangal?",
      narrative:
        "Mangal is the commander — Senāpati of the planetary court. His gift is decisive movement; his shadow is conflict without purpose.",
      symbolizes: "Will, heat, and the blade that can protect or wound.",
      astrologicalConnection:
        "Astrologers may look to Mars for initiative, siblings, land, and how anger or courage is expressed.",
      keyTeaching: "Strength without dharma becomes destruction.",
    },
    {
      id: "bhumi",
      number: 2,
      title: "Bhūmi Putra — Child of Earth",
      narrative:
        "As son of the Earth, Mangal is linked with soil, property, and physical rootedness. The warrior’s first duty is to protect the ground that feeds life.",
      symbolizes: "Embodied courage and stewardship of place.",
      astrologicalConnection:
        "Traditional readings may connect Mars with real estate, engineering, and physical disciplines — interpretive domains, not guarantees.",
    },
    {
      id: "ancestors",
      number: 3,
      title: "Ancestral Fire",
      narrative:
        "Some lineages speak of Mars as carrying ancestral heat — the unfinished courage or conflict of those who came before.",
      symbolizes: "Inherited patterns of fight-or-flight refined into conscious action.",
      astrologicalConnection:
        "Frame ancestral karma as spiritual metaphor; it does not determine destiny alone.",
    },
    {
      id: "in-chart",
      number: 4,
      title: "Mangal in Your Chart",
      narrative:
        "Where Mars sits, life may ask for clean force — action that is brave, precise, and protective.",
      symbolizes: "A training ground for willpower.",
      astrologicalConnection:
        "House and aspects matter greatly; Mars is never read as pure ‘good’ or ‘bad’ in isolation.",
    },
  ],
  nature: {
    coreNature: "Mangal is the graha of assertive life-force and purposeful action.",
    represents: [
      "Courage and willpower",
      "Physical stamina and drive",
      "Crisis response",
      "Land and engineering themes",
      "Siblings and initiative",
      "Heat of passion and conflict",
    ],
    innerLesson: "Fight for what protects life — not for ego victory.",
    whenStrong:
      "Traditionally associated with bravery, athletic discipline, decisive leadership, and protective instinct.",
    whenChallenged:
      "May be interpreted as impulsiveness, anger, accidents of haste, or restless conflict — invitations to channel heat into craft.",
    lifeDomains: {
      career: "Competition, tech/engineering, defense, surgery symbolism (interpretive).",
      relationships: "Passion, friction, and the need for respectful boundaries.",
      family: "Sibling dynamics; protective roles.",
      mind: "Sharp focus; irritability when blocked.",
      health: "Traditionally blood/muscle heat — never medical advice.",
      spirituality: "Warrior devotion (e.g. Hanumān bhakti in some paths).",
      wealth: "Gains through effort and risk managed wisely.",
    },
  },
  houses: buildHouses([
    {
      traditional: "Mars in the 1st may indicate a forceful personality and high drive.",
      lifeExpression: "Identity expressed through action and assertion.",
      possibleLesson: "Temper heat with aim.",
      reflection: "When do you act from courage — and when from agitation?",
    },
    {
      traditional: "In the 2nd, speech may be sharp; family resources involve effort.",
      lifeExpression: "Voice becomes a tool of defense or clarity.",
      possibleLesson: "Words can be weapons — choose wisely.",
      reflection: "Is your speech building or burning?",
    },
    {
      traditional: "In the 3rd, courage and skill are classically strengthened.",
      lifeExpression: "Initiative, writing, or siblings carry martial themes.",
      possibleLesson: "Practice makes bravery reliable.",
      reflection: "What skill deserves warrior-level dedication?",
    },
    {
      traditional: "In the 4th, home peace may be hard-won; land themes can appear.",
      lifeExpression: "Emotional security through protecting one’s base.",
      possibleLesson: "Make home a sanctuary, not a battlefield.",
      reflection: "Where do you need gentleness inside your own walls?",
    },
    {
      traditional: "In the 5th, creative fire and romantic passion may run high.",
      lifeExpression: "Intelligence becomes competitive or pioneering.",
      possibleLesson: "Create, don’t conquer people.",
      reflection: "How can passion serve play rather than pride?",
    },
    {
      traditional: "In the 6th, Mars often relates to defeating obstacles through effort.",
      lifeExpression: "Service, health routines, and contests refine the fighter.",
      possibleLesson: "Discipline turns aggression into medicine for laziness.",
      reflection: "Which obstacle requires strategy more than force?",
    },
    {
      traditional: "In the 7th, partnership may be intense; relating asks for fair fight rules.",
      lifeExpression: "Attraction and conflict can coexist.",
      possibleLesson: "Argue for understanding, not victory.",
      reflection: "Can you be strong without making love a contest?",
    },
    {
      traditional: "In the 8th, crisis courage and transformative heat may deepen.",
      lifeExpression: "Shared resources and secrets demand integrity under pressure.",
      possibleLesson: "Bravery includes facing the shadow.",
      reflection: "What fear becomes fuel when faced cleanly?",
    },
    {
      traditional: "In the 9th, conviction and dharmic fight for belief may arise.",
      lifeExpression: "Teachers and travel can involve bold quests.",
      possibleLesson: "Defend truth without becoming a zealot.",
      reflection: "Which principle is worth your courage?",
    },
    {
      traditional: "In the 10th, career may involve leadership through decisive action.",
      lifeExpression: "Public role as commander or builder.",
      possibleLesson: "Authority is protection of the mission.",
      reflection: "Where should you act — and where wait?",
    },
    {
      traditional: "In the 11th, goals and alliances may be pursued with force.",
      lifeExpression: "Networks become campaigns for aspiration.",
      possibleLesson: "Win allies, not only battles.",
      reflection: "Which friends sharpen your aim ethically?",
    },
    {
      traditional: "In the 12th, energy may turn toward solitude, foreign fields, or inner war.",
      lifeExpression: "Hidden battles; spiritual warrior path.",
      possibleLesson: "Conquer the inner enemy first.",
      reflection: "What private struggle needs compassionate discipline?",
    },
  ]),
  remedies: [
    {
      id: "physical",
      title: "Physical discipline",
      body: "Traditional guidance often includes disciplined exercise, martial arts, or service that channels heat constructively — not as medical treatment.",
      kind: "lifestyle",
    },
    {
      id: "hanuman",
      title: "Devotional courage",
      body: "Where supported by personal faith, Hanumān or Kāla Bhairava upāsanā is framed as cultivating protective courage and humility.",
      kind: "offering",
    },
  ],
  reflections: [
    { id: "courage", prompt: "What is worth your courage this season?" },
    { id: "anger", prompt: "Where can anger become clean boundary instead of harm?" },
  ],
  relatedGrahaIds: ["surya", "shukra", "ketu"],
  searchKeywords: ["mars", "mangal", "courage", "warrior", "land", "siblings", "anger", "action"],
};
