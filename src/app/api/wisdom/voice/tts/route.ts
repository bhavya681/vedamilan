import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { assertVoiceQuota } from "@/application/wisdom/voice-quota.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  text: z.string().min(1).max(4000),
  voice: z
    .enum(["alloy", "ash", "coral", "echo", "fable", "onyx", "nova", "sage", "shimmer"])
    .default("sage"),
  language: z.enum(["en", "hi", "mr", "es", "auto"]).optional(),
});

/**
 * Server TTS — OpenAI when OPENAI_API_KEY is set.
 * Returns audio/mpeg. Falls back with 204 so the client uses browser synthesis.
 * Raw microphone audio is never accepted here (text only).
 */
export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({
      key: `wisdom:voice:tts:${session.user.id}`,
      limit: 30,
      windowSec: 60,
    });
    await assertVoiceQuota(session.user.id, 5);

    const body = schema.parse(await request.json());
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(null, { status: 204 });
    }

    const cleaned = body.text
      .replace(/Vedic Wisdom provides educational[\s\S]*$/i, "")
      .trim()
      .slice(0, 3500);
    if (!cleaned) throw new ValidationError("Empty speech text");

    const openaiRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || "tts-1",
        voice: body.voice,
        input: cleaned,
        response_format: "mp3",
      }),
    });

    if (!openaiRes.ok) {
      // Client will fall back to browser TTS
      return new Response(null, { status: 204 });
    }

    const audio = await openaiRes.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Capability probe for clients */
export async function GET() {
  try {
    await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    return successResponse({
      serverTts: Boolean(process.env.OPENAI_API_KEY),
      provider: process.env.OPENAI_API_KEY ? "openai" : "browser-fallback",
      storesRawAudio: false,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
