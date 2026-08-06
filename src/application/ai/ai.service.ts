import { withVedicDisclaimer, VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import { AiConversation, Horoscope, Dasha, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { runWithAiToolContext } from "@/application/ai/ai-tool-context";
import {
  buildGuruSystemDirectives,
  classifyQuestionIntent,
  formatChatHistory,
  needsAstrologyTools,
  trySolveMath,
  type QuestionIntent,
} from "@/application/ai/chat-intent";
import { compatibilityService } from "@/application/rules/compatibility.service";
import { matchmakingService } from "@/application/matchmaking/matchmaking.service";
import { computeGocharForUser } from "@/application/horoscope/gochar.service";
import { vedaAgents, type VedaAgentKey } from "@/mastra/agents/veda-agents";
import { type YogaItem } from "@/features/ai/components/guru-chart-panels";

function hasLlmCredentials(): boolean {
  return Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY,
  );
}

function greetingReply() {
  return withVedicDisclaimer(
    "Namaste. I am **AI Guru** — your Vedic astrology guide on VedaMilan. Ask about your chart, dashas, timing, career, or relationships, and I will answer clearly from your Kundli data.",
  );
}

function identityReply() {
  return withVedicDisclaimer(
    "I am **AI Guru**, VedaMilan’s professional Vedic astrology assistant. I explain your calculated Kundli, dashas, yogas, and compatibility in plain language. I do not invent planet positions — the rule engine calculates; I interpret.",
  );
}

function thanksReply() {
  return withVedicDisclaimer(
    "You’re welcome. Whenever you are ready, ask another clear question about your chart or life theme.",
  );
}

async function guruDeterministicExplain(
  userId: string,
  message: string,
  intent: QuestionIntent = classifyQuestionIntent(message),
) {
  const math = trySolveMath(message);
  if (math) return withVedicDisclaimer(math);
  if (intent === "greeting") return greetingReply();
  if (intent === "identity") return identityReply();
  if (intent === "thanks") return thanksReply();

  // Non-astrology questions: answer directly — never paste the same chart dump.
  if (!needsAstrologyTools(intent) && intent !== "unknown") {
    return withVedicDisclaimer(
      [
        `I heard your question: “${message.trim().slice(0, 200)}”.`,
        "Without the live language model connected right now, I can still help best with **Kundli, dasha, timing, career, and relationship** questions grounded in your chart.",
        "Ask something like: “What does my current Mahadasha mean?” or “How does Venus show in relationships for me?”",
      ].join("\n\n"),
    );
  }

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
  const tenth = chart.planets?.find((p) => p.house === 10);

  const lines: string[] = [`**Your question:** ${message.trim().slice(0, 220)}`, ""];

  if (intent === "relationship") {
    lines.push(
      `For relationships, your Lagna is **${chart.lagnaSign}** and Moon is in **${chart.moonSign}** — these shape emotional needs.`,
    );
    if (venus) {
      lines.push(
        `Venus in **${venus.sign}** (house ${venus.house}) shows how affection and partnership themes may express.`,
      );
    }
    if (dasha?.currentMaha) {
      lines.push(
        `Current Mahadasha **${dasha.currentMaha}**${
          dasha.currentAntar ? ` / Antardasha **${dasha.currentAntar}**` : ""
        } can colour relationship timing — use it as context, not a verdict.`,
      );
    }
  } else if (intent === "career") {
    lines.push(
      `For career themes, Lagna **${chart.lagnaSign}** and the 10th-house picture matter most alongside your dasha.`,
    );
    if (tenth) {
      lines.push(
        `A planet in the 10th from this chart view: **${tenth.planet}** in **${tenth.sign}**.`,
      );
    }
    if (raja[0]) {
      lines.push(
        `Supportive combination: **${raja[0].name}** — ${raja[0].description || "may favour recognition when effort is steady."}`,
      );
    }
    if (dasha?.currentMaha) {
      lines.push(
        `Work with your current Mahadasha **${dasha.currentMaha}** — steady skill-building usually outperforms rushing.`,
      );
    }
  } else if (intent === "timing") {
    if (dasha?.currentMaha) {
      lines.push(
        `Timing lens: Mahadasha **${dasha.currentMaha}**${
          dasha.currentAntar ? `, Antardasha **${dasha.currentAntar}**` : ""
        }.`,
      );
    }
    if (gochar?.highlights?.[0]) {
      lines.push(`Current transit note: ${gochar.highlights[0]}`);
    }
    lines.push(
      "Exact muhurta for ceremonies still needs classical electional work — this is directional guidance only.",
    );
  } else {
    // astrology / unknown but chart-related
    lines.push(
      `From your Kundli: Lagna **${chart.lagnaSign}**, Moon **${chart.moonSign}**, Sun **${chart.sunSign}**.`,
    );
    if (dasha?.currentMaha) {
      lines.push(
        `Current period: Mahadasha **${dasha.currentMaha}**${
          dasha.currentAntar ? ` · Antardasha **${dasha.currentAntar}**` : ""
        }.`,
      );
    }
    if (intent === "astrology" && raja[0]) {
      lines.push(`Notable yoga: **${raja[0].name}**.`);
    } else if (gochar?.highlights?.[0]) {
      lines.push(`Transit note: ${gochar.highlights[0]}`);
    }
  }

  lines.push("", "Ask a follow-up if you want one house, planet, or dasha explained more deeply.");

  return withVedicDisclaimer(lines.filter((l) => l !== undefined).join("\n"));
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

async function deterministicExplain(
  agent: VedaAgentKey,
  userId: string,
  message: string,
  intent?: QuestionIntent,
) {
  await connectMongo();
  const resolvedIntent = intent ?? classifyQuestionIntent(message);

  if (agent === "ASTROLOGER_GURU" || agent === "HOROSCOPE") {
    return guruDeterministicExplain(userId, message, resolvedIntent);
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
    case "MARRIAGE_TIMING":
    case "MARRIAGE_GURU": {
      try {
        const timing = await compatibilityService.marriageTimingForUser(userId);
        const top = timing.windows?.[0];
        const spouse = timing.spouseTendencies;
        if (agent === "MARRIAGE_GURU") {
          const lines = [
            `**Your question:** ${message.trim().slice(0, 220)}`,
            "",
            top
              ? `Stronger marriage window: **${top.label}** (${top.window}, score ${top.score}/100).`
              : "Generate kundli and dasha for marriage windows.",
            timing.currentMaha
              ? `Current Mahadasha **${timing.currentMaha}**${timing.currentAntar ? ` · Antardasha **${timing.currentAntar}**` : ""}.`
              : null,
            spouse
              ? `Chart leaning: **${spouse.marriagePathLabel}**; **${spouse.spouseOriginLabel}**.`
              : null,
            "Exact wedding day still needs classical panchang muhurta — this is directional guidance.",
          ].filter(Boolean);
          return withVedicDisclaimer(lines.join("\n"));
        }
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
      return guruDeterministicExplain(userId, message, resolvedIntent);
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

    const intent = classifyQuestionIntent(message);

    let answer: string;
    let modelUsed = "deterministic-explain";
    let tokenUsage = conversation.tokenUsage || { prompt: 0, completion: 0, total: 0 };

    const profile = await Profile.findOne({ userId, status: "ACTIVE" }).lean();
    const preferredLanguage =
      (profile?.localization?.aiLanguage as string | null | undefined) ||
      (profile?.localization?.language as string | null | undefined) ||
      "en";
    const languageInstruction = `Respond in the user's preferred language code "${preferredLanguage}". Keep Vedic terms (Kundli, Nakshatra, Dasha, Lagna, Guna Milan, Gochar, Yoga, Dosha) in canonical form with a short local explanation when helpful. Stay reflective — never invent planet positions, guna scores, or certainty about outcomes.`;

    // Fast path: math / greetings work even when LLM is down — and avoid identical chart spam.
    const mathAnswer = trySolveMath(message);
    if (
      mathAnswer &&
      (agent === "ASTROLOGER_GURU" || agent === "HOROSCOPE" || agent === "SUPPORT")
    ) {
      answer = withVedicDisclaimer(mathAnswer);
      modelUsed = "deterministic-direct";
    } else if (hasLlmCredentials()) {
      try {
        const agentInstance = vedaAgents[agent];
        const history = formatChatHistory(messages, { limit: 10, excludeLastUser: true });
        const prompt = [
          buildGuruSystemDirectives(intent),
          "Tools are already bound to the authenticated member — do not invent user ids.",
          allowlistedCandidate
            ? `An allowlisted candidate partner id is available for compatibility tools only: ${allowlistedCandidate}`
            : "No candidate partner in context; use list mode for compatibility history.",
          needsAstrologyTools(intent)
            ? "Call relevant astrology tools before stating chart facts."
            : "Do not call astrology tools for this message.",
          languageInstruction,
          "Keep it short: 3–6 sentences or up to 5 bullets unless the member asks for detail.",
          history ? `Recent conversation:\n${history}` : "This is the start of the conversation.",
          `Classified intent: ${intent}`,
          `Member message: ${message}`,
        ]
          .filter(Boolean)
          .join("\n\n");

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
        answer = await deterministicExplain(agent, userId, message, intent);
      }
    } else {
      answer = await deterministicExplain(agent, userId, message, intent);
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

  async marriageGuruBundle(userId: string) {
    await connectMongo();
    let timing: Awaited<ReturnType<typeof compatibilityService.marriageTimingForUser>> | null =
      null;
    try {
      timing = await compatibilityService.marriageTimingForUser(userId);
    } catch {
      timing = null;
    }

    const spouse = timing?.spouseTendencies;
    const topWindow = timing?.windows?.[0];
    const tp = timing?.timingPrediction;

    const [chart, dasha] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
    ]);

    let gochar: Awaited<ReturnType<typeof computeGocharForUser>> | null = null;
    try {
      gochar = await computeGocharForUser(userId);
    } catch {
      // gochar is optional for marriage guru
    }

    const yogas = chart?.yogas || [];
    const rajaYogas = yogas.filter((y: YogaItem) =>
      /raja|gajakesari|dharma.?karma|budhaditya|ruchaka/i.test(`${y.code} ${y.name}`),
    );

    const chartSummary = chart
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
      : null;

    const openingParts = [
      "Namaste. I am **Marriage AI Guru** — your matrimony specialist for vivaha timing, spouse themes, and alliance readiness.",
    ];
    if (topWindow) {
      openingParts.push(
        `A stronger marriage window on your chart: **${topWindow.label}** (${topWindow.window}).`,
      );
    }
    if (spouse) {
      openingParts.push(
        `Chart leaning: **${spouse.marriagePathLabel}** · **${spouse.spouseOriginLabel}**.`,
      );
    }
    if (tp) {
      openingParts.push(`Marry-now read: **${tp.marryNowTitle}** (${tp.marryNowScore}/100).`);
    }
    openingParts.push(
      "Ask about marriage timing, love vs arranged cues, manglik, or when to progress with a match — I stay focused on marriage only.",
    );

    return {
      hasChart: Boolean(chart),
      chartSummary,
      openingMessage: withVedicDisclaimer(openingParts.join(" ")),
      suggestedPrompts: [
        "When is my best marriage window?",
        "Love or arranged — what does my chart suggest?",
        "Is now a good time to seek a partner?",
        "What should I look for in a spouse?",
        "How does manglik affect my marriage timing?",
        "Will my current dasha support marriage this year?",
        "What does my 7th house say about partnership?",
        "When should I progress with a match?",
      ],
      marriageWindows: (timing?.windows || []).slice(0, 5),
      spouseTendencies: spouse || null,
      marryNow: tp
        ? {
            score: tp.marryNowScore,
            title: tp.marryNowTitle,
            reason: tp.marryNowReason,
            verdict: tp.marryNowVerdict,
          }
        : null,
      currentMaha: timing?.currentMaha || dasha?.currentMaha || null,
      currentAntar: timing?.currentAntar || dasha?.currentAntar || null,
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
      gochar: gochar
        ? {
            asOf: gochar.asOf,
            transitAscendant: gochar.natalLagna,
            natalLagna: gochar.natalLagna,
            highlights: gochar.highlights,
            planets: (gochar.planets || []).map((p) => ({
              planet: p.planet,
              sign: p.sign,
              houseFromNatalLagna: p.houseFromNatalLagna,
              nakshatra: p.nakshatra || "",
              isRetrograde: p.isRetrograde || false,
              note: p.note || "",
            })),
          }
        : null,
      disclaimer: VEDIC_AI_DISCLAIMER,
    };
  }
}

export const aiService = new AiService();
