import { Dasha, Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";

export type BirthDashaInsight = {
  lord: string;
  nakshatra: string | null;
  yearsRemainingAtBirth: number | null;
  soulTransition: string;
  lifeTheme: string;
  prediction: string;
  healingFocus: string[];
};

export type JupiterKarmaInsight = {
  house: number | null;
  sign: string | null;
  nakshatra: string | null;
  dignity: string | null;
  isRetrograde: boolean;
  pastLifeTheme: string;
  prediction: string;
  guidance: string[];
};

export type KarmicTheme = {
  planet: string;
  house: number | null;
  sign: string | null;
  nakshatra: string | null;
  dignity: string | null;
  isRetrograde: boolean;
  isBirthDashaLord: boolean;
  isChallenged: boolean;
  pastLifeIndication: string;
  prediction: string;
  doThis: string[];
  avoidThis: string[];
  traditionalSource: string;
};

export type PastLifeDeeds = {
  birthDasha: BirthDashaInsight | null;
  jupiterKarma: JupiterKarmaInsight | null;
  themes: KarmicTheme[];
  overallGuidance: string;
  disclaimer: string;
};

const BIRTH_DASHA_THEMES: Record<
  string,
  { soulTransition: string; lifeTheme: string; prediction: string; healingFocus: string[] }
> = {
  Ketu: {
    soulTransition:
      "Ketu at birth suggests a soul crossing over with a strong pull toward detachment and inner knowing. The transition often carries memories of solitude, spiritual practice, or releasing worldly identity.",
    lifeTheme:
      "Spirituality, detachment, intuitive insight, and a quiet desire to share wisdom. Life may repeatedly ask you to simplify, listen inward, and find meaning beyond appearances.",
    prediction:
      "You are likely to grow through phases of withdrawal followed by clarity. When you honor your need for stillness and use your insight to guide others gently, past-life spiritual merit becomes a present-life strength.",
    healingFocus: [
      "Create regular solitude for meditation or contemplation",
      "Share knowledge without needing recognition",
      "Ground spiritual insight in simple daily duties",
    ],
  },
  Venus: {
    soulTransition:
      "Venus at birth points to a soul seeking warmth, connection, beauty, and lived experience. The transition may reflect a desire to embrace relationships and pleasures that were set aside before.",
    lifeTheme:
      "Relationships, values, comfort, creativity, and the lessons of love. Life often teaches balance between enjoyment and integrity in partnership and material choices.",
    prediction:
      "Your growth comes through learning what true value means in love, art, and resources. When affection is paired with respect and gratitude, relationship karma softens and becomes supportive.",
    healingFocus: [
      "Practice gratitude and fairness in relationships",
      "Choose beauty and comfort without overindulgence",
      "Honor commitments with emotional honesty",
    ],
  },
  Sun: {
    soulTransition:
      "Sun at birth indicates a soul carrying themes of leadership, visibility, and responsibility. The transition may echo a life connected to authority, service to a larger order, or the need to express identity with dignity.",
    lifeTheme:
      "Purpose, confidence, father/mentor dynamics, and rightful self-expression. Life asks you to lead with integrity rather than dominance.",
    prediction:
      "You are designed to develop a clear sense of purpose. Recognition follows when you combine courage with humility and use authority to protect, organize, or uplift others.",
    healingFocus: [
      "Build confidence through disciplined self-respect",
      "Honor mentors, father figures, and ethical leadership",
      "Lead by example instead of control",
    ],
  },
  Moon: {
    soulTransition:
      "Moon at birth reflects a soul carrying emotional memory and a strong need for belonging. The transition often emphasizes care, nurture, and the bonds that shape inner security.",
    lifeTheme:
      "Emotions, home, mother/root connections, sensitivity, and public feeling. Life teaches you to protect your heart while staying responsive to others.",
    prediction:
      "Your path unfolds through emotional maturity and trusted connections. When you care for your inner world and create safe bonds, past sensitivity becomes empathy and intuitive strength.",
    healingFocus: [
      "Nurture emotional routines that create safety",
      "Strengthen healthy ties with family and roots",
      "Respond with care without absorbing every mood",
    ],
  },
  Mars: {
    soulTransition:
      "Mars at birth suggests a soul arriving with active, protective, or competitive momentum. The transition may carry memories of struggle, defense, or decisive action under pressure.",
    lifeTheme:
      "Courage, initiative, boundaries, skill, and the right use of force. Life channels your drive toward constructive battles rather than reactive conflict.",
    prediction:
      "You progress when action is disciplined and purposeful. Challenges that once felt like conflict can become training for leadership, protection, and skilled achievement.",
    healingFocus: [
      "Direct energy into skill-building and service",
      "Choose timely action over impulsive reaction",
      "Protect others without creating unnecessary battles",
    ],
  },
  Rahu: {
    soulTransition:
      "Rahu at birth points to a soul entering with unfinished worldly desires and a hunger for new experience. The transition may include themes of ambition, unfamiliar paths, or learning discernment after confusion.",
    lifeTheme:
      "Ambition, innovation, unconventional growth, and material-world learning. Life pushes you beyond comfort zones while asking for ethical clarity.",
    prediction:
      "Your journey can bring rapid change and unusual opportunities. Progress is strongest when ambition is guided by truth, patience, and grounded routines rather than fear or shortcuts.",
    healingFocus: [
      "Verify people and promises before committing",
      "Balance ambition with ethical boundaries",
      "Use routine to stabilize intense desires",
    ],
  },
  Jupiter: {
    soulTransition:
      "Jupiter at birth suggests a soul carrying guidance-oriented karma. The transition often reflects prior learning, teaching, counsel, or service to dharma and wisdom traditions.",
    lifeTheme:
      "Wisdom, faith, mentorship, learning, and ethical expansion. Life invites you to grow through knowledge and to become a reliable guide for others.",
    prediction:
      "You are supported when you live by principles and keep learning. Opportunities expand through teaching, counsel, generosity, and choices aligned with long-term meaning.",
    healingFocus: [
      "Seek wise teachers and keep learning humbly",
      "Share guidance through practical compassion",
      "Align growth with ethics, not only success",
    ],
  },
  Saturn: {
    soulTransition:
      "Saturn at birth indicates a soul arriving with karmic duties and lessons in endurance. The transition may emphasize responsibility, service, time, and the consequences of past commitments.",
    lifeTheme:
      "Discipline, patience, duty, maturity, and service. Life rewards steady effort and asks you to meet obligations with fairness and perseverance.",
    prediction:
      "Progress may feel gradual, but it is durable. As you accept responsibility without resentment and serve with consistency, Saturn turns past burdens into earned stability.",
    healingFocus: [
      "Commit to long-term effort with realistic pacing",
      "Serve elders, workers, and the vulnerable",
      "Meet duties early to reduce pressure later",
    ],
  },
  Mercury: {
    soulTransition:
      "Mercury at birth suggests a soul carrying themes of exchange, learning, and communication. The transition may reflect a life shaped by trade, ideas, negotiation, or the skill of adapting quickly.",
    lifeTheme:
      "Communication, intellect, commerce, curiosity, and problem-solving. Life develops through clear thinking, honest speech, and practical learning.",
    prediction:
      "You advance by connecting people, ideas, and opportunities. When communication stays truthful and skills are used responsibly, past-life versatility becomes present-life success.",
    healingFocus: [
      "Keep speech clear, fair, and truthful",
      "Use learning to solve real problems",
      "Balance analysis with listening and empathy",
    ],
  },
};

const JUPITER_HOUSE_KARMA: Record<
  number,
  { pastLifeTheme: string; prediction: string; guidance: string[] }
> = {
  1: {
    pastLifeTheme:
      "Jupiter in the 1st house suggests past-life merit connected to wisdom, guidance, or ethical self-development. The soul carries an inner teacher quality into this life.",
    prediction:
      "You are likely to be seen as thoughtful or principled. Personal growth comes when you embody your values and let optimism be grounded in action.",
    guidance: [
      "Lead with integrity",
      "Keep learning visible through conduct",
      "Avoid moral rigidity",
    ],
  },
  2: {
    pastLifeTheme:
      "Jupiter in the 2nd house points to past-life blessings related to family lineage, speech, learning, or resources used with a sense of responsibility.",
    prediction:
      "Family knowledge, values, or supportive speech can become assets. Financial and emotional security grows through ethical choices and generous communication.",
    guidance: [
      "Speak with care and truth",
      "Honor family wisdom without carrying old burdens",
      "Use resources responsibly",
    ],
  },
  3: {
    pastLifeTheme:
      "Jupiter in the 3rd house suggests past-life effort in communication, skill, teaching, or courageous initiative. The soul learned through doing and expressing.",
    prediction:
      "Your voice, writing, teaching, or entrepreneurial effort can open doors. Consistent practice matters more than occasional inspiration.",
    guidance: [
      "Build skills steadily",
      "Communicate with purpose",
      "Support siblings or peers through guidance",
    ],
  },
  4: {
    pastLifeTheme:
      "Jupiter in the 4th house reflects past-life karma tied to home, care, education, or emotional shelter. There is often a blessing connected to nurturing environments.",
    prediction:
      "Inner peace and stable foundations support your growth. Home, learning, and emotional maturity become sources of wisdom and protection.",
    guidance: [
      "Create a calm home base",
      "Honor mother/caregivers with gratitude",
      "Invest in education and emotional steadiness",
    ],
  },
  5: {
    pastLifeTheme:
      "Jupiter in the 5th house indicates strong past-life merit (purva punya) connected to learning, children, creativity, counsel, or righteous intelligence.",
    prediction:
      "Insight, teaching ability, and creative judgment can flourish. Good outcomes grow when intelligence is used with humility and care for future generations.",
    guidance: [
      "Share knowledge generously",
      "Guide children or students with patience",
      "Use creativity for constructive aims",
    ],
  },
  6: {
    pastLifeTheme:
      "Jupiter in the 6th house suggests past-life learning through service, conflict resolution, duty, or managing debts and challenges. Wisdom was earned in difficult settings.",
    prediction:
      "You can grow by improving systems, serving others, and handling problems ethically. Health, work routines, and fairness in disputes need mindful attention.",
    guidance: [
      "Serve without self-neglect",
      "Solve conflicts with principle",
      "Build disciplined daily habits",
    ],
  },
  7: {
    pastLifeTheme:
      "Jupiter in the 7th house points to past-life karma involving partnerships, agreements, counsel, or public relationships. The soul learns through one-to-one bonds.",
    prediction:
      "Relationships can become teachers and supporters. Mature partnerships form when expectations are clear, respectful, and guided by shared values.",
    guidance: [
      "Choose partners with aligned ethics",
      "Practice counsel over criticism",
      "Honor commitments and fairness",
    ],
  },
  8: {
    pastLifeTheme:
      "Jupiter in the 8th house suggests past-life engagement with hidden knowledge, transformation, healing, research, or shared resources. The soul carries depth-oriented wisdom.",
    prediction:
      "You may understand change, psychology, or confidential matters more deeply than most. Growth comes through trust, research, and ethical handling of sensitive power.",
    guidance: [
      "Use insight responsibly",
      "Face change with faith and preparation",
      "Seek depth without fear-driven secrecy",
    ],
  },
  9: {
    pastLifeTheme:
      "Jupiter in the 9th house is a strong indicator of past-life dharmic merit, higher learning, pilgrimage, or guidance received from teachers and tradition.",
    prediction:
      "Faith, education, travel, and mentorship can shape your path positively. Fortune improves when beliefs are lived, not only spoken.",
    guidance: [
      "Follow a living dharma",
      "Respect teachers and traditions wisely",
      "Expand through study and ethical travel",
    ],
  },
  10: {
    pastLifeTheme:
      "Jupiter in the 10th house reflects past-life karma connected to duty, leadership, reputation, or service in visible roles. The soul learned about responsibility in public life.",
    prediction:
      "Career growth is supported when work serves a meaningful purpose. Recognition follows ethical leadership, good counsel, and consistent contribution.",
    guidance: [
      "Align career with values",
      "Lead through competence and fairness",
      "Protect reputation with honest action",
    ],
  },
  11: {
    pastLifeTheme:
      "Jupiter in the 11th house suggests past-life blessings through networks, communities, mentors, or collective goals. Gains often came through right association.",
    prediction:
      "Supportive friends, groups, and long-term goals can bring fulfillment. Choose communities that elevate your ethics and aspirations.",
    guidance: [
      "Build purposeful networks",
      "Share gains and guidance",
      "Keep ambitions aligned with dharma",
    ],
  },
  12: {
    pastLifeTheme:
      "Jupiter in the 12th house points to past-life spiritual practice, charity, retreat, or liberation-oriented karma. The soul may carry a quiet connection to moksha themes.",
    prediction:
      "Peace, compassion, and spiritual insight grow through reflection and selfless service. Balance solitude with practical responsibilities to stay grounded.",
    guidance: [
      "Practice charity or seva quietly",
      "Use solitude for renewal, not escape",
      "Protect sleep, boundaries, and spiritual routine",
    ],
  },
};

const PLANET_THEMES: Record<
  string,
  {
    pastLifeIndication: string;
    prediction: string;
    doThis: string[];
    avoidThis: string[];
    traditionalSource: string;
  }
> = {
  Sun: {
    pastLifeIndication:
      "Sun reflects past-life themes of authority, father/mentor bonds, visibility, and self-respect. Its placement can show how the soul learned to carry responsibility and identity.",
    prediction:
      "Your confidence and purpose strengthen when leadership is exercised with humility. Recognition grows through consistent character rather than ego.",
    doThis: [
      "Respect father figures and mentors",
      "Lead with fairness",
      "Keep promises and routines",
    ],
    avoidThis: [
      "Power struggles driven by pride",
      "Ignoring guidance",
      "Seeking validation through control",
    ],
    traditionalSource: "Brihat Parashara Hora Shastra — Surya principles",
  },
  Moon: {
    pastLifeIndication:
      "Moon carries emotional memory, mother/root impressions, and the mind's habitual responses. Its placement often reflects how the soul seeks safety and belonging.",
    prediction:
      "Emotional stability becomes a strength when you honor your sensitivity without being ruled by it. Supportive bonds and steady routines help you flourish.",
    doThis: [
      "Care for emotional wellbeing",
      "Respect mother/caregivers",
      "Create calming daily rhythms",
    ],
    avoidThis: [
      "Emotional withdrawal or overreaction",
      "Neglecting rest",
      "Carrying old family moods unconsciously",
    ],
    traditionalSource: "Brihat Parashara Hora Shastra — Chandra principles",
  },
  Mars: {
    pastLifeIndication:
      "Mars points to past-life courage, conflict, protection, and assertion. Its placement shows where the soul learned to act, defend, or compete.",
    prediction:
      "Your drive brings results when channeled into skill, service, and timely decisions. Constructive challenge becomes progress; reactive anger becomes drain.",
    doThis: [
      "Train your energy through discipline",
      "Act decisively with preparation",
      "Protect what matters fairly",
    ],
    avoidThis: ["Impulsive conflict", "Harsh speech in anger", "Risk-taking without purpose"],
    traditionalSource: "Brihat Parashara Hora Shastra — Kuja principles",
  },
  Mercury: {
    pastLifeIndication:
      "Mercury reflects past-life learning, trade, speech, and mental adaptability. Its placement shows how the soul handled information, promises, and exchange.",
    prediction:
      "Communication and learning open opportunities. Clarity, honesty, and focused study help you turn curiosity into practical success.",
    doThis: [
      "Communicate clearly and truthfully",
      "Keep learning useful skills",
      "Document agreements carefully",
    ],
    avoidThis: [
      "Mixed messages or gossip",
      "Scattered attention",
      "Using cleverness without integrity",
    ],
    traditionalSource: "Brihat Parashara Hora Shastra — Budha principles",
  },
  Jupiter: {
    pastLifeIndication:
      "Jupiter carries dharma, guidance, blessings, and accumulated wisdom. Its placement indicates where past merit or faith-based learning supports this life.",
    prediction:
      "Growth comes through good counsel, ethical choices, and generous knowledge. When you trust wise principles, support appears at the right time.",
    doThis: [
      "Seek and respect wise guidance",
      "Teach or mentor when possible",
      "Practice generosity with discernment",
    ],
    avoidThis: ["Preaching without practice", "Overpromising", "Ignoring practical details"],
    traditionalSource: "Brihat Parashara Hora Shastra — Guru principles",
  },
  Venus: {
    pastLifeIndication:
      "Venus reflects past-life relationship patterns, values, comfort, and aesthetic sensitivity. Its placement shows lessons around love, harmony, and desire.",
    prediction:
      "Relationships and creative pursuits improve through respect, balance, and clear values. Pleasure becomes nourishing when it does not replace integrity.",
    doThis: [
      "Value people over appearances",
      "Keep relationship boundaries healthy",
      "Cultivate art, grace, and gratitude",
    ],
    avoidThis: [
      "People-pleasing or avoidance",
      "Overindulgence",
      "Compromising values for comfort",
    ],
    traditionalSource: "Classical Jyotish — Shukra principles",
  },
  Saturn: {
    pastLifeIndication:
      "Saturn indicates karmic duties, endurance, service, and unfinished responsibilities. Its placement often shows where patience and maturity are being developed.",
    prediction:
      "Progress may be slow, but effort compounds. Reliability, fairness, and service transform pressure into long-term stability.",
    doThis: ["Accept responsibility steadily", "Serve with humility", "Plan for long timelines"],
    avoidThis: ["Resentment toward duty", "Neglecting health or rest", "Delaying necessary work"],
    traditionalSource: "Brihat Parashara Hora Shastra — Shani and karma principles",
  },
  Rahu: {
    pastLifeIndication:
      "Rahu reflects unconventional desires, worldly ambition, and lessons around discernment. Its placement can indicate unfamiliar paths and strong material or social pulls.",
    prediction:
      "Unusual opportunities may arise, especially outside familiar patterns. Success is strongest when curiosity is paired with verification and ethics.",
    doThis: [
      "Question assumptions and verify facts",
      "Use innovation responsibly",
      "Stay grounded during rapid change",
    ],
    avoidThis: [
      "Shortcuts that compromise truth",
      "Obsession with image",
      "Trusting hype without evidence",
    ],
    traditionalSource: "Jyotish tradition — Rahu karma principles",
  },
  Ketu: {
    pastLifeIndication:
      "Ketu reflects spiritual memory, detachment, intuitive skill, and areas where the soul seeks release from over-attachment. Its placement shows subtle past-life mastery.",
    prediction:
      "Insight deepens when you balance detachment with presence. Letting go of unnecessary control opens clarity, healing, and purposeful simplicity.",
    doThis: [
      "Practice reflection or meditation",
      "Simplify what drains attention",
      "Serve quietly without attachment",
    ],
    avoidThis: ["Escapism", "Sudden disengagement", "Dismissing practical needs"],
    traditionalSource: "Jyotish tradition — Ketu moksha principles",
  },
};

const PLANET_ORDER = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

function getTemplate(planet: string) {
  return (
    PLANET_THEMES[planet] || {
      pastLifeIndication:
        "This placement may carry karmic memory connected to the planet's natural themes. Traditional Jyotish reads it through house, sign, dignity, and dasha timing.",
      prediction:
        "Progress comes by working consciously with this planet's themes and choosing dharmic action in the related life area.",
      doThis: ["Act with awareness and consistency", "Seek balanced guidance", "Practice patience"],
      avoidThis: ["Reactive choices", "Ignoring repeated patterns", "Fear-based decisions"],
      traditionalSource: "General Jyotish principles",
    }
  );
}

function dignityNote(dignity: string | null, retrograde: boolean): string {
  const parts: string[] = [];
  if (dignity === "Debilitated")
    parts.push("This placement asks for patience and conscious skill-building.");
  else if (dignity === "Exalted")
    parts.push("This placement can express past merit more easily when used responsibly.");
  else if (dignity === "Own")
    parts.push("This placement often feels familiar and can stabilize with steady effort.");
  if (retrograde)
    parts.push(
      "Retrograde motion suggests inward review and repeated lessons before outward results.",
    );
  return parts.join(" ");
}

function houseFocus(house: number | null): string {
  const map: Record<number, string> = {
    1: "identity, confidence, and life direction",
    2: "family values, speech, and resources",
    3: "courage, communication, and skills",
    4: "home, emotional security, and roots",
    5: "intelligence, creativity, children, and merit",
    6: "service, health routines, and problem-solving",
    7: "partnerships, agreements, and public dealings",
    8: "transformation, trust, and hidden matters",
    9: "dharma, teachers, faith, and higher learning",
    10: "career, responsibility, and reputation",
    11: "goals, networks, and gains",
    12: "rest, release, charity, and spiritual closure",
  };
  return house ? map[house] || "this life area" : "your chart";
}

function isChallengedPlacement(p: {
  dignity?: string | null;
  isRetrograde?: boolean;
  house?: number | null;
}): boolean {
  return Boolean(
    p.dignity === "Debilitated" ||
    p.isRetrograde ||
    (p.house != null && [6, 8, 12].includes(p.house)),
  );
}

export class PastLifeDeedsService {
  async forUser(userId: string): Promise<PastLifeDeeds> {
    await connectMongo();
    const [chart, dasha] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
    ]);
    if (!chart) throw new NotFoundError("Generate kundli first");

    const planets = (chart.planets || []) as Array<{
      planet: string;
      sign: string;
      house: number;
      nakshatra: string;
      dignity: string | null;
      isRetrograde: boolean;
    }>;

    const balance = (dasha?.balanceAtBirth || null) as {
      lord?: string;
      yearsRemaining?: number;
      nakshatra?: string;
    } | null;
    const birthLord = balance?.lord || dasha?.currentMaha || null;
    const birthTemplate = birthLord ? BIRTH_DASHA_THEMES[birthLord] : null;
    const birthDasha: BirthDashaInsight | null = birthLord
      ? {
          lord: birthLord,
          nakshatra: balance?.nakshatra || null,
          yearsRemainingAtBirth:
            typeof balance?.yearsRemaining === "number" ? balance.yearsRemaining : null,
          soulTransition:
            birthTemplate?.soulTransition ||
            "The planetary period active at birth reflects the soul's transition and the karmic theme carried into this life.",
          lifeTheme:
            birthTemplate?.lifeTheme ||
            "This birth dasha sets an important tone for your learning, choices, and life direction.",
          prediction:
            birthTemplate?.prediction ||
            "Use this period's qualities consciously; consistent dharmic action helps past patterns mature into present strengths.",
          healingFocus: birthTemplate?.healingFocus || [
            "Reflect on recurring life themes",
            "Choose remedies and habits that match this planet's nature",
            "Act with patience and self-awareness",
          ],
        }
      : null;

    const jupiter = planets.find((p) => p.planet === "Jupiter") || null;
    const jupiterHouse = jupiter?.house ?? null;
    const jupiterBase = jupiterHouse ? JUPITER_HOUSE_KARMA[jupiterHouse] : null;
    const jupiterKarma: JupiterKarmaInsight | null = jupiter
      ? {
          house: jupiter.house ?? null,
          sign: jupiter.sign ?? null,
          nakshatra: jupiter.nakshatra ?? null,
          dignity: jupiter.dignity ?? null,
          isRetrograde: Boolean(jupiter.isRetrograde),
          pastLifeTheme:
            jupiterBase?.pastLifeTheme ||
            "Jupiter's placement reflects past-life learning connected to wisdom, guidance, faith, and dharma.",
          prediction:
            (jupiterBase?.prediction ||
              "Jupiter supports growth through learning, counsel, and ethical choices.") +
            (jupiter.dignity ? ` ${dignityNote(jupiter.dignity, jupiter.isRetrograde)}` : ""),
          guidance: jupiterBase?.guidance || [
            "Follow wise guidance",
            "Keep learning with humility",
            "Align growth with dharma",
          ],
        }
      : null;

    const themes: KarmicTheme[] = planets
      .filter((p) => p.planet in PLANET_THEMES)
      .map((p) => {
        const template = getTemplate(p.planet);
        const challenged = isChallengedPlacement(p);
        const focus = houseFocus(p.house ?? null);
        const birthLordTheme = p.planet === birthLord;
        const note = dignityNote(p.dignity ?? null, Boolean(p.isRetrograde));
        return {
          planet: p.planet,
          house: p.house ?? null,
          sign: p.sign ?? null,
          nakshatra: p.nakshatra ?? null,
          dignity: p.dignity ?? null,
          isRetrograde: Boolean(p.isRetrograde),
          isBirthDashaLord: birthLordTheme,
          isChallenged: challenged,
          pastLifeIndication:
            template.pastLifeIndication +
            (p.house
              ? ` In this chart it works through the ${p.house}th house, highlighting ${focus}.`
              : "") +
            (birthLordTheme
              ? " As your birth dasha lord, this theme is especially central to your soul journey."
              : ""),
          prediction:
            template.prediction +
            (note ? ` ${note}` : "") +
            (challenged
              ? " This area may bring repeated lessons, but mindful effort can turn pressure into maturity."
              : " This area can support steady growth when approached consciously."),
          doThis: [...template.doThis],
          avoidThis: [...template.avoidThis],
          traditionalSource: template.traditionalSource,
        };
      })
      .sort((a, b) => {
        const score = (t: KarmicTheme) =>
          (t.isBirthDashaLord ? 100 : 0) +
          (t.planet === "Jupiter" ? 40 : 0) +
          (t.isChallenged ? 10 : 0);
        const diff = score(b) - score(a);
        return diff !== 0 ? diff : PLANET_ORDER.indexOf(a.planet) - PLANET_ORDER.indexOf(b.planet);
      });

    const challenged = themes.filter((t) => t.isChallenged);
    const focusParts = [
      birthDasha ? `Birth dasha ${birthDasha.lord} sets your core soul theme` : null,
      jupiterHouse
        ? `Jupiter in the ${jupiterHouse}th house highlights blessings, learning, and dharmic direction`
        : null,
      challenged.length
        ? `${challenged.length} placement${challenged.length > 1 ? "s" : ""} may need extra patience and conscious remedies`
        : "Planetary placements appear broadly supportive when handled with awareness",
    ].filter(Boolean);

    return {
      birthDasha,
      jupiterKarma,
      themes,
      overallGuidance:
        focusParts.join(". ") +
        ". Use these insights as reflective guidance: timing (dasha) shows when themes activate, while your choices shape the outcome.",
      disclaimer:
        "Traditional Jyotish perspective inspired by classical principles. Past-life interpretations are reflective, not factual claims or deterministic predictions. For sensitive decisions, consult a qualified practitioner.",
    };
  }
}

export const pastLifeDeedsService = new PastLifeDeedsService();
