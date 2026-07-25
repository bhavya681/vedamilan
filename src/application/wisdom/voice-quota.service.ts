import { connectMongo } from "@/infrastructure/database/mongodb";
import { WisdomVoiceUsage } from "@/infrastructure/database/models";
import { hasActiveSubscription } from "@/application/billing/entitlements";
import { PaymentRequiredError, ValidationError } from "@/lib/utils/error-handler";

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

/** Soft daily caps — seconds of active listening+speaking billed per turn. */
export async function getVoiceDailyLimitSeconds(userId: string): Promise<number> {
  const premium = await hasActiveSubscription(userId);
  return premium ? 30 * 60 : 5 * 60;
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

export async function assertVoiceQuota(userId: string, upcomingSeconds = 15) {
  const [usage, limit] = await Promise.all([
    getVoiceUsageToday(userId),
    getVoiceDailyLimitSeconds(userId),
  ]);
  if (usage.secondsUsed + upcomingSeconds > limit) {
    throw new PaymentRequiredError(
      "You have reached today's voice wisdom limit. Upgrade Premium for more time, or continue with text.",
    );
  }
  return { usage, limit, remaining: Math.max(0, limit - usage.secondsUsed) };
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
    { upsert: true, new: true },
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
  const { usage, limit, remaining } = await assertVoiceQuota(input.userId, 0);
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
