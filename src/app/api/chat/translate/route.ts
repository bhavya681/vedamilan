import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { APP_LOCALES, LOCALE_META, isAppLocale } from "@/lib/i18n/locales";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

const schema = z.object({
  text: z.string().trim().min(1).max(4000),
  targetLocale: z.enum(APP_LOCALES),
  sourceLocale: z.string().optional(),
});

/**
 * Optional chat translation — never overwrites the original message.
 * Uses LLM when available; otherwise returns a clear unavailable payload.
 */
export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) throw new ValidationError("Invalid translation request");

    const { text, targetLocale } = parsed.data;
    const targetName = LOCALE_META[targetLocale].englishName;

    const openaiKey = process.env.OPENAI_API_KEY;
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!openaiKey && !googleKey) {
      return successResponse({
        originalText: text,
        translatedText: null,
        targetLocale,
        provider: null,
        label: "Translated by VedaMilan AI",
        available: false,
        message: "Translation is temporarily unavailable. The original message is unchanged.",
      });
    }

    // Lightweight OpenAI path when configured — preserve original forever on the client.
    if (openaiKey) {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: openaiKey });
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_TRANSLATE_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You translate matrimony chat messages into ${targetName} (${targetLocale}). Preserve meaning and emotional tone. Keep Vedic terms like Kundli, Nakshatra, Dasha, Lagna, Guna Milan in canonical form. Return only the translation.`,
          },
          { role: "user", content: text },
        ],
      });
      const translatedText = completion.choices[0]?.message?.content?.trim() || null;
      return successResponse({
        originalText: text,
        translatedText,
        targetLocale,
        provider: "openai",
        label: "Translated by VedaMilan AI",
        available: Boolean(translatedText),
        requestedBy: session.user.id,
      });
    }

    // Google Generative AI fallback via REST if OpenAI is absent.
    if (googleKey && isAppLocale(targetLocale)) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Translate into ${targetName}. Keep Kundli/Nakshatra/Dasha/Lagna/Guna Milan canonical. Return only translation:\n\n${text}`,
                  },
                ],
              },
            ],
          }),
        },
      );
      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const translatedText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
      return successResponse({
        originalText: text,
        translatedText,
        targetLocale,
        provider: "google",
        label: "Translated by VedaMilan AI",
        available: Boolean(translatedText),
        requestedBy: session.user.id,
      });
    }

    return successResponse({
      originalText: text,
      translatedText: null,
      targetLocale,
      available: false,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
