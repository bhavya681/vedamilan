import { withVedicDisclaimer, VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import { AiConversation, Horoscope, Dasha, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { compatibilityService } from "@/application/rules/compatibility.service";
import { matchmakingService } from "@/application/matchmaking/matchmaking.service";
import { computeGocharForUser } from "@/application/horoscope/gochar.service";
import { vedaAgents, type VedaAgentKey } from "@/mastra/agents/veda-agents";

function hasLlmCredentials(): boolean {
  return Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY,
  );
}

function formatDate(d?: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

async function guruDeterministicExplain(userId: string, message: string) {
  await connectMongo();
  const [chart, dasha] = await Promise.all([
    Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
    Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
  ]);

  if (!chart) {
    return withVedicDisclaimer(
      [
        "Namaste.",
        "",
        "I am ready to guide you — but your kundli has not been generated yet.",
        "Please open Birth Details, save your birth data, then generate your kundli.",
        "Once the chart is stored, I can explain Raja Yogas, Mahadasha, Gochar, and relationship timing with chart-backed clarity.",
        "",
        `Your question: ${message}`,
      ].join("\n"),
    );
  }

  let gochar: Awaited<ReturnType<typeof computeGocharForUser>> | null = null;
  try {
    gochar = await computeGocharForUser(userId);
  } catch {
    gochar = null;
  }

  const yogas = chart.yogas || [];
  const raja = yogas.filter((y) =>
    /raja|gajakesari|dharma.?karma|budhaditya|ruchaka/i.test(`${y.code} ${y.name}`),
  );
  const venus = chart.planets?.find((p) => p.planet === "Venus");
  const seventh = chart.planets?.find((p) => p.house === 7);
  const mahaPeriods = (dasha?.periods || [])
    .filter((p) => p.level === "MAHA")
    .slice(0, 6)
    .map((p) => `• ${p.lord}: ${formatDate(p.startDate)} → ${formatDate(p.endDate)}`)
    .join("\n");

  const q = message.toLowerCase();
  const wantsMarriage = /marri|partner|spouse|relat|love|7th|vivah/.test(q);
  const wantsCareer = /career|job|work|business|success|raja/.test(q);
  const wantsTiming = /when|timing|this (month|year)|gochar|transit|now|dasha/.test(q);

  const sections: string[] = [
    "Namaste.",
    "",
    "### Chart foundation",
    `Your Lagna rises in **${chart.lagnaSign}**, Moon rests in **${chart.moonSign}**, and Sun shines from **${chart.sunSign}**.`,
    `Manglik reading from the rule engine: **${chart.manglikStatus}**.`,
  ];

  if (raja.length) {
    sections.push(
      "",
      "### Raja & auspicious yogas",
      ...raja.map(
        (y) =>
          `• **${y.name}** (${y.category}, strength ${y.strength}): ${y.description || "Supportive classical combination."}`,
      ),
    );
  } else if (yogas.length) {
    sections.push(
      "",
      "### Yogas present",
      ...yogas.slice(0, 5).map((y) => `• **${y.name}**: ${y.description || y.category}`),
    );
  } else {
    sections.push(
      "",
      "### Yogas",
      "No strong Raja-style combinations were flagged in the current engine pass. Focus remains on Lagna, Moon, and dasha lords.",
    );
  }

  if (dasha) {
    sections.push(
      "",
      "### Vimshottari Dasha",
      `Current **Mahadasha**: ${dasha.currentMaha || "—"}${dasha.currentAntar ? ` · **Antardasha**: ${dasha.currentAntar}` : ""}.`,
      mahaPeriods ? `Upcoming / recent Mahadasha arc:\n${mahaPeriods}` : "",
    );
  }

  if (gochar) {
    sections.push(
      "",
      "### Gochar (present sky)",
      `As of ${formatDate(gochar.asOf)} — transit Ascendant near **${gochar.transitAscendant}** (read from natal Lagna **${gochar.natalLagna}**).`,
      ...gochar.highlights.map((h) => `• ${h}`),
    );
  }

  if (wantsMarriage || !wantsCareer) {
    sections.push(
      "",
      "### Relationship lens",
      venus
        ? `Venus occupies **${venus.sign}** in house **${venus.house}** (${venus.nakshatra}) — this colors affection style and partnership taste.`
        : "Venus placement unavailable.",
      seventh
        ? `A planet presently marking the 7th house space in your natal map: **${seventh.planet}** in ${seventh.sign}.`
        : "No planet sits directly in the natal 7th in the stored chart — partnership themes then lean more on the 7th lord and Venus.",
    );
  }

  if (wantsCareer) {
    sections.push(
      "",
      "### Career / elevation",
      "Watch the 10th-house themes together with any Raja / Dharma-Karma combinations above. When the current Mahadasha lord supports kendra/trikona houses, outer recognition tends to feel smoother.",
    );
  }

  if (wantsTiming || gochar) {
    sections.push(
      "",
      "### How to work with this period",
      "• Honour the Mahadasha lord's nature in daily discipline (clarity, patience, or initiative as indicated).",
      "• Use supportive Gochar months for introductions, interviews, or family conversations — avoid rushing under heavy Saturn pressure on the 7th/8th.",
      "• Re-check compatibility with Ashta Koota before serious commitments.",
    );
  }

  sections.push(
    "",
    "### On your question",
    `You asked: “${message}”`,
    "I have answered from your stored kundli, yoga engine, dasha periods, and current Gochar — not from guesswork. If you want depth on one yoga, a house, or marriage timing windows, ask me specifically.",
  );

  return withVedicDisclaimer(sections.filter(Boolean).join("\n"));
}

async function deterministicExplain(agent: VedaAgentKey, userId: string, message: string) {
  await connectMongo();

  if (agent === "ASTROLOGER_GURU" || agent === "HOROSCOPE") {
    return guruDeterministicExplain(userId, message);
  }

  switch (agent) {
    case "COMPATIBILITY": {
      const reports = await compatibilityService.listForUser(userId);
      if (!reports.length) {
        return withVedicDisclaimer(
          "No compatibility reports yet. Open Compatibility, enter a candidate user id, and run deep milan (Shukra + Ashta Koota) — then I can explain strengths and challenges.",
        );
      }
      const r = reports[0] as Record<string, unknown>;
      const shukra = r.shukraMilan as { averageScore?: number; percent?: number } | undefined;
      return withVedicDisclaimer(
        [
          `Latest deep compatibility: ${r.deepOverallScore ?? r.overallScore}% overall${r.decisionSummary ? ` (${r.decisionSummary})` : ""}.`,
          `Ashta Koota: ${r.totalGuna}/${r.maxGuna}.`,
          shukra?.averageScore != null
            ? `Shukra Milan: ${shukra.averageScore}/10 (${shukra.percent}%).`
            : null,
          `Strengths: ${(r.strengths as string[] | undefined)?.slice(0, 3).join("; ") || "see report"}.`,
          `Challenges: ${(r.challenges as string[] | undefined)?.slice(0, 3).join("; ") || "see report"}.`,
          `Manglik note: ${r.manglikCompatibility || "n/a"}.`,
        ]
          .filter(Boolean)
          .join(" "),
      );
    }
    case "MARRIAGE_TIMING": {
      try {
        const timing = await compatibilityService.marriageTimingForUser(userId);
        const top = timing.windows?.[0];
        return withVedicDisclaimer(
          top
            ? `Based on dasha windows from the rule engine, a stronger traditional window is ${top.label} (${top.window}, score ${top.score}). Current Mahadasha: ${timing.currentMaha}. Review multiple windows before major decisions.`
            : "Marriage timing windows are unavailable until kundli and dasha are generated.",
        );
      } catch {
        return withVedicDisclaimer(
          "Generate your kundli and dasha first, then open Marriage Timing so the rule engine can produce windows I can explain.",
        );
      }
    }
    case "RECOMMENDATION":
    case "SEARCH": {
      const result = await matchmakingService.recommend(userId);
      const matches = result.data || [];
      if (!matches.length) {
        return withVedicDisclaimer(
          "No ranked matches yet. Complete your profile, generate kundli, then browse Match feed so the ranker can score candidates.",
        );
      }
      const lines = matches
        .slice(0, 3)
        .map(
          (m, i) =>
            `${i + 1}. ${m.name} (${m.city || "—"}) — ${m.compatibilityScore}% Vedic score. ${m.reasons?.[0] || ""}`,
        );
      return withVedicDisclaimer(
        `Top recommendations from the matchmaking engine:\n${lines.join("\n")}\nNext actions: open each profile, shortlist mutually aligned values, then run full compatibility.`,
      );
    }
    case "PROFILE_ANALYSIS": {
      const profile = await Profile.findOne({ userId }).lean();
      if (!profile) {
        return withVedicDisclaimer("Create your profile first from the Profile page.");
      }
      const hints = [
        !profile.about ? "Add an about section" : null,
        !profile.photos?.length ? "Upload a photo" : null,
        !profile.profession ? "Add profession" : null,
      ].filter(Boolean);
      return withVedicDisclaimer(
        hints.length
          ? `Profile analysis: prioritize — ${hints.join("; ")}. Clear photos and a sincere about section improve earnest conversations.`
          : "Your profile fundamentals look solid. Keep preferences updated and generate kundli for Vedic ranking.",
      );
    }
    default: {
      return guruDeterministicExplain(userId, message);
    }
  }
}

export class AiService {
  async chat(input: {
    userId: string;
    agent: VedaAgentKey;
    message: string;
    conversationId?: string;
    candidateUserId?: string;
  }) {
    await connectMongo();
    const { userId, agent, message, conversationId, candidateUserId } = input;

    let conversation = conversationId
      ? await AiConversation.findById(conversationId).where({ userId })
      : null;
    if (!conversation) {
      conversation = await AiConversation.create({
        userId,
        agent,
        title: message.slice(0, 80),
        messages: [],
        contextRefs: candidateUserId ? { candidateUserId } : {},
        model: hasLlmCredentials() ? "llm" : "deterministic-explain",
      });
    }

    type ChatMessage = {
      role: "user" | "assistant" | "system" | "tool";
      content: string;
      toolName?: string | null;
      createdAt: Date;
    };

    const messages: ChatMessage[] = [
      ...((conversation.messages || []) as unknown as ChatMessage[]),
      {
        role: "user",
        content: message,
        toolName: null,
        createdAt: new Date(),
      },
    ];

    let answer: string;
    let modelUsed = "deterministic-explain";
    let tokenUsage = conversation.tokenUsage || { prompt: 0, completion: 0, total: 0 };

    if (hasLlmCredentials()) {
      try {
        const agentInstance = vedaAgents[agent];
        const prompt = [
          `Authenticated userId: ${userId}`,
          candidateUserId ? `Candidate userId: ${candidateUserId}` : null,
          "Always call the relevant tool with this userId before explaining.",
          `Member message: ${message}`,
        ]
          .filter(Boolean)
          .join("\n");

        const result = await agentInstance.generate(prompt);
        answer = withVedicDisclaimer(
          typeof result.text === "string" && result.text.trim()
            ? result.text
            : "I reviewed the available engine data but could not form a narrative. Try again or open the related dashboard page.",
        );
        modelUsed = "mastra-llm";
        const usage = result.usage as
          { promptTokens?: number; completionTokens?: number } | undefined;
        if (usage) {
          tokenUsage = {
            prompt: usage.promptTokens || 0,
            completion: usage.completionTokens || 0,
            total: (usage.promptTokens || 0) + (usage.completionTokens || 0),
          };
        }
      } catch (error) {
        console.error("Mastra generate failed, falling back to deterministic explain", error);
        answer = await deterministicExplain(agent, userId, message);
      }
    } else {
      answer = await deterministicExplain(agent, userId, message);
    }

    messages.push({
      role: "assistant",
      content: answer,
      toolName: null,
      createdAt: new Date(),
    });

    const updated = await AiConversation.findByIdAndUpdate(
      conversation._id,
      {
        $set: {
          messages,
          model: modelUsed,
          tokenUsage,
          agent,
        },
      },
      { new: true },
    );

    return {
      conversationId: String(conversation._id),
      agent,
      answer,
      disclaimer: VEDIC_AI_DISCLAIMER,
      model: modelUsed,
      messages: (updated?.messages || messages).slice(-40),
    };
  }

  async listConversations(userId: string, agent?: VedaAgentKey) {
    await connectMongo();
    const query: Record<string, unknown> = { userId, status: "ACTIVE" };
    if (agent) query.agent = agent;
    return AiConversation.find(query).sort({ updatedAt: -1 }).limit(30).lean();
  }

  async insightsBundle(userId: string) {
    await connectMongo();
    const [chart, dasha] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
    ]);

    let gochar: Awaited<ReturnType<typeof computeGocharForUser>> | null = null;
    try {
      gochar = await computeGocharForUser(userId);
    } catch {
      gochar = null;
    }

    const yogas = chart?.yogas || [];
    const rajaYogas = yogas.filter((y) =>
      /raja|gajakesari|dharma.?karma|budhaditya|ruchaka/i.test(`${y.code} ${y.name}`),
    );

    const greeting = chart
      ? await guruDeterministicExplain(
          userId,
          "Please give me a warm opening overview of my chart, yogas, dasha, and current gochar.",
        )
      : withVedicDisclaimer(
          "Namaste. Generate your kundli from Birth Details so I can read your Lagna, Moon, Raja Yogas, Dasha, and Gochar as your AI Guru.",
        );

    return {
      hasChart: Boolean(chart),
      chartSummary: chart
        ? {
            lagnaSign: chart.lagnaSign,
            moonSign: chart.moonSign,
            sunSign: chart.sunSign,
            manglikStatus: chart.manglikStatus,
            planets: (chart.planets || [])
              .filter((p) =>
                [
                  "Sun",
                  "Moon",
                  "Mars",
                  "Mercury",
                  "Jupiter",
                  "Venus",
                  "Saturn",
                  "Rahu",
                  "Ketu",
                ].includes(p.planet),
              )
              .map((p) => ({
                planet: p.planet,
                sign: p.sign,
                house: p.house,
                nakshatra: p.nakshatra,
                dignity: p.dignity,
                isRetrograde: p.isRetrograde,
              })),
          }
        : null,
      rajaYogas,
      yogas,
      doshas: chart?.doshas || [],
      dasha: dasha
        ? {
            currentMaha: dasha.currentMaha,
            currentAntar: dasha.currentAntar,
            periods: (dasha.periods || [])
              .filter((p) => p.level === "MAHA" || p.level === "ANTAR")
              .slice(0, 12)
              .map((p) => ({
                lord: p.lord,
                level: p.level,
                parentLord: p.parentLord,
                startDate: p.startDate,
                endDate: p.endDate,
              })),
          }
        : null,
      gochar,
      openingMessage: greeting,
      suggestedPrompts: [
        "What do my Raja Yogas say about career and recognition?",
        "Explain my current Mahadasha and Antardasha for relationships.",
        "What does Gochar show for the next few months?",
        "How do Venus and the 7th house shape my marriage themes?",
        "Which yogas and doshas should I be conscious of?",
      ],
      disclaimer: VEDIC_AI_DISCLAIMER,
    };
  }
}

export const aiService = new AiService();
