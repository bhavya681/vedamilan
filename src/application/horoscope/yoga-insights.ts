import {
  exemplarForDosha,
  exemplarForYoga,
  type YogaExemplar,
} from "@/application/horoscope/yoga-exemplars";

export type YogaInsight = {
  meaning: string;
  whenActivates: string;
  watchFor: string;
  lifeAreas: string[];
};

const BY_CODE: Record<string, YogaInsight> = {
  RAJA_YOGA: {
    meaning:
      "A Raja Yoga forms when kendra (angular) and trikona (trinal) lords associate through conjunction, mutual aspect, exchange (parivartana), or kendra-trikona placement — classically linked with recognition, authority, and outer achievement.",
    whenActivates:
      "Often more noticeable when the yoga-forming planets' Mahadasha or Antardasha runs, or when Gochar of those lords activates the yoga houses.",
    watchFor:
      "Career visibility, leadership invitations, and public responsibility — results still depend on overall chart strength and current dasha.",
    lifeAreas: ["Career", "Status", "Leadership"],
  },
  DHARMA_KARMADHIPATI: {
    meaning:
      "Dharma-Karmadhipati Yoga forms when the 9th lord (dharma, fortune) and 10th lord (karma, profession) associate through conjunction, mutual aspect, exchange, or kendra-trikona relationship — connecting life purpose with vocation.",
    whenActivates:
      "When either the 9th or 10th lord's period runs, or when Gochar connects the 9th/10th axis.",
    watchFor:
      "Meaningful work, mentors, and duty that feels aligned with values — profession becomes an expression of dharma.",
    lifeAreas: ["Career", "Dharma", "Fortune"],
  },
  GAJAKESARI: {
    meaning:
      "Gajakesari Yoga arises when Jupiter occupies a kendra (1, 4, 7, 10) from the Moon — traditionally linked with wisdom, prosperity, and dignified speech. Strength increases with close degree conjunction.",
    whenActivates:
      "Stronger during Jupiter or Moon periods, and when transit Jupiter supports the Moon or the yoga house.",
    watchFor: "Learning, counsel, reputation, and steady material growth themes.",
    lifeAreas: ["Wealth", "Wisdom", "Reputation"],
  },
  BUDHADITYA: {
    meaning:
      "Budhaditya Yoga is Sun–Mercury conjunction — intellect, communication, and analytical skill themes. Best when Mercury is not combust (within 14° of Sun).",
    whenActivates:
      "Often highlighted in Sun or Mercury dasha/antardasha, and during Mercury/Sun transits over the yoga sign.",
    watchFor: "Writing, study, business communication, and decision clarity.",
    lifeAreas: ["Career", "Intellect", "Communication"],
  },
  CHANDRA_MANGAL: {
    meaning:
      "Chandra-Mangal Yoga forms when Moon and Mars associate through conjunction, mutual aspect, or kendra-trikona relationship — classically supports wealth acquisition, entrepreneurship, and material success.",
    whenActivates:
      "During Moon or Mars periods, and when transits activate the Moon-Mars axis.",
    watchFor: "Wealth opportunities, property gains, entrepreneurial ventures, and material resource growth.",
    lifeAreas: ["Wealth", "Property", "Enterprise"],
  },
  NEECHA_BHANGA: {
    meaning:
      "Neecha Bhanga Raja Yoga occurs when a planet's debilitation is cancelled by specific classical conditions: the debilitated planet's sign lord or exaltation lord in Kendra from Lagna/Moon, conjunction with an exalted planet, or the debilitated planet itself in Kendra. The debilitation transforms into a Raja Yoga giving exceptional results.",
    whenActivates:
      "Most powerful during the debilitated planet's Mahadasha/Antardasha, especially when supported by the cancelling planet's periods.",
    watchFor:
      "Unexpected rise, reversal of fortunes, and exceptional achievements during the debilitated planet's dasha — what seemed weak becomes a source of strength.",
    lifeAreas: ["Career", "Transformation", "Unexpected Success"],
  },
  HARSHA: {
    meaning:
      "Harsha Yoga (a Vipareeta Raja Yoga) forms when the 6th lord is placed in the 6th, 8th, or 12th house — transforming obstacles, enemies, and debts into victory, healing, and unexpected gains.",
    whenActivates:
      "During the 6th lord's periods, and when transits activate the 6th/8th/12th houses.",
    watchFor:
      "Victory over competitors, recovery from illness, resolution of debts, and success through overcoming challenges.",
    lifeAreas: ["Health", "Enemies", "Obstacles", "Victory"],
  },
  SARALA: {
    meaning:
      "Sarala Yoga (a Vipareeta Raja Yoga) forms when the 8th lord is placed in the 6th, 8th, or 12th house — transforming sudden changes, longevity issues, and hidden matters into longevity, inheritance, and deep transformation.",
    whenActivates:
      "During the 8th lord's periods, and during major transit cycles involving the 8th house.",
    watchFor:
      "Unexpected inheritances, deep psychological transformation, longevity, and gains through research/occult.",
    lifeAreas: ["Longevity", "Inheritance", "Transformation", "Research"],
  },
  VIMALA: {
    meaning:
      "Vimala Yoga (a Vipareeta Raja Yoga) forms when the 12th lord is placed in the 6th, 8th, or 12th house — transforming losses, expenses, and isolation into spiritual growth, foreign gains, and liberation from debts.",
    whenActivates:
      "During the 12th lord's periods, and during 12th house transits.",
    watchFor:
      "Foreign connections, spiritual progress, charitable gains, hospital/healing work, and liberation from past karmas.",
    lifeAreas: ["Spirituality", "Foreign", "Charity", "Liberation"],
  },
  RUCHAKA: {
    meaning:
      "Ruchaka Yoga (Pancha Mahapurusha) forms when Mars is in its own sign (Aries/Scorpio) or exalted (Capricorn) AND in a Kendra house (1, 4, 7, 10) — bestows courage, leadership, victory in competition, and physical prowess.",
    whenActivates:
      "During Mars Mahadasha/Antardasha, and when Mars transits angular houses.",
    watchFor:
      "Leadership roles, athletic achievement, military/defense success, surgical/technical skill, and courage under pressure.",
    lifeAreas: ["Courage", "Leadership", "Sports", "Defense"],
  },
  BHADRA: {
    meaning:
      "Bhadra Yoga (Pancha Mahapurusha) forms when Mercury is in its own sign (Gemini/Virgo) or exalted (Virgo) AND in a Kendra house — bestows intelligence, communication mastery, commercial success, and analytical brilliance.",
    whenActivates:
      "During Mercury periods, and when Mercury transits angular houses.",
    watchFor:
      "Business success, writing/speaking careers, trading, teaching, and intellectual achievements.",
    lifeAreas: ["Intellect", "Commerce", "Communication", "Education"],
  },
  HAMSA: {
    meaning:
      "Hamsa Yoga (Pancha Mahapurusha) forms when Jupiter is in its own sign (Sagittarius/Pisces) or exalted (Cancer) AND in a Kendra house — bestows wisdom, spirituality, prosperity, righteous living, and respected counsel.",
    whenActivates:
      "During Jupiter periods, and when Jupiter transits angular houses.",
    watchFor:
      "Spiritual leadership, teaching/counseling roles, judicial/legal success, and prosperity through dharma.",
    lifeAreas: ["Wisdom", "Spirituality", "Prosperity", "Counsel"],
  },
  MALAVYA: {
    meaning:
      "Malavya Yoga (Pancha Mahapurusha) forms when Venus is in its own sign (Taurus/Libra) or exalted (Pisces) AND in a Kendra house — bestows luxury, beauty, artistic talent, harmonious relationships, and enjoyment of comforts.",
    whenActivates:
      "During Venus periods, and when Venus transits angular houses.",
    watchFor:
      "Artistic success, luxury lifestyle, harmonious marriage, creative professions, and aesthetic achievements.",
    lifeAreas: ["Luxury", "Arts", "Relationships", "Beauty"],
  },
  SHASHA: {
    meaning:
      "Shasha Yoga (Pancha Mahapurusha) forms when Saturn is in its own sign (Capricorn/Aquarius) or exalted (Libra) AND in a Kendra house — bestows discipline, longevity, authority through hard work, spiritual detachment, and mastery over time.",
    whenActivates:
      "During Saturn periods (especially Sade Sati and Saturn return), and when Saturn transits angular houses.",
    watchFor:
      "Long-term career building, administrative authority, spiritual discipline, real estate/mining, and karmic resolution.",
    lifeAreas: ["Discipline", "Authority", "Longevity", "Karma"],
  },
  DHANA_YOGA: {
    meaning:
      "Dhana Yoga forms when lords of wealth houses (2nd, 5th, 9th, 11th) associate through conjunction, mutual aspect, exchange, or kendra-trikona relationship — indicating wealth accumulation, financial gains, and resource acquisition through multiple channels.",
    whenActivates:
      "During the periods of the wealth-house lords involved, and during Jupiter/Venus transits over wealth houses.",
    watchFor:
      "Income growth, investments, inheritance, business profits, and multiple income streams.",
    lifeAreas: ["Wealth", "Income", "Investments", "Resources"],
  },
  ADHI: {
    meaning:
      "Adhi Yoga forms when benefic planets (Jupiter, Venus, Mercury) occupy the 6th, 7th, and 8th houses from the Moon — traditionally gives leadership, prosperity, comfort, and king-like status.",
    whenActivates:
      "During the periods of the benefics involved, and when Jupiter/Venus transits support the Moon.",
    watchFor:
      "Leadership opportunities, prosperity, comfort, high social standing, and protection from adversity.",
    lifeAreas: ["Leadership", "Prosperity", "Comfort", "Status"],
  },
  SUNAPHA: {
    meaning:
      "Sunapha Yoga forms when a planet (other than Sun, Rahu, Ketu) occupies the 2nd house from the Moon — gives self-earned wealth, good speech, happiness, and comfortable life through one's own efforts.",
    whenActivates:
      "During the planet's periods, and when transits activate the 2nd from Moon.",
    watchFor:
      "Self-earned wealth, good communication, happiness from personal efforts, and steady income.",
    lifeAreas: ["Wealth", "Speech", "Happiness", "Self-effort"],
  },
  ANAPHA: {
    meaning:
      "Anapha Yoga forms when a planet (other than Sun, Rahu, Ketu) occupies the 12th house from the Moon — gives wealth, good reputation, material comforts, and peaceful life.",
    whenActivates:
      "During the planet's periods, and when transits activate the 12th from Moon.",
    watchFor:
      "Wealth, reputation, comforts, peaceful life, and gains through foreign or distant sources.",
    lifeAreas: ["Wealth", "Reputation", "Comforts", "Peace"],
  },
  DURUDHARA: {
    meaning:
      "Durudhara Yoga forms when planets occupy both the 2nd and 12th houses from the Moon — combines Sunapha and Anapha, giving great wealth, enjoyment, high status, and comfort.",
    whenActivates:
      "During the periods of the involved planets, and when transits activate both sides of the Moon.",
    watchFor:
      "Great wealth, high status, enjoyment of life, and all-round prosperity.",
    lifeAreas: ["Wealth", "Enjoyment", "Status", "Comfort"],
  },
  KEMADRUMA: {
    meaning:
      "Kemadruma Yoga forms when no planet (except Sun, Rahu, Ketu) occupies the 2nd or 12th from Moon, and no planet conjuncts Moon. This can indicate struggles, loneliness, and financial difficulty — but many cancellation factors exist.",
    whenActivates:
      "Most felt during Moon periods and when Moon is afflicted by transits. Cancellations can transform it entirely.",
    watchFor:
      "Check for cancellations: Moon in Kendra, Moon in own/exalted sign, benefic aspect on Moon, Jupiter/Venus in Kendra from Moon. If cancelled, it becomes a strength.",
    lifeAreas: ["Struggles", "Isolation", "Financial Challenges"],
  },
  VASI: {
    meaning:
      "Vasi Yoga forms when a planet (other than Moon, Rahu, Ketu) occupies the 12th house from the Sun — gives intelligence, wealth, royal favor, and comfortable life.",
    whenActivates:
      "During the planet's periods, and when transits activate the 12th from Sun.",
    watchFor:
      "Intelligence, wealth, favor from authorities, and comfortable life circumstances.",
    lifeAreas: ["Intelligence", "Wealth", "Royal Favor", "Comfort"],
  },
  VESI: {
    meaning:
      "Vesi Yoga forms when a planet (other than Moon, Rahu, Ketu) occupies the 2nd house from the Sun — gives wealth, courage, charitable nature, and respected position.",
    whenActivates:
      "During the planet's periods, and when transits activate the 2nd from Sun.",
    watchFor:
      "Wealth, courage, philanthropy, and respect in society.",
    lifeAreas: ["Wealth", "Courage", "Charity", "Respect"],
  },
  UBHAYACHARI: {
    meaning:
      "Ubhayachari Yoga forms when planets occupy both the 2nd and 12th houses from the Sun — combines Vasi and Vesi, giving great intelligence, wealth, high status, and leadership.",
    whenActivates:
      "During the periods of the involved planets, and when transits activate both sides of the Sun.",
    watchFor:
      "Great intelligence, wealth, leadership, high status, and all-round success.",
    lifeAreas: ["Intelligence", "Wealth", "Status", "Leadership"],
  },
  SARASWATI: {
    meaning:
      "Saraswati Yoga forms when Jupiter, Venus, and Mercury are in Kendra/Trikona houses from Lagna or Moon, with Jupiter strong — bestows learning, eloquence, artistic talent, wisdom, and mastery of arts/sciences.",
    whenActivates:
      "During Jupiter, Venus, or Mercury periods, and when these planets transit Kendra/Trikona.",
    watchFor:
      "Education, artistic mastery, eloquence, wisdom, teaching/counseling success, and creative achievements.",
    lifeAreas: ["Education", "Arts", "Eloquence", "Wisdom", "Creativity"],
  },
  LAKSHMI: {
    meaning:
      "Lakshmi Yoga forms when the 9th lord and Venus are both in Kendra/Trikona houses in their own or exalted signs — gives abundant wealth, prosperity, luxury, and fulfillment of desires.",
    whenActivates:
      "During the 9th lord's or Venus periods, and when Jupiter/Venus transits support wealth houses.",
    watchFor:
      "Abundant wealth, prosperity, luxury lifestyle, and fulfillment of material desires.",
    lifeAreas: ["Wealth", "Prosperity", "Luxury", "Fulfillment"],
  },
  PARIVARTANA: {
    meaning:
      "Parivartana Yoga (Exchange Yoga) forms when two planets exchange signs — each occupies the sign ruled by the other. This creates a strong linkage between the houses involved, blending their significations.",
    whenActivates:
      "During the periods of either exchanged planet, and when transits activate either house.",
    watchFor:
      "Strong linkage between the two houses — results depend on which houses and planets are involved. Can be very powerful for Kendra-Trikona exchanges.",
    lifeAreas: ["Variable (depends on houses)"],
  },
  AMALA: {
    meaning:
      "Amala Yoga forms when a benefic planet (Jupiter, Venus, Mercury, waxing Moon) occupies the 10th house from Lagna or Moon — gives pure reputation, lasting fame, virtuous career, and respect in society.",
    whenActivates:
      "During the benefic planet's periods, and when transits activate the 10th house from Lagna/Moon.",
    watchFor:
      "Pure reputation, lasting fame, virtuous career, social respect, and professional integrity.",
    lifeAreas: ["Reputation", "Career", "Virtue", "Fame"],
  },
  PUSHKALA: {
    meaning:
      "Pushkala Yoga forms when the Lagna lord is strong, Moon is in Kendra/Trikona from the Lagna lord, and a benefic is in Kendra from Lagna — gives high status, prosperity, king-like position, and all-round success.",
    whenActivates:
      "During the Lagna lord's or Moon's periods, and when benefic transits activate Kendra houses.",
    watchFor:
      "High status, prosperity, leadership, king-like position, and comprehensive success.",
    lifeAreas: ["Status", "Prosperity", "Leadership", "Overall Success"],
  },
  SHUBHA_KARTARI: {
    meaning:
      "Shubha Kartari Yoga forms when a planet or house is hemmed between benefics (Jupiter, Venus, Mercury, waxing Moon) on both sides — protects and enhances the hemmed planet/house's significations.",
    whenActivates:
      "During the hemmed planet's periods, and when benefic transits support the configuration.",
    watchFor:
      "Protection and enhancement of the hemmed planet/house — positive outcomes, support, and reduced obstacles.",
    lifeAreas: ["Protection", "Enhancement", "Support"],
  },
  PAPA_KARTARI: {
    meaning:
      "Papa Kartari Yoga forms when a planet or house is hemmed between malefics (Sun, Mars, Saturn, Rahu, Ketu) on both sides — creates stress, challenges, and obstruction for the hemmed planet/house's significations.",
    whenActivates:
      "During the hemmed planet's periods, and when malefic transits activate the configuration.",
    watchFor:
      "Stress, challenges, delays, and obstruction — mitigated by benefic aspects or strong hemmed planet. Not a curse, but a theme requiring conscious effort.",
    lifeAreas: ["Challenges", "Obstruction", "Stress"],
  },
  NABHASA_ASHRAYA: {
    meaning:
      "Nabhasa Ashraya Yogas (Rajju, Musala, Nala) form based on planetary concentration in movable, fixed, or dual signs. They indicate the native's fundamental approach to life — active/initiation (Rajju), stable/determined (Musala), or adaptable/intellectual (Nala).",
    whenActivates:
      "Always present as a structural feature of the chart — colors all life themes.",
    watchFor:
      "Rajju: Travel, change, initiation. Musala: Stability, accumulation, resistance. Nala: Adaptability, communication, versatility.",
    lifeAreas: ["Life Approach", "Nature", "Adaptability"],
  },
  NABHASA_DALA: {
    meaning:
      "Nabhasa Dala Yogas (Maala, Sarpa, etc.) form based on planetary distribution between the two halves of the zodiac. Maala (benefics in Kendra) gives prosperity; Sarpa (malefics in Kendra) gives struggles but spiritual depth.",
    whenActivates:
      "Always present as a structural feature — shows the pattern of fortune distribution.",
    watchFor:
      "Maala: Garland of success, happiness. Sarpa: Serpent of obstacles, but potential for spiritual transformation.",
    lifeAreas: ["Life Pattern", "Fortune Pattern"],
  },
  NABHASA_AKRITI: {
    meaning:
      "Nabhasa Akriti Yogas (Gada, Shakata, etc.) form based on geometric patterns of planetary placement. Gada (adjacent Kendras) gives authority; Shakata (1st and 7th only) gives ups and downs with eventual progress.",
    whenActivates:
      "Always present as a structural feature — shows the structural pattern of life.",
    watchFor:
      "Gada: Authority, structural power. Shakata: Instability, travel, but eventual progress through movement.",
    lifeAreas: ["Life Structure", "Pattern"],
  },
  NABHASA_SANKHYA: {
    meaning:
      "Nabhasa Sankhya Yogas (Veena, Damini, Pasha, Kedara, Shula, Yuga, Gola) form based on the number of houses occupied by classical planets. More concentrated = intense/specialized; more distributed = varied/multifaceted.",
    whenActivates:
      "Always present as a structural feature — shows the spread of planetary energy.",
    watchFor:
      "Veena (7): Artistic, harmonious. Damini (6): Brilliant, sudden. Pasha (5): Focused mastery. Kedara (4): Grounded. Shula (3): Intense specialization. Yuga (2): Duality. Gola (1): Extreme concentration.",
    lifeAreas: ["Energy Distribution", "Life Spread"],
  },
  GURU_BHAVA: {
    meaning: "Supportive Jupiter placement — growth, guidance, and optimism themes.",
    whenActivates: "Jupiter Mahadasha/Antardasha and Jupiter Gochar over key houses.",
    watchFor: "Teachers, expansion, and ethical opportunities.",
    lifeAreas: ["Growth", "Guidance"],
  },
  VENUS_HARMONY: {
    meaning: "Venus support for relationships, aesthetics, and comfort.",
    whenActivates: "Venus periods and Venus/Jupiter transits to relationship houses.",
    watchFor: "Partnership ease, creativity, and harmony at home.",
    lifeAreas: ["Relationships", "Comfort", "Creativity"],
  },
  MOON_OWN: {
    meaning: "Moon in its own sign — emotional steadiness and self-nourishment.",
    whenActivates: "Moon periods and supportive lunar Gochar.",
    watchFor: "Mental peace, family bonding, and intuitive clarity.",
    lifeAreas: ["Mind", "Health", "Home"],
  },
  RUCHAKA_HINT: {
    meaning: "Mars strength hint (Ruchaka-like) — courage, drive, and initiative.",
    whenActivates: "Mars dasha and activating Mars transits.",
    watchFor: "Bold action, competition, and physical vitality — temper impulsiveness.",
    lifeAreas: ["Courage", "Career", "Energy"],
  },
  LAGNA_SET: {
    meaning: "Ascendant is established — the chart's reference for houses and timing.",
    whenActivates: "Always foundational; Lagna lord periods colour identity and vitality.",
    watchFor: "Self-presentation, health routines, and life direction.",
    lifeAreas: ["Identity", "Vitality"],
  },
};

const BY_CATEGORY: Record<string, YogaInsight> = {
  CAREER: {
    meaning: "This combination leans toward vocation, status, and outer achievement themes.",
    whenActivates:
      "Often during dashas of the yoga planets or 10th-house lords, and supportive career Gochar.",
    watchFor: "Professional openings and public visibility.",
    lifeAreas: ["Career"],
  },
  WEALTH: {
    meaning: "This combination leans toward resources, speech, and prosperity themes.",
    whenActivates: "During related planetary periods and beneficial Jupiter/Venus transits.",
    watchFor: "Income streams and value-building habits.",
    lifeAreas: ["Wealth"],
  },
  MARRIAGE: {
    meaning: "This combination leans toward partnership and emotional bonding themes.",
    whenActivates: "Venus/Jupiter/7th-lord periods and relationship-house Gochar.",
    watchFor: "Partnership timing and harmony practices.",
    lifeAreas: ["Relationships"],
  },
  HEALTH: {
    meaning: "This combination leans toward vitality and mind-body balance.",
    whenActivates: "Lagna/Moon periods and health-sensitive Gochar.",
    watchFor: "Routine, rest, and preventive care — not medical diagnosis.",
    lifeAreas: ["Health"],
  },
  GENERAL: {
    meaning: "A supportive chart factor recorded by the rule engine.",
    whenActivates: "When related planetary periods or transits emphasize this theme.",
    watchFor: "Integrate with dasha and Gochar rather than treating as a standalone prediction.",
    lifeAreas: ["General"],
  },
};

export function insightForYoga(input: {
  code?: string;
  name: string;
  category?: string;
  description?: string;
  currentMaha?: string | null;
  currentAntar?: string | null;
}): YogaInsight & {
  activationNow: string;
  engineNote: string;
  exemplar: YogaExemplar;
} {
  const base =
    (input.code && BY_CODE[input.code]) ||
    (input.category && BY_CATEGORY[input.category]) ||
    BY_CATEGORY.GENERAL!;

  const dashaBits = [input.currentMaha, input.currentAntar].filter(Boolean).join(" / ");
  const activationNow = dashaBits
    ? `Current period: ${dashaBits}. Compare whether yoga planets or related house lords match this dasha — activation is more likely when they do.`
    : "Generate dasha to compare yoga planets with the current Mahadasha / Antardasha.";

  return {
    ...base,
    meaning: input.description?.trim() || base.meaning,
    activationNow,
    engineNote:
      "Calculated from your Kundli by the rule engine using classical Parashari principles — AI may explain, not invent, yogas.",
    exemplar: exemplarForYoga({
      code: input.code,
      category: input.category,
      name: input.name,
    }),
  };
}

export function insightForDosha(input: {
  code: string;
  name: string;
  present: boolean;
  severity?: string;
  notes?: string;
  currentMaha?: string | null;
}): YogaInsight & {
  activationNow: string;
  engineNote: string;
  statusLabel: string;
  exemplar: YogaExemplar;
} {
  const map: Record<string, YogaInsight> = {
    MANGLIK: {
      meaning:
        "Manglik Dosha is indicated when Mars occupies classical sensitive houses (1, 2, 4, 7, 8, 12) — traditionally discussed for partnership timing and assertiveness.",
      whenActivates:
        "More discussed during Mars periods and when Mars Gochar hits relationship houses. Cancellation factors and chart context matter.",
      watchFor:
        "Channel Mars constructively — discipline, exercise, clear communication. Not a medical or marriage verdict by itself.",
      lifeAreas: ["Partnership", "Energy", "Courage"],
    },
    KALA_SARPA: {
      meaning:
        "Kaal Sarp involves all classical planets lying on one side of the Rahu–Ketu axis — traditionally linked with intensity and transformative chapters.",
      whenActivates:
        "Often felt more during Rahu/Ketu periods or strong node transits. Not every chart with nodes is Kaal Sarp.",
      watchFor: "Patience, grounding routines, and avoiding fear-based conclusions.",
      lifeAreas: ["Transformation", "Timing"],
    },
    PITRA: {
      meaning: "Pitra themes relate to ancestral / lineage indicators in classical notes.",
      whenActivates:
        "Discussed when related planetary combinations and family-house timing coincide.",
      watchFor: "Respectful remembrance and family duty — cultural guidance, not fate.",
      lifeAreas: ["Family", "Lineage"],
    },
  };

  const base = map[input.code] || {
    meaning: input.notes || `${input.name} was evaluated by the dosha rule engine.`,
    whenActivates: "Review during related planetary dashas and Gochar.",
    watchFor: "Use as context with the full chart — not a standalone fear label.",
    lifeAreas: ["General"],
  };

  const dashaBits = input.currentMaha ? `Current Mahadasha: ${input.currentMaha}.` : "";
  return {
    ...base,
    meaning: input.notes?.trim() || base.meaning,
    activationNow: input.present
      ? `${dashaBits} This factor is currently flagged present (${input.severity || "noted"}).`
      : `${dashaBits} Not flagged as present in the current engine pass.`,
    engineNote: "Deterministic dosha scan from your stored planets — not AI invention.",
    statusLabel: input.present ? `Present · ${input.severity || "noted"}` : "Not present",
    exemplar: exemplarForDosha(input.code),
  };
}