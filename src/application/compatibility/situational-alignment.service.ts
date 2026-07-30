import { SituationalProfile } from "@/infrastructure/database/models/situational-alignment";
import { connectMongo } from "@/infrastructure/database/mongodb";
import {
  SITUATIONAL_QUESTIONS,
  compareSituationalAnswers,
  isSituationalComplete,
  type SituationalAnswers,
} from "@/domain/compatibility/situational-alignment";
import { ValidationError } from "@/lib/utils/error-handler";

function normalizeAnswers(raw: unknown): SituationalAnswers {
  if (!raw || typeof raw !== "object") return {};
  const out: SituationalAnswers = {};
  const allowed = new Map(
    SITUATIONAL_QUESTIONS.map((q) => [q.id, new Set(q.options.map((o) => o.id))]),
  );
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const opts = allowed.get(key);
    if (!opts || typeof value !== "string" || !opts.has(value)) continue;
    out[key] = value;
  }
  return out;
}

function toPlain(
  doc: {
    userId: string;
    answers?: unknown;
    completedAt?: Date | null;
  } | null,
) {
  if (!doc) {
    return {
      answers: {} as SituationalAnswers,
      completedAt: null as string | null,
      complete: false,
      answeredCount: 0,
      totalQuestions: SITUATIONAL_QUESTIONS.length,
    };
  }
  const answers = normalizeAnswers(doc.answers);
  const answeredCount = Object.keys(answers).length;
  const complete = isSituationalComplete(answers);
  return {
    answers,
    completedAt: doc.completedAt ? new Date(doc.completedAt).toISOString() : null,
    complete,
    answeredCount,
    totalQuestions: SITUATIONAL_QUESTIONS.length,
  };
}

export class SituationalAlignmentService {
  catalog() {
    return SITUATIONAL_QUESTIONS.map((q) => ({
      id: q.id,
      theme: q.theme,
      graha: q.graha,
      prompt: q.prompt,
      options: q.options,
    }));
  }

  async getForUser(userId: string) {
    await connectMongo();
    const doc = await SituationalProfile.findOne({ userId, status: "ACTIVE" }).lean();
    return toPlain(doc);
  }

  async upsert(userId: string, answersInput: Record<string, unknown>) {
    await connectMongo();
    const answers = normalizeAnswers(answersInput);
    if (Object.keys(answers).length === 0) {
      throw new ValidationError("Choose at least one situational preference");
    }
    const complete = isSituationalComplete(answers);
    const doc = await SituationalProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          answers,
          completedAt: complete ? new Date() : null,
          deletedAt: null,
          status: "ACTIVE",
        },
      },
      { upsert: true, new: true },
    ).lean();
    return toPlain(doc);
  }

  async clear(userId: string) {
    await connectMongo();
    await SituationalProfile.findOneAndUpdate(
      { userId },
      { $set: { answers: {}, completedAt: null, deletedAt: new Date(), status: "DELETED" } },
    );
    return toPlain(null);
  }

  async compare(userAId: string, userBId: string) {
    await connectMongo();
    const [a, b] = await Promise.all([
      SituationalProfile.findOne({ userId: userAId, status: "ACTIVE" }).lean(),
      SituationalProfile.findOne({ userId: userBId, status: "ACTIVE" }).lean(),
    ]);
    const mine = toPlain(a);
    const theirs = toPlain(b);
    const comparison = compareSituationalAnswers(mine.answers, theirs.answers);
    return {
      youComplete: mine.complete,
      themComplete: theirs.complete,
      comparison,
    };
  }

  /** User ids among candidates who completed situational Q&A. */
  async filterCompletedUserIds(userIds: string[]): Promise<Set<string>> {
    if (!userIds.length) return new Set();
    await connectMongo();
    const rows = await SituationalProfile.find({
      userId: { $in: userIds },
      status: "ACTIVE",
      completedAt: { $ne: null },
    })
      .select("userId")
      .lean();
    return new Set(rows.map((r) => String(r.userId)));
  }
}

export const situationalAlignmentService = new SituationalAlignmentService();
