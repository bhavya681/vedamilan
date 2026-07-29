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
} from "@/application/ai/chat-intent";
import { remediesForDoshas, REMEDY_DISCLAIMER } from "@/application/horoscope/remedy-themes";
import {
  astrologerDeterministicReply,
  buildAstrologerSystemContext,
  getVirtualAstrologer,
  type VirtualAstrologer,
} from "@/domain/consultation/virtual-astrologers";
import { vedaAgents } from "@/mastra/agents/veda-agents";

function hasLlmCredentials(): boolean {
  return Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY,
  );
}

function buildLanguageDirective(code: string): string {
  switch (code) {
    case "hi":
      return "Respond entirely in Hindi (हिन्दी) using Devanagari script. Keep Sanskrit names accurate.";
    case "mr":
      return "Respond entirely in Marathi (मराठी) using Devanagari script. Keep Sanskrit names accurate.";
    case "es":
      return "Respond entirely in Spanish. Keep Sanskrit names accurate.";
    case "en":
      return "Respond in clear English. Keep Sanskrit names accurate.";
    default:
      return `Respond in language code "${code}". Keep Sanskrit names accurate.`;
  }
}

async function loadChartRemedyContext(userId: string): Promise<{
  chartSummary: string | null;
  remedyBlock: string;
}> {
  await connectMongo();
  const [chart, dasha] = await Promise.all([
    Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
    Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
  ]);

  if (!chart) {
    return { chartSummary: null, remedyBlock: "" };
  }

  const chartSummary = [
    `Stored kundli: Lagna ${chart.lagnaSign}, Moon ${chart.moonSign}, Sun ${chart.sunSign}.`,
    dasha?.currentMaha
      ? `Current Mahadasha ${dasha.currentMaha}${
          dasha.currentAntar ? ` / Antardasha ${dasha.currentAntar}` : ""
        }.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const themes = remediesForDoshas(
    (chart.doshas || []).map((d) => ({
      code: d.code,
      present: d.present !== false,
      severity: d.severity ?? null,
    })),
  );

  const remedyBlock =
    themes.length > 0
      ? [
          "Engine-flagged remedial themes (use only these; do not invent others):",
          ...themes.map(
            (t) =>
              `- ${t.planetaryFactor}: ${t.possibleRemedy} (${t.reason}). Practice: ${t.durationPractice}`,
          ),
          REMEDY_DISCLAIMER,
        ].join("\n")
      : "No engine-flagged dosha remedies for this chart. Prefer lifestyle/discipline guidance; do not invent dosha remedies.";

  return { chartSummary, remedyBlock };
}

export class VirtualAstrologerService {
  async chat(input: {
    userId: string;
    astrologerId: string;
    message: string;
    conversationId?: string;
    language?: string;
    channel?: "text" | "voice";
  }) {
    await connectMongo();
    const astrologer = getVirtualAstrologer(input.astrologerId);
    if (!astrologer) {
      throw new Error("Unknown virtual astrologer");
    }

    let conversation = input.conversationId
      ? await AiConversation.findById(input.conversationId).where({
          userId: input.userId,
          agent: "VIRTUAL_ASTROLOGER",
        })
      : null;

    if (!conversation) {
      conversation = await AiConversation.create({
        userId: input.userId,
        agent: "VIRTUAL_ASTROLOGER",
        title: `${astrologer.displayName}: ${input.message.slice(0, 60)}`,
        messages: [],
        contextRefs: {
          astrologerId: astrologer.id,
          tradition: astrologer.tradition,
        },
        model: hasLlmCredentials() ? "llm" : "deterministic-astrologer",
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
        content: input.message,
        toolName: null,
        createdAt: new Date(),
      },
    ];

    const profile = await Profile.findOne({ userId: input.userId, status: "ACTIVE" }).lean();
    const sessionLanguage = input.language && input.language !== "auto" ? input.language : null;
    const preferredLanguage =
      sessionLanguage ||
      (profile?.localization?.aiLanguage as string | null | undefined) ||
      (profile?.localization?.language as string | null | undefined) ||
      "en";
    const languageDirective = buildLanguageDirective(preferredLanguage);

    const { chartSummary, remedyBlock } = await loadChartRemedyContext(input.userId);
    const intent = classifyQuestionIntent(input.message);

    let answer: string;
    let modelUsed = "deterministic-astrologer";
    let tokenUsage = conversation.tokenUsage || { prompt: 0, completion: 0, total: 0 };

    const mathAnswer = trySolveMath(input.message);
    if (mathAnswer) {
      answer = withVedicDisclaimer(mathAnswer);
      modelUsed = "deterministic-direct";
    } else if (hasLlmCredentials()) {
      try {
        const agentInstance = vedaAgents.VIRTUAL_ASTROLOGER;
        const history = formatChatHistory(messages, { limit: 8, excludeLastUser: true });
        const isVoice = input.channel === "voice";
        const prompt = [
          buildAstrologerSystemContext(astrologer),
          buildGuruSystemDirectives(intent),
          languageDirective,
          remedyBlock,
          isVoice
            ? [
                "CHANNEL: VOICE CONSULTATION — reply will be spoken aloud.",
                "Speak only the answer. No greetings, no section headings, no disclaimer text.",
                "Max ~90 words. First sentence answers their exact ask. Then one remedy or next step if relevant.",
              ].join("\n")
            : "",
          history ? `Recent conversation:\n${history}` : "This is the start of the consultation.",
          `Classified intent: ${intent}`,
          needsAstrologyTools(intent)
            ? "Call chart tools before stating Vedic facts."
            : "Answer directly; only call tools if chart facts are needed.",
          isVoice
            ? "TASK: Short spoken professional astrology answer."
            : "TASK: Professional astrology consultation answer grounded in tools + tradition lens.",
          "Member question:",
          input.message,
        ]
          .filter(Boolean)
          .join("\n\n");

        const result = await runWithAiToolContext({ sessionUserId: input.userId }, () =>
          agentInstance.generate(prompt),
        );
        answer = withVedicDisclaimer(
          typeof result.text === "string" && result.text.trim()
            ? result.text
            : astrologerDeterministicReply(astrologer, input.message, chartSummary),
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
        console.error("Virtual astrologer generate failed", error);
        answer = withVedicDisclaimer(
          astrologerDeterministicReply(astrologer, input.message, chartSummary),
        );
      }
    } else {
      answer = withVedicDisclaimer(
        this.deterministicWithRemedies(astrologer, input.message, chartSummary, remedyBlock),
      );
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
          agent: "VIRTUAL_ASTROLOGER",
          contextRefs: {
            ...(conversation.contextRefs as object),
            astrologerId: astrologer.id,
            tradition: astrologer.tradition,
          },
        },
      },
      { new: true },
    );

    return {
      conversationId: String(conversation._id),
      astrologerId: astrologer.id,
      astrologerName: astrologer.displayName,
      tradition: astrologer.tradition,
      answer,
      disclaimer: VEDIC_AI_DISCLAIMER,
      model: modelUsed,
      sources: astrologer.primarySources,
      messages: (updated?.messages || messages).slice(-40),
    };
  }

  private deterministicWithRemedies(
    astrologer: VirtualAstrologer,
    message: string,
    chartSummary: string | null,
    remedyBlock: string,
  ) {
    const base = astrologerDeterministicReply(astrologer, message, chartSummary);
    if (!remedyBlock || remedyBlock.startsWith("No engine-flagged")) return base;
    return [base, "", "Suggested remedial themes from your chart flags:", remedyBlock].join("\n");
  }
}

export const virtualAstrologerService = new VirtualAstrologerService();
