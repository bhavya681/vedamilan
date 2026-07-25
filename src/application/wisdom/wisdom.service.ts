import { withWisdomDisclaimer, WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";
import { AiConversation, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { runWithAiToolContext } from "@/application/ai/ai-tool-context";
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

export class WisdomService {
  async chat(input: {
    userId: string;
    guideId: string;
    message: string;
    conversationId?: string;
    topic?: string;
    includeLifeContext?: boolean;
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
    const preferredLanguage =
      (profile?.localization?.aiLanguage as string | null | undefined) ||
      (profile?.localization?.language as string | null | undefined) ||
      "en";

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

    if (hasLlmCredentials()) {
      try {
        const agentInstance = vedaAgents.WISDOM_GUIDE;
        const prompt = [
          buildGuideSystemContext(guide),
          `Respond in language code "${preferredLanguage}". Keep Sanskrit names accurate.`,
          input.topic ? `Suggested topic focus: ${input.topic}` : "",
          lifeContext,
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
          "For each guide below, write a short perspective inspired by their traditional themes.",
          "Never invent quotations. Label each block clearly. End with a Modern Reflection section.",
          `Respond in language code "${preferredLanguage}".`,
          "",
          ...guides.map(
            (g) =>
              `Guide: ${g.displayName} (${g.role})\nSources: ${g.primarySources.join(", ")}\nThemes: ${g.coreTeachings.join("; ")}`,
          ),
          "",
          `Member question: ${input.message}`,
          "",
          "Format:",
          guides.map((g) => `### ${g.displayName}'s Perspective\n(AI interpretation)`).join("\n"),
          "### Modern Reflection",
          "One closing reflection question.",
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
    const blocks = guides.map((g) =>
      [
        `### ${g.displayName}'s Perspective`,
        `*(AI interpretation inspired by ${g.primarySources[0] || "traditional teachings"})*`,
        "",
        g.coreTeachings[0],
        "",
        g.shortPhilosophy,
      ].join("\n"),
    );
    return [
      ...blocks,
      "### Modern Reflection",
      `Regarding your question — “${message.slice(0, 160)}” — notice which perspective feels most truthful for your values today, not which sounds most impressive.`,
      "",
      "**Reflect:** What outcome would align with your integrity this week?",
    ].join("\n\n");
  }

  dailyReflection() {
    return wisdomDailyReflection();
  }
}

export const wisdomService = new WisdomService();
