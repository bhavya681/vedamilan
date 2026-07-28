import { withWisdomDisclaimer, WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";
import { AiConversation, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { runWithAiToolContext } from "@/application/ai/ai-tool-context";
import {
  buildWisdomSystemDirectives,
  classifyQuestionIntent,
  formatChatHistory,
  trySolveMath,
} from "@/application/ai/chat-intent";
import {
  buildGuideSystemContext,
  getWisdomGuide,
  wisdomDailyReflection,
  wisdomDeterministicReply,
  type WisdomGuide,
} from "@/domain/wisdom/guides";
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
      return "Respond entirely in Hindi (हिन्दी) using Devanagari script. Keep Sanskrit names accurate. Do not reply in English unless the member explicitly asks for English.";
    case "mr":
      return "Respond entirely in Marathi (मराठी) using Devanagari script. Keep Sanskrit names accurate. Do not reply in English unless the member explicitly asks for English.";
    case "es":
      return "Respond entirely in Spanish. Keep Sanskrit names accurate.";
    case "en":
      return "Respond in clear English. Keep Sanskrit names accurate.";
    default:
      return `Respond in language code "${code}". Keep Sanskrit names accurate.`;
  }
}

export class WisdomService {
  async chat(input: {
    userId: string;
    guideId: string;
    message: string;
    conversationId?: string;
    topic?: string;
    includeLifeContext?: boolean;
    /** Override profile language (e.g. voice satsang language chip). */
    language?: string;
    /** Voice channel: short spoken answers, no sermon template. */
    channel?: "text" | "voice";
  }) {
    await connectMongo();
    const guide = getWisdomGuide(input.guideId);
    if (!guide) {
      throw new Error("Unknown wisdom guide");
    }

    let conversation = input.conversationId
      ? await AiConversation.findById(input.conversationId).where({
          userId: input.userId,
          agent: "WISDOM_GUIDE",
        })
      : null;

    if (!conversation) {
      conversation = await AiConversation.create({
        userId: input.userId,
        agent: "WISDOM_GUIDE",
        title: `${guide.displayName}: ${input.message.slice(0, 60)}`,
        messages: [],
        contextRefs: {
          guideId: guide.id,
          topic: input.topic || null,
        },
        model: hasLlmCredentials() ? "llm" : "deterministic-wisdom",
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

    let lifeContext = "";
    if (input.includeLifeContext && profile) {
      const bits = [
        profile.profession ? `Profession context: ${profile.profession}` : null,
        profile.city ? `City: ${profile.city}` : null,
        profile.headline ? `Profile focus: seeking thoughtful alignment` : null,
      ].filter(Boolean);
      if (bits.length) {
        lifeContext = `Optional member life context (use gently for reflection only; never claim destiny):\n${bits.join("\n")}`;
      }
    }

    let answer: string;
    let modelUsed = "deterministic-wisdom";
    let tokenUsage = conversation.tokenUsage || { prompt: 0, completion: 0, total: 0 };

    const intent = classifyQuestionIntent(input.message);
    const mathAnswer = trySolveMath(input.message);
    if (mathAnswer) {
      answer = withWisdomDisclaimer(
        [
          mathAnswer,
          "",
          `*(Optional lens inspired by ${guide.displayName}: clarity in small truths trains clarity in larger choices.)*`,
        ].join("\n"),
      );
      modelUsed = "deterministic-direct";
    } else if (hasLlmCredentials()) {
      try {
        const agentInstance = vedaAgents.WISDOM_GUIDE;
        const history = formatChatHistory(messages, { limit: 8, excludeLastUser: true });
        const isVoice = input.channel === "voice";
        const prompt = [
          buildGuideSystemContext(guide),
          buildWisdomSystemDirectives(intent),
          languageDirective,
          isVoice
            ? [
                "CHANNEL: VOICE SATSANG — your reply will be spoken aloud.",
                "Speak only the answer to THIS question. No greetings, no biography, no section headings, no disclaimer.",
                "Max ~90 words. First sentence must answer their exact ask. Then one concrete next step.",
                "Do not say 'you asked' or repeat the question. Do not give a generic nice sermon.",
              ].join("\n")
            : "",
          input.topic ? `Suggested topic focus: ${input.topic}` : "",
          lifeContext,
          history
            ? `Recent conversation (do not repeat the same answer pattern):\n${history}`
            : "This is the start of the conversation.",
          `Classified intent: ${intent}`,
          isVoice
            ? "TASK: Give a short spoken answer to the member question. Relevant and specific — not pleasant filler."
            : "TASK: Answer the member question below directly and specifically. First sentences must address their exact ask. No generic sermon.",
          "Member question:",
          input.message,
        ]
          .filter(Boolean)
          .join("\n\n");

        const result = await runWithAiToolContext({ sessionUserId: input.userId }, () =>
          agentInstance.generate(prompt),
        );
        answer = withWisdomDisclaimer(
          typeof result.text === "string" && result.text.trim()
            ? result.text
            : wisdomDeterministicReply(guide, input.message),
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
        console.error("Wisdom generate failed", error);
        answer = withWisdomDisclaimer(wisdomDeterministicReply(guide, input.message));
      }
    } else {
      answer = withWisdomDisclaimer(wisdomDeterministicReply(guide, input.message));
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
          agent: "WISDOM_GUIDE",
          contextRefs: {
            ...(conversation.contextRefs as object),
            guideId: guide.id,
            topic: input.topic || null,
          },
        },
      },
      { new: true },
    );

    return {
      conversationId: String(conversation._id),
      guideId: guide.id,
      guideName: guide.displayName,
      answer,
      disclaimer: WISDOM_AI_DISCLAIMER,
      model: modelUsed,
      sources: guide.primarySources,
      messages: (updated?.messages || messages).slice(-40),
    };
  }

  async askTheSages(input: { userId: string; message: string; guideIds: string[] }) {
    const ids = input.guideIds.slice(0, 3);
    const guides = ids.map((id) => getWisdomGuide(id)).filter((g): g is WisdomGuide => Boolean(g));
    if (guides.length < 2) {
      throw new Error("Select at least two wisdom guides");
    }

    await connectMongo();
    const profile = await Profile.findOne({ userId: input.userId, status: "ACTIVE" }).lean();
    const preferredLanguage =
      (profile?.localization?.aiLanguage as string | null | undefined) ||
      (profile?.localization?.language as string | null | undefined) ||
      "en";

    if (hasLlmCredentials()) {
      try {
        const agentInstance = vedaAgents.WISDOM_GUIDE;
        const prompt = [
          "You are facilitating an 'Ask the Sages' reflective council for VedaMilan.",
          "Each guide must answer the SAME member question from their own angle — concrete and different from the others.",
          "Do NOT paste biographies or the same generic advice for every guide.",
          "Never invent quotations. Label each block as AI interpretation.",
          `Respond in language code "${preferredLanguage}".`,
          "",
          ...guides.map(
            (g) =>
              `Guide: ${g.displayName} (${g.role})\nSources: ${g.primarySources.join(", ")}\nThemes: ${g.coreTeachings.join("; ")}`,
          ),
          "",
          `Member question: ${input.message}`,
          "",
          "Format rules:",
          "- For each guide: 3–5 sentences that directly address the question + 1 concrete next step.",
          "- Perspectives must disagree or complement — not repeat the same paragraph in different names.",
          "- End with ### Modern Reflection: synthesize what the member should do this week + one reflection question.",
          "",
          "Format:",
          guides.map((g) => `### ${g.displayName}'s Perspective\n(AI interpretation)`).join("\n"),
          "### Modern Reflection",
        ].join("\n");

        const result = await runWithAiToolContext({ sessionUserId: input.userId }, () =>
          agentInstance.generate(prompt),
        );
        const text =
          typeof result.text === "string" && result.text.trim()
            ? result.text
            : this.fallbackCouncil(guides, input.message);
        return {
          answer: withWisdomDisclaimer(text),
          disclaimer: WISDOM_AI_DISCLAIMER,
          guides: guides.map((g) => ({ id: g.id, name: g.displayName, sources: g.primarySources })),
          model: "mastra-llm",
        };
      } catch (error) {
        console.error("Ask the Sages failed", error);
      }
    }

    return {
      answer: withWisdomDisclaimer(this.fallbackCouncil(guides, input.message)),
      disclaimer: WISDOM_AI_DISCLAIMER,
      guides: guides.map((g) => ({ id: g.id, name: g.displayName, sources: g.primarySources })),
      model: "deterministic-wisdom",
    };
  }

  private fallbackCouncil(guides: WisdomGuide[], message: string) {
    const q = message.trim();
    const snippet = q.length > 140 ? `${q.slice(0, 140).trim()}…` : q;
    const blocks = guides.map((g, index) => {
      const teaching =
        g.coreTeachings[index % Math.max(g.coreTeachings.length, 1)] ||
        g.coreTeachings[0] ||
        "Act with clarity and responsibility.";
      const angle =
        index === 0
          ? "Focus on the immediate choice in front of you."
          : index === 1
            ? "Protect long-term trust and dignity, not short-term ego."
            : "Take the smallest practical next step within a day.";
      return [
        `### ${g.displayName}'s Perspective`,
        `*(AI interpretation inspired by ${g.primarySources[0] || "traditional teachings"})*`,
        "",
        `On your question — “${snippet}” — ${angle}`,
        teaching,
        `Next step: apply this to your situation today, not as abstract philosophy.`,
      ].join("\n");
    });
    return [
      ...blocks,
      "### Modern Reflection",
      `Your question was: “${snippet}”. Compare the perspectives above and pick the one action that best protects your integrity this week.`,
      "",
      "**Reflect:** What will you do in the next 24 hours that answers this question in deeds, not words?",
    ].join("\n\n");
  }

  dailyReflection() {
    return wisdomDailyReflection();
  }
}

export const wisdomService = new WisdomService();
