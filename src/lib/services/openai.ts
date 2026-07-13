import OpenAI from "openai";

import { AppError } from "@/lib/utils/error-handler";
import { requireEnvValue } from "@/lib/utils/env";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class OpenAIService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (this.client) return this.client;
    const apiKey = requireEnvValue(process.env.OPENAI_API_KEY, "OPENAI_API_KEY");
    this.client = new OpenAI({ apiKey });
    return this.client;
  }

  private getModel(): string {
    return process.env.OPENAI_MODEL || "gpt-4o";
  }

  async chatCompletion(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    },
  ): Promise<string> {
    try {
      const response = await this.getClient().chat.completions.create({
        model: options?.model ?? this.getModel(),
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError("OPENAI_EMPTY_RESPONSE", "OpenAI returned an empty response", 502);
      }
      return content;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("OPENAI_REQUEST_FAILED", "OpenAI request failed", 502, error);
    }
  }

  async generateEmbedding(input: string, model = "text-embedding-3-small"): Promise<number[]> {
    try {
      const response = await this.getClient().embeddings.create({
        model,
        input,
      });
      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new AppError("OPENAI_EMPTY_EMBEDDING", "OpenAI returned an empty embedding", 502);
      }
      return embedding;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("OPENAI_EMBEDDING_FAILED", "Failed to generate embedding", 502, error);
    }
  }
}

export const openaiService = new OpenAIService();
