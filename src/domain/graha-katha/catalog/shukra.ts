import { buildHouses } from "@/domain/graha-katha/houses";
import type { GrahaEntity } from "@/domain/graha-katha/types";

export const SHUKRA: GrahaEntity = {
  id: "shukra",
  kind: "graha",
  sanskritName: "शुक्र",
  englishName: "Venus",
  engineName: "Venus",
  archetype: "The Guide of Desire, Love & Refinement",
  essence: "Desire refined into devotion, beauty, and healing.",
  visualConcept: "Shukra asks: What do you love — and how do you love well?",
  deityAssociation: "Shukrāchārya · Bhṛigu lineage · Daitya Guru",
  element: "Water",
  guna: "Rajas / Sattva blend in tradition",
  day: "Friday",
  colour: "White / pastel",
  gemstone: "Diamond (traditional)",
  mantra: "Om Shukraya Namah",
  tags: ["love", "beauty", "relationships", "art", "healing", "pleasure", "matchmaking"],
  accent: "rose",
  metadata: ["Love", "Beauty", "Refinement", "Pleasure", "Healing"],
  introduction:
    "Shukra is traditionally desire made wise — love, aesthetics, partnership, and the arts. As Shukrāchārya, Venus also carries the lore of Mṛtasañjīvanī — revival knowledge — linking pleasure with healing and occult skill in classical story.",
  chapters: [
    {
      id: "who",
      number: 1,
      title: "Who is Shukra?",
      narrative:
        "Shukra is fragrance and form — the taste that makes life worth sharing. He teaches that desire is not the enemy of dharma when refined.",
      symbolizes: "Love, beauty, and the ethics of pleasure.",
      astrologicalConnection:
        "Astrologers may examine Venus for relationships, artistry, comfort, and values around harmony.",
      keyTeaching: "Refine desire; do not deny the heart carelessly.",
    },
    {
      id: "shukracharya",
      number: 2,
      title: "Shukrāchārya of the Bhṛigu Line",
      narrative:
        "As guru of the Daityas, Shukrāchārya stands opposite Bṛhaspati in role — not lesser, but differently tasked: teaching those cast as outsiders the path of power and survival.",
      symbolizes: "Wisdom that works at the edge.",
      astrologicalConnection:
        "Venus–Jupiter comparisons often frame pleasure versus principle — both needed for a whole life.",
    },
    {
      id: "mritsanjeevni",
      number: 3,
      title: "Śiva & Mṛtasañjīvanī Vidyā",
      narrative:
        "Legend tells that Shukra obtained the knowledge to restore life through fierce tapas and Śiva’s grace. The teaching: love’s deepest magic is restorative, not merely decorative.",
      symbolizes: "Healing as the highest art of desire.",
      astrologicalConnection:
        "Traditional notes sometimes link Venus with healing arts and subtle knowledge — interpretive symbolism.",
    },
    {
      id: "relationships",
      number: 4,
      title: "Shukra & Relationships",
      narrative:
        "On VedaMilan, Venus is a natural bridge between Jyotisha and matchmaking: how we seek beauty, fairness, and pleasure in partnership.",
      symbolizes: "Compatibility as shared aesthetic and ethical taste.",
      astrologicalConnection:
        "Explore Venus in houses and with the 7th for relationship symbolism — never as a sole marriage verdict.",
    },
  ],
  nature: {
    coreNature: "Shukra is the graha of refined desire, harmony, and creative pleasure.",
    represents: [
      "Love and partnership",
      "Beauty and the arts",
      "Luxury and comfort",
      "Taste and refinement",
      "Healing / occult arts (traditional story)",
      "Vehicles and sensory joy",
    ],
    innerLesson: "Let love elevate both people, not only the mood.",
    whenStrong:
      "Traditionally associated with charm, artistic gift, harmonious bonds, and graceful living.",
    whenChallenged:
      "May be interpreted as overindulgence, vanity, or relationship imbalance — invitations to refine taste and boundaries.",
    lifeDomains: {
      career: "Arts, design, diplomacy, beauty industries.",
      relationships: "Primary — romance, marriage symbolism, fairness in love.",
      family: "Harmony at home; aesthetic care.",
      mind: "Taste, preference, attraction patterns.",
      health: "Traditional reproductive/kidney metaphors — not medical claims.",
      spirituality: "Bhakti through beauty; sacred aesthetics.",
      wealth: "Comfort assets; spending on pleasure with wisdom.",
    },
  },
  houses: buildHouses([
    {
      traditional: "Venus in the 1st may indicate charm and aesthetic self-presentation.",
      lifeExpression: "Identity seeks harmony and attractiveness of character.",
      possibleLesson: "Beauty of conduct outlasts beauty of appearance.",
      reflection: "How do you make others feel more beautiful in themselves?",
    },
    {
      traditional: "In the 2nd, speech may be sweet; family pleasures and wealth taste refine.",
      lifeExpression: "Values include comfort and artful living.",
      possibleLesson: "Enjoy without depleting.",
      reflection: "What spending truly increases love?",
    },
    {
      traditional: "In the 3rd, creative skill and charming communication grow.",
      lifeExpression: "Art, media, siblings with aesthetic bonds.",
      possibleLesson: "Practice the craft of delight.",
      reflection: "Which skill makes life more graceful?",
    },
    {
      traditional: "In the 4th, home becomes a temple of comfort and beauty.",
      lifeExpression: "Emotional peace through harmonious space.",
      possibleLesson: "Create sanctuary, not showroom only.",
      reflection: "Does your home soothe or perform?",
    },
    {
      traditional: "In the 5th, romance and creative joy are classically highlighted.",
      lifeExpression: "Love affairs of art and heart.",
      possibleLesson: "Play is sacred when consensual and kind.",
      reflection: "Where has joy become duty — and how restore play?",
    },
    {
      traditional: "In the 6th, service and daily craft can be aesthetic disciplines.",
      lifeExpression: "Harmony through healthy routines (lifestyle framing).",
      possibleLesson: "Beauty includes how you treat small tasks.",
      reflection: "Can care itself become an art?",
    },
    {
      traditional: "In the 7th, Venus is often central — partnership and marriage symbolism.",
      lifeExpression: "Relating as primary path of refinement.",
      possibleLesson: "Equality sweetens desire.",
      reflection: "What does fair love look like in practice?",
    },
    {
      traditional: "In the 8th, intimacy deepens; shared resources and mystery in love.",
      lifeExpression: "Transformative bonding; healing through trust.",
      possibleLesson: "Vulnerability is a form of beauty.",
      reflection: "Where can intimacy become safer and truer?",
    },
    {
      traditional: "In the 9th, love of wisdom, travel, and refined faith expand.",
      lifeExpression: "Aesthetic spirituality; teachers of beauty.",
      possibleLesson: "Desire can serve dharma.",
      reflection: "Which higher value guides your attractions?",
    },
    {
      traditional: "In the 10th, career may involve art, diplomacy, or public grace.",
      lifeExpression: "Reputation for taste and relational skill.",
      possibleLesson: "Professional charm with substance.",
      reflection: "How does your work create harmony?",
    },
    {
      traditional: "In the 11th, friendships and gains through pleasant alliances.",
      lifeExpression: "Social grace multiplies opportunity.",
      possibleLesson: "Network with sincerity.",
      reflection: "Which friendships feel like mutual beauty?",
    },
    {
      traditional:
        "In the 12th, private love, foreign aesthetics, or spiritual surrender of desire.",
      lifeExpression: "Hidden pleasures; sacred longing.",
      possibleLesson: "Release clinging; keep devotion.",
      reflection: "What attachment is ready to soften into offering?",
    },
  ]),
  remedies: [
    {
      id: "fairness",
      title: "Fairness in love",
      body: "Traditional Venusian remedy is ethical relating — beauty of conduct, keeping promises, and refining sensory habits without cruelty to self or other.",
      kind: "discipline",
    },
    {
      id: "art",
      title: "Create beauty",
      body: "Music, fragrance, clean spaces, and generous aesthetic care are classic Venus allies.",
      kind: "lifestyle",
    },
  ],
  reflections: [
    { id: "love", prompt: "What do you love — and how do you love well?" },
    { id: "refine", prompt: "Where could desire become more refined and mutual?" },
  ],
  relatedGrahaIds: ["guru", "chandra", "mangal"],
  searchKeywords: [
    "venus",
    "shukra",
    "love",
    "marriage",
    "beauty",
    "relationships",
    "art",
    "shukracharya",
    "compatibility",
  ],
  specialSections: [
    {
      id: "shukra-relationships",
      label: "interpretive",
      title: "Shukra & Relationships",
      body: "On VedaMilan, explore Venus alongside the 7th house and compatibility tools. Venus symbolism can illuminate taste in partnership — it does not alone decide marriage outcomes. Use chart data from the engine, then reflect with traditional frameworks.",
    },
  ],
};
