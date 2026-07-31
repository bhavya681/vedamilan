import { buildHouses } from "@/domain/graha-katha/houses";
import type { GrahaEntity } from "@/domain/graha-katha/types";

export const CHANDRA: GrahaEntity = {
  id: "chandra",
  kind: "graha",
  sanskritName: "चन्द्र",
  englishName: "Moon",
  engineName: "Moon",
  archetype: "The Mind & Emotional World",
  essence: "Feel fully — then choose what nourishes.",
  visualConcept: "Your Emotional Landscape — tides of mind under moonlight.",
  deityAssociation: "Soma · Moon with Śiva’s crest in many tellings",
  element: "Water",
  guna: "Sattva",
  day: "Monday",
  colour: "White / silver",
  gemstone: "Pearl (traditional)",
  mantra: "Om Chandraya Namah",
  tags: ["mind", "emotions", "mother", "nakshatra", "nourishment", "security"],
  accent: "ivory",
  metadata: ["Mind", "Mother", "Emotions", "Imagination", "Nourishment"],
  introduction:
    "Chandra is traditionally the mind (Manas) — feeling, memory, and the need for emotional security. The Moon’s journey through the 27 nakshatras is a core map of Vedic timing and temperament.",
  chapters: [
    {
      id: "who",
      number: 1,
      title: "Who is Chandra?",
      narrative:
        "Chandra is the night’s soft light — changing face, faithful cycle. He is the ocean of feeling that makes human life tender and creative.",
      symbolizes: "Mind, mood, and the capacity to receive.",
      astrologicalConnection:
        "Astrologers often begin with the Moon for emotional nature, mother-themes, and day-to-day mind.",
      keyTeaching: "What you nourish, grows.",
    },
    {
      id: "manthan",
      number: 2,
      title: "Samudra Manthan — The Ocean Churned",
      narrative:
        "In the great churning of the ocean, nectar and poison both rise. The Moon’s lore is woven with that paradox: beauty and disturbance emerge from the same deep.",
      symbolizes: "Mind as ocean — treasures and turbulence together.",
      astrologicalConnection:
        "Emotional life may contain both amṛta and toxin; discernment is the skill.",
    },
    {
      id: "shiva",
      number: 3,
      title: "Moon & Śiva",
      narrative:
        "Śiva wears the crescent — cooling the fierce, blessing the night. The teaching: consciousness can hold emotion without being burned by it.",
      symbolizes: "Calm awareness crowning the flux of feeling.",
      astrologicalConnection:
        "A stable Moon is traditionally prized; practices that cool and ground the mind are culturally linked to lunar care.",
    },
    {
      id: "rohini",
      number: 4,
      title: "Rohini & the 27 Nakshatras",
      narrative:
        "Stories of Chandra’s love for Rohiṇī among the nakshatras speak to preference, longing, and the mind’s favorite resting place among the stars.",
      symbolizes: "Attachment patterns and where the heart feels most at home.",
      astrologicalConnection:
        "Nakshatra of the Moon is a primary interpretive key in many Vedic systems.",
    },
    {
      id: "tara",
      number: 5,
      title: "Moon, Tārā & Budha",
      narrative:
        "The tale involving Tārā and the birth of Budha (Mercury) is a sensitive myth about desire, consequence, and intelligence born of complexity — told here as story, not moral panic.",
      symbolizes: "How emotion and intellect intertwine across generations of meaning.",
      astrologicalConnection:
        "Moon–Mercury relationships in a chart may be read for mind–speech harmony or restlessness.",
    },
  ],
  nature: {
    coreNature: "Chandra is the graha of mind, feeling, and nourishment.",
    represents: [
      "Manas — the emotional mind",
      "Mother and caregiving",
      "Imagination and memory",
      "Public mood and popularity (traditional)",
      "Need for safety and belonging",
      "Cycles and changeability",
    ],
    innerLesson: "Tend the inner climate as carefully as you tend a garden.",
    whenStrong:
      "Traditionally associated with empathy, adaptability, creative imagination, and emotional resilience.",
    whenChallenged:
      "May be interpreted as mood swings, insecurity, or over-absorption in others’ feelings — invitations to boundary and rest.",
    lifeDomains: {
      career: "Public dealing, care roles, design, hospitality themes.",
      relationships: "Nurture, neediness, and emotional attunement.",
      family: "Mother-line; creating safe belonging.",
      mind: "Primary domain — thought colored by feeling.",
      health: "Traditionally fluids/mind rest — interpretive only.",
      spirituality: "Bhakti, mantra, lunar observances.",
      wealth: "Comfort resources; fluctuating cash flow symbolism.",
    },
  },
  houses: buildHouses([
    {
      traditional: "Moon in the 1st may indicate a responsive, changeable personal presence.",
      lifeExpression: "Identity moves with mood and environment.",
      possibleLesson: "Self-care is identity care.",
      reflection: "What does your body need when your mind is stormy?",
    },
    {
      traditional: "In the 2nd, speech and family nourishment themes may be lunar.",
      lifeExpression: "Voice carries feeling; food and money as comfort.",
      possibleLesson: "Nourish without numbing.",
      reflection: "What truly feeds you versus what only soothes briefly?",
    },
    {
      traditional: "In the 3rd, curiosity and communication may be emotionally driven.",
      lifeExpression: "Siblings and short journeys color the mind.",
      possibleLesson: "Courage includes asking for support.",
      reflection: "Which conversations restore you?",
    },
    {
      traditional: "In the 4th, Moon is classically comfortable — home and mother themes deepen.",
      lifeExpression: "Emotional security is central to life strategy.",
      possibleLesson: "Build a home that holds you.",
      reflection: "Where do you feel most allowed to rest?",
    },
    {
      traditional: "In the 5th, creativity and romance may be highly feeling-led.",
      lifeExpression: "Play, children, and art as emotional expression.",
      possibleLesson: "Joy is a practice of presence.",
      reflection: "What creative act would soothe your heart?",
    },
    {
      traditional: "In the 6th, daily duty and health routines shape mental peace.",
      lifeExpression: "Service may heal anxiety when structured.",
      possibleLesson: "Small rituals stabilize big feelings.",
      reflection: "Which habit protects your calm?",
    },
    {
      traditional: "In the 7th, partnership becomes a primary emotional mirror.",
      lifeExpression: "Relating needs attunement and safety.",
      possibleLesson: "Choose bonds that regulate, not only excite.",
      reflection: "Do you feel seen — or managed — in love?",
    },
    {
      traditional: "In the 8th, emotional depth and transformative feelings intensify.",
      lifeExpression: "Intimacy and shared vulnerability matter greatly.",
      possibleLesson: "Depth without drowning.",
      reflection: "What emotion are you ready to feel without fleeing?",
    },
    {
      traditional: "In the 9th, faith and teachers nourish the mind.",
      lifeExpression: "Belief systems become emotional homes.",
      possibleLesson: "Seek teachings that comfort without delusion.",
      reflection: "Which worldview helps you feel held by meaning?",
    },
    {
      traditional: "In the 10th, public life and career may be emotionally visible.",
      lifeExpression: "Reputation linked to care or public mood.",
      possibleLesson: "Lead with emotional intelligence.",
      reflection: "How do you want people to feel in your presence at work?",
    },
    {
      traditional: "In the 11th, friends and aspirations feed belonging.",
      lifeExpression: "Community as emotional ecosystem.",
      possibleLesson: "Choose circles that hydrate the soul.",
      reflection: "Who helps your nervous system settle?",
    },
    {
      traditional: "In the 12th, solitude, dreams, and spiritual feeling deepen.",
      lifeExpression: "Private emotional worlds; need for retreat.",
      possibleLesson: "Rest is sacred.",
      reflection: "What must you release to sleep in peace?",
    },
  ]),
  remedies: [
    {
      id: "routine",
      title: "Gentle routine",
      body: "Regular sleep, hydration, and soothing evening rituals are traditional mind-care — lifestyle wisdom, not clinical treatment.",
      kind: "lifestyle",
    },
    {
      id: "mother",
      title: "Honor mother / caregivers",
      body: "Many traditions link lunar peace with gratitude and care toward mother figures and the Earth herself.",
      kind: "service",
    },
  ],
  reflections: [
    {
      id: "landscape",
      prompt: "If your mind were a landscape tonight, what weather is moving through?",
    },
    { id: "nourish", prompt: "What nourishes you that you have been postponing?" },
  ],
  relatedGrahaIds: ["budha", "shukra", "rahu"],
  searchKeywords: [
    "moon",
    "chandra",
    "mind",
    "emotions",
    "mother",
    "nakshatra",
    "rohini",
    "security",
  ],
  specialSections: [
    {
      id: "emotional-landscape",
      label: "reflection",
      title: "Your Emotional Landscape",
      body: "Use the house explorer and your chart panel together: the Moon’s house suggests where feelings gather; your lived experience is the true weather report.",
    },
  ],
};
