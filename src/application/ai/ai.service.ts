import { withVedicDisclaimer, VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import { AiConversation, Horoscope, Dasha, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { compatibilityService } from "@/application/rules/compatibility.service";
import { matchmakingService } from "@/application/matchmaking/matchmaking.service";
import { vedaAgents, type VedaAgentKey } from "@/mastra/agents/veda-agents";

function hasLlmCredentials(): boolean {
  return Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY,
  );
}

async function deterministicExplain(agent: VedaAgentKey, userId: string, message: string) {
  await connectMongo();

  switch (agent) {
    case "HOROSCOPE": {
      const [chart, dasha] = await Promise.all([
        Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
        Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      ]);
      if (!chart) {
        return withVedicDisclaimer(
          "No stored kundli yet. Open Birth Details, save your chart inputs, then generate your kundli so I can explain your Moon, Lagna, and dasha periods.",
        );
      }
      return withVedicDisclaimer(
        [
          `Your chart shows Lagna in ${chart.lagnaSign}, Moon in ${chart.moonSign}, and Sun in ${chart.sunSign}.`,
          `Manglik status from the rule engine: ${chart.manglikStatus}.`,
          dasha
            ? `Current Mahadasha is ${dasha.currentMaha}${dasha.currentAntar ? ` with Antardasha ${dasha.currentAntar}` : ""}.`
            : "Dasha timelines will appear after dasha calculation.",
          "Focus next on reviewing yogas/doshas on your kundli page and completing preferences for better matches.",
          `You asked: ${message}`,
        ].join(" "),
      );
    }
    case "COMPATIBILITY": {
      const reports = await compatibilityService.listForUser(userId);
      if (!reports.length) {
        return withVedicDisclaimer(
          "No compatibility reports yet. Open Compatibility, enter a candidate user id, and run Ashta Koota — then I can explain strengths and challenges.",
        );
      }
      const r = reports[0]!;
      return withVedicDisclaimer(
        `Your latest Ashta Koota score is ${r.totalGuna}/${r.maxGuna} (${r.overallScore}% overall). Strengths: ${r.strengths?.join("; ") || "see report"}. Challenges: ${r.challenges?.join("; ") || "see report"}. Manglik note: ${r.manglikCompatibility || "n/a"}.`,
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
      const profile = await Profile.findOne({ userId }).lean();
      return withVedicDisclaimer(
        `Thanks for reaching out. ${profile ? "I can see your profile context." : "Complete your profile for tailored guidance."} Ask about kundli, compatibility, marriage timing, or match recommendations — I only explain rule-engine results.`,
      );
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
      messages: (updated?.messages || messages).slice(-20),
    };
  }

  async listConversations(userId: string, agent?: VedaAgentKey) {
    await connectMongo();
    const query: Record<string, unknown> = { userId, status: "ACTIVE" };
    if (agent) query.agent = agent;
    return AiConversation.find(query).sort({ updatedAt: -1 }).limit(30).lean();
  }

  async insightsBundle(userId: string) {
    const [horoscope, compatibility, recommendations, profile] = await Promise.all([
      deterministicExplain("HOROSCOPE", userId, "Summarize my chart"),
      deterministicExplain("COMPATIBILITY", userId, "Summarize compatibility"),
      deterministicExplain("RECOMMENDATION", userId, "Recommend next steps"),
      deterministicExplain("PROFILE_ANALYSIS", userId, "Analyze my profile"),
    ]);

    return {
      insights: [
        {
          id: "horoscope",
          title: "Chart explanation",
          tags: ["Kundli"],
          body: horoscope,
          confidence: 92,
        },
        {
          id: "compatibility",
          title: "Compatibility narrative",
          tags: ["Ashta Koota"],
          body: compatibility,
          confidence: 90,
        },
        {
          id: "recommendations",
          title: "Recommended next moves",
          tags: ["Matchmaking"],
          body: recommendations,
          confidence: 88,
        },
        {
          id: "profile",
          title: "Profile coaching",
          tags: ["Profile"],
          body: profile,
          confidence: 86,
        },
      ],
      disclaimer: VEDIC_AI_DISCLAIMER,
    };
  }
}

export const aiService = new AiService();
