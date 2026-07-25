import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { getWisdomGuide } from "@/domain/wisdom/guides";
import { getVoicePersona, VOICE_PRIVACY_NOTICE } from "@/domain/wisdom/voice-persona";
import {
  assertVoiceQuota,
  createVoiceSessionRecord,
  getVoiceUsageToday,
  recordVoiceUsage,
} from "@/application/wisdom/voice-quota.service";
import { wisdomService } from "@/application/wisdom/wisdom.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const startSchema = z.object({
  guideId: z.string().min(1),
  language: z.enum(["en", "hi", "mr", "es", "auto"]).default("en"),
});

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const usage = await getVoiceUsageToday(session.user.id);
    const { remaining, limit } = await assertVoiceQuota(session.user.id, 0);
    return successResponse({
      usage,
      remainingSeconds: remaining,
      dailyLimitSeconds: limit,
      storesRawAudio: false,
      privacyNotice: VOICE_PRIVACY_NOTICE,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({
      key: `wisdom:voice:session:${session.user.id}`,
      limit: 20,
      windowSec: 60,
    });
    const body = startSchema.parse(await request.json());
    if (!getWisdomGuide(body.guideId)) throw new ValidationError("Unknown guide");
    const started = await createVoiceSessionRecord({
      userId: session.user.id,
      guideId: body.guideId,
      language: body.language,
    });
    return successResponse({
      ...started,
      persona: getVoicePersona(body.guideId),
      privacyNotice: VOICE_PRIVACY_NOTICE,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

const turnSchema = z.object({
  guideId: z.string().min(1),
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  sessionId: z.string().optional(),
  language: z.enum(["en", "hi", "mr", "es", "auto"]).optional(),
  includeLifeContext: z.boolean().optional(),
  /** Approximate seconds of user speech for quota accounting */
  speechSeconds: z.number().min(0).max(120).optional(),
});

export async function PUT(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({
      key: `wisdom:voice:turn:${session.user.id}`,
      limit: 20,
      windowSec: 60,
    });
    const body = turnSchema.parse(await request.json());
    if (!getWisdomGuide(body.guideId)) throw new ValidationError("Unknown guide");
    await assertVoiceQuota(session.user.id, body.speechSeconds || 10);

    const result = await wisdomService.chat({
      userId: session.user.id,
      guideId: body.guideId,
      message: body.message,
      conversationId: body.conversationId,
      includeLifeContext: body.includeLifeContext,
    });

    const approxTtsSeconds = Math.ceil(result.answer.length / 14);
    await recordVoiceUsage(session.user.id, {
      seconds: (body.speechSeconds || 8) + Math.min(45, approxTtsSeconds),
      sessionId: body.sessionId,
    });

    const { remaining, limit } = await assertVoiceQuota(session.user.id, 0);

    return successResponse({
      ...result,
      remainingSeconds: remaining,
      dailyLimitSeconds: limit,
      storesRawAudio: false,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
