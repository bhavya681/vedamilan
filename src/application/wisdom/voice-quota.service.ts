import { connectMongo } from "@/infrastructure/database/mongodb";
import { WisdomVoiceUsage } from "@/infrastructure/database/models";
import { hasActiveSubscription } from "@/application/billing/entitlements";
import { PaymentRequiredError, ValidationError } from "@/lib/utils/error-handler";

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function envSeconds(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Soft daily caps — seconds of active listening+speaking billed per turn.
 * Dev / VOICE_QUOTA_DISABLED skips hard limits so local testing is not blocked.
 */
export async function getVoiceDailyLimitSeconds(userId: string): Promise<number> {
  if (process.env.VOICE_QUOTA_DISABLED === "true" || process.env.NODE_ENV === "development") {
    return envSeconds("VOICE_DAILY_LIMIT_SECONDS", 8 * 60 * 60);
  }
  const premium = await hasActiveSubscription(userId);
  if (premium) {
    return envSeconds("VOICE_PREMIUM_DAILY_LIMIT_SECONDS", 60 * 60);
  }
  return envSeconds("VOICE_DAILY_LIMIT_SECONDS", 30 * 60);
}

export async function getVoiceUsageToday(userId: string) {
  await connectMongo();
  const key = dayKey();
  const row = await WisdomVoiceUsage.findOne({ userId, day: key }).lean();
  return {
    day: key,
    secondsUsed: row?.secondsUsed || 0,
    sessions: row?.sessions || 0,
    turns: row?.turns || 0,
  };
}

export async function getVoiceQuotaSnapshot(userId: string) {
  const [usage, limit] = await Promise.all([
    getVoiceUsageToday(userId),
    getVoiceDailyLimitSeconds(userId),
  ]);
  return {
    usage,
    limit,
    remaining: Math.max(0, limit - usage.secondsUsed),
    exhausted: usage.secondsUsed >= limit,
  };
}

/**
 * Hard gate before starting a turn/session.
 * upcomingSeconds <= 0 is status-only and never throws (avoids 402 after a successful turn).
 */
export async function assertVoiceQuota(userId: string, upcomingSeconds = 15) {
  const snapshot = await getVoiceQuotaSnapshot(userId);
  if (upcomingSeconds <= 0) {
    return snapshot;
  }
  if (process.env.VOICE_QUOTA_DISABLED === "true" || process.env.NODE_ENV === "development") {
    return snapshot;
  }
  if (snapshot.usage.secondsUsed + upcomingSeconds > snapshot.limit) {
    throw new PaymentRequiredError(
      "You have reached today's voice wisdom limit. Upgrade Premium for more time, or continue with text.",
    );
  }
  return snapshot;
}

export async function recordVoiceUsage(
  userId: string,
  input: { seconds: number; sessionId?: string; isNewSession?: boolean },
) {
  await connectMongo();
  const seconds = Math.max(0, Math.min(600, Math.round(input.seconds)));
  if (seconds <= 0 && !input.isNewSession) return;

  await WisdomVoiceUsage.findOneAndUpdate(
    { userId, day: dayKey() },
    {
      $inc: {
        secondsUsed: seconds,
        turns: seconds > 0 ? 1 : 0,
        sessions: input.isNewSession ? 1 : 0,
      },
      $set: { lastSessionId: input.sessionId || null },
    },
    { upsert: true, returnDocument: "after" },
  );
}

export async function createVoiceSessionRecord(input: {
  userId: string;
  guideId: string;
  language: string;
}) {
  if (!input.guideId) throw new ValidationError("guideId required");
  await assertVoiceQuota(input.userId, 5);
  const sessionId = `vs_${input.userId.slice(0, 8)}_${Date.now().toString(36)}`;
  await recordVoiceUsage(input.userId, { seconds: 0, sessionId, isNewSession: true });
  const { usage, limit, remaining } = await getVoiceQuotaSnapshot(input.userId);
  return {
    sessionId,
    guideId: input.guideId,
    language: input.language,
    remainingSeconds: remaining,
    dailyLimitSeconds: limit,
    secondsUsed: usage.secondsUsed,
    privacy: true,
    storesRawAudio: false,
  };
}
