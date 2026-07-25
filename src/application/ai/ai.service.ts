import { withVedicDisclaimer, VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import { AiConversation, Horoscope, Dasha, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { runWithAiToolContext } from "@/application/ai/ai-tool-context";
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

async function guruDeterministicExplain(userId: string, message: string) {
  await connectMongo();
  const [chart, dasha] = await Promise.all([
    Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
    Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
  ]);

  if (!chart) {
    return withVedicDisclaimer(
      "Namaste. I am AI Guru. Please save your birth details and generate your kundli first — then I can answer from your chart in simple words.",
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
  const q = message.toLowerCase();
  const wantsMarriage = /marri|partner|spouse|relat|love|7th|vivah/.test(q);
  const wantsCareer = /career|job|work|business|success|raja/.test(q);
  const wantsTiming = /when|timing|this (month|year)|gochar|transit|now|dasha/.test(q);

  const lines: string[] = [
    `Your rising sign (Lagna) is **${chart.lagnaSign}**, Moon is in **${chart.moonSign}**, and Sun is in **${chart.sunSign}**.`,
  ];

  if (dasha?.currentMaha) {
    lines.push(
      `Right now your main period (Mahadasha) is **${dasha.currentMaha}**${
        dasha.currentAntar ? `, with Antardasha **${dasha.currentAntar}**` : ""
      }.`,
    );
  }

  if (raja[0]) {
    lines.push(
      `A supportive yoga on your chart: **${raja[0].name}** — ${
        raja[0].description || "it can support growth when you act with focus."
      }`,
    );
  } else if (yogas[0]) {
    lines.push(`Notable combination: **${yogas[0].name}**.`);
  }

  if (wantsMarriage && venus) {
    lines.push(
      `For relationships, Venus in **${venus.sign}** (house ${venus.house}) shows how you give and receive love.`,
    );
  } else if (wantsCareer) {
    lines.push(
      "For career, watch your 10th-house themes with the current dasha — steady effort usually works better than rushing.",
    );
  } else if (wantsTiming && gochar?.highlights?.[0]) {
    lines.push(`In the sky now: ${gochar.highlights[0]}`);
  } else if (gochar?.highlights?.[0]) {
    lines.push(`Current transit note: ${gochar.highlights[0]}`);
  }

  lines.push("Ask me one clear question — I will keep the answer short and easy.");

  return withVedicDisclaimer(lines.join("\n\n"));
}

async function guruOpeningGreeting(userId: string) {
  await connectMongo();
  const [chart, dasha] = await Promise.all([
    Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
    Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
  ]);

  if (!chart) {
    return withVedicDisclaimer(
      "Namaste. I am **AI Guru**. Generate your kundli from Birth Details, then ask me anything — I will answer in simple words from your chart.",
    );
  }

  const parts = [
    "Namaste. I am **AI Guru**.",
    `Your chart shows Lagna in **${chart.lagnaSign}** and Moon in **${chart.moonSign}**.`,
  ];
  if (dasha?.currentMaha) {
    parts.push(
      `Current Mahadasha: **${dasha.currentMaha}**${
        dasha.currentAntar ? ` · Antardasha **${dasha.currentAntar}**` : ""
      }.`,
    );
  }
  parts.push("Ask me about love, career, timing, or yogas — I keep answers short and clear.");
  return withVedicDisclaimer(parts.join(" "));
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

    let allowlistedCandidate: string | null = null;
    if (candidateUserId) {
      const { assertCandidateAccessible } = await import("@/lib/security/profile-access");
      await assertCandidateAccessible(userId, candidateUserId);
      allowlistedCandidate = candidateUserId;
    }

    if (agent === "REPORT") {
      const { requireEntitlement } = await import("@/application/billing/entitlements");
      await requireEntitlement(userId, "premium_reports");
    }

    let conversation = conversationId
      ? await AiConversation.findById(conversationId).where({ userId })
      : null;
    if (!conversation) {
      conversation = await AiConversation.create({
        userId,
        agent,
        title: message.slice(0, 80),
        messages: [],
        contextRefs: allowlistedCandidate ? { candidateUserId: allowlistedCandidate } : {},
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

    const profile = await Profile.findOne({ userId, status: "ACTIVE" }).lean();
    const preferredLanguage =
      (profile?.localization?.aiLanguage as string | null | undefined) ||
      (profile?.localization?.language as string | null | undefined) ||
      "en";
    const languageInstruction = `Respond in the user's preferred language code "${preferredLanguage}". Keep Vedic terms (Kundli, Nakshatra, Dasha, Lagna, Guna Milan, Gochar, Yoga, Dosha) in canonical form with a short local explanation when helpful. Stay reflective — never invent planet positions, guna scores, or certainty about outcomes.`;

    if (hasLlmCredentials()) {
      try {
        const agentInstance = vedaAgents[agent];
        const prompt = [
          "Tools are already bound to the authenticated member — do not invent user ids.",
          allowlistedCandidate
            ? `An allowlisted candidate partner id is available for compatibility tools only: ${allowlistedCandidate}`
            : "No candidate partner in context; use list mode for compatibility history.",
          "Always call the relevant tool before explaining.",
          languageInstruction,
          "Keep it short: 3–6 sentences or up to 5 bullets. Answer only what was asked.",
          `Member message: ${message}`,
        ]
          .filter(Boolean)
          .join("\n");

        const result = await runWithAiToolContext(
          {
            sessionUserId: userId,
            allowedCandidateUserId: allowlistedCandidate,
          },
          () => agentInstance.generate(prompt),
        );
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
      ? await guruOpeningGreeting(userId)
      : withVedicDisclaimer(
          "Namaste. I am **AI Guru**. Generate your kundli from Birth Details, then ask me — I answer in simple, short words from your chart.",
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
        "What does my current dasha mean for me?",
        "Tell me one strength in my chart.",
        "How do Venus and the 7th house look for love?",
        "What should I watch this month?",
        "Explain my Lagna in simple words.",
      ],
      disclaimer: VEDIC_AI_DISCLAIMER,
    };
  }
}

export const aiService = new AiService();
