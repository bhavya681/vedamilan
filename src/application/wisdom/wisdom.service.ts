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
import { LIFE_NEEDS } from "@/domain/wisdom/sage-alignment";
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

  async askTheSages(input: { userId: string; message: string; guideIds: string[]; need?: string }) {
    const ids = input.guideIds.slice(0, 3);
    const guides = ids.map((id) => getWisdomGuide(id)).filter((g): g is WisdomGuide => Boolean(g));
    if (guides.length < 2) {
      throw new Error("Select at least two wisdom guides");
    }
    const needLabel =
      LIFE_NEEDS.find((item) => item.id === input.need)?.label?.toLowerCase() ?? null;

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
          "The member may ask about ordinary life: work, family, conflict, habits, money pressure, or a hard decision. Answer the practical question first; use the guide's tradition as a lens, not a sermon.",
          "Do not assume the member is Hindu, married, Indian, or familiar with Sanskrit terms. Explain any traditional term briefly and never pressure a religious conclusion.",
          "Do NOT paste biographies or the same generic advice for every guide.",
          "Never invent quotations. Label each block as AI interpretation.",
          "If the question involves a decision, name the real trade-off and give one action the member can take within a week.",
          "Do not give medical, legal, or financial directives; suggest a qualified professional when that is the responsible answer.",
          `Respond in language code "${preferredLanguage}".`,
          needLabel ? `Life area selected by the member: ${needLabel}.` : "",
          "",
          ...guides.map(
            (g) =>
              `Guide: ${g.displayName} (${g.role})\nSources: ${g.primarySources.join(", ")}\nThemes: ${g.coreTeachings.join("; ")}`,
          ),
          "",
          `Member question: ${input.message}`,
          "",
          "Format rules:",
          "- For each guide: 2–4 sentences that directly address the question, one honest trade-off, and 1 concrete next step.",
          "- Perspectives must disagree or complement — not repeat the same paragraph in different names.",
          "- Keep the total response under ~450 words.",
          "- End with ### Modern Reflection: synthesize the practical choice, name one step for this week, and ask one reflection question.",
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
            : this.fallbackCouncil(guides, input.message, input.need);
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
      answer: withWisdomDisclaimer(this.fallbackCouncil(guides, input.message, input.need)),
      disclaimer: WISDOM_AI_DISCLAIMER,
      guides: guides.map((g) => ({ id: g.id, name: g.displayName, sources: g.primarySources })),
      model: "deterministic-wisdom",
    };
  }

  private fallbackCouncil(guides: WisdomGuide[], message: string, need?: string) {
    const q = message.trim();
    const snippet = q.length > 140 ? `${q.slice(0, 140).trim()}…` : q;
    const words = new Set(
      q
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter(Boolean),
    );
    const hasAny = (terms: string[]) => terms.some((term) => words.has(term));
    const theme = hasAny(["family", "parent", "mother", "father", "sibling", "duty", "expectation"])
      ? "a family responsibility"
      : hasAny(["work", "career", "job", "business", "money", "promotion", "colleague", "boss"])
        ? "a work decision"
        : hasAny([
              "partner",
              "spouse",
              "love",
              "relationship",
              "marriage",
              "friend",
              "conflict",
              "argument",
            ])
          ? "a relationship"
          : "a personal decision";
    const needPractice: Record<string, string> = {
      relationship:
        "Write the one sentence you are avoiding saying, then say it calmly without blame.",
      career:
        "Name the real trade-off in one sentence, then write what you would need to see before deciding.",
      inner:
        "Take a ten-minute pause before explaining or fixing anything; write down what is actually yours to carry.",
      duty: "Separate what you owe from what you fear disappointing. Choose one honest boundary this week.",
      inquiry:
        "Write down one value you chose for yourself, not one inherited by default. Act from it once this week.",
      astrology:
        "Separate what you can control from what you must endure. Take one practical step in the controllable part.",
    };
    const angles = [
      "Start by naming the actual choice and what you are afraid to lose.",
      "Look at who else is affected and what trust requires of you.",
      "Choose the smallest honest action you can take within a day.",
    ];
    const practices = [
      "Write the decision in one sentence, then list the two costs you are avoiding.",
      "Identify the person or promise this touches, and decide what you will not sacrifice.",
      "Do the smallest reversible action today that gives you new information.",
    ];
    const blocks = guides.map((g, index) => {
      const teaching =
        g.coreTeachings[index % Math.max(g.coreTeachings.length, 1)] ||
        g.coreTeachings[0] ||
        "Act with clarity and responsibility.";
      return [
        `### ${g.displayName}'s Perspective`,
        `*(AI interpretation inspired by ${g.primarySources[0] || "traditional teachings"})*`,
        "",
        `You are carrying ${theme}. This tradition begins with: ${teaching} ${angles[index % angles.length]}`,
        `**Next step:** ${practices[index % practices.length]}`,
      ].join("\n");
    });
    const practice = needPractice[need ?? ""] || practices[0];
    return [
      ...blocks,
      "### Modern Reflection",
      `Your question — “${snippet}” — touches ${theme}. The council is not asking you to feel certain; it is asking you to be honest about the trade-off and act on what you can actually control.`,
      "",
      `**This week:** ${practice}`,
      "",
      "**Reflect:** Which option would you still respect in six months if it did not go perfectly?",
    ].join("\n\n");
  }

  dailyReflection() {
    return wisdomDailyReflection();
  }
}

export const wisdomService = new WisdomService();
