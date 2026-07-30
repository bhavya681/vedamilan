import { Types } from "mongoose";

import { connectMongo } from "@/infrastructure/database/mongodb";
import {
  CompatibilityReport,
  ConnectionJourney,
  CoupleMilestone,
  LifePathProfile,
  PrivateCompatibilityNote,
  Profile,
  SharedInsight,
  SharedQuestion,
  WhatIfResult,
  relationshipPairKey,
} from "@/infrastructure/database/models";
import { relationshipService } from "@/application/relationship/relationship.service";
import { notificationService } from "@/application/notifications/notification.service";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/utils/error-handler";
import { formatPersonName } from "@/lib/utils/person-name";
import { withVedicDisclaimer } from "@/lib/constants/ai-disclaimer";
import {
  JOURNEY_STAGES,
  LIFE_PATH_CATEGORIES,
  MILESTONE_TYPES,
  SHARED_QUESTION_BANK,
  WHAT_IF_SCENARIOS,
  type JourneyStageId,
  type LifePathKey,
  type WhatIfScenarioId,
} from "@/lib/constants/relationship-journey";
import { primaryPhotoUrl } from "@/features/profile/profile-photo";

type AlignmentLabel = "STRONG" | "GOOD" | "MIXED" | "NEEDS_DISCUSSION";

function labelCopy(label: AlignmentLabel) {
  // English fallback for persisted payloads; UI should prefer localizeAlignment(label).
  return (
    {
      STRONG: "Strong Alignment",
      GOOD: "Good Alignment",
      MIXED: "Mixed Alignment",
      NEEDS_DISCUSSION: "Needs Discussion",
    } as const
  )[label];
}

async function requireConnectedPair(viewerId: string, partnerUserId: string) {
  if (!partnerUserId || partnerUserId === viewerId) {
    throw new ValidationError("Choose a connected partner to open Your Connection.");
  }
  const ok = await relationshipService.areConnected(viewerId, partnerUserId);
  if (!ok) {
    throw new ForbiddenError("Your Connection is available after you both accept a connection.");
  }
  return relationshipPairKey(viewerId, partnerUserId);
}

function lifePathAnswers(raw: Record<string, unknown> | null | undefined) {
  const out: Partial<Record<LifePathKey, string | null>> = {};
  for (const cat of LIFE_PATH_CATEGORIES) {
    const v = raw?.[cat.key];
    out[cat.key] = typeof v === "string" && v.trim() ? v.trim() : null;
  }
  return out;
}

function compareLifePaths(
  mine: Partial<Record<LifePathKey, string | null>>,
  theirs: Partial<Record<LifePathKey, string | null>>,
) {
  const rows = LIFE_PATH_CATEGORIES.map((cat) => {
    const a = mine[cat.key] || null;
    const b = theirs[cat.key] || null;
    let status: "ALIGN" | "DIFFER" | "MISSING" = "MISSING";
    if (a && b) status = a === b ? "ALIGN" : "DIFFER";
    return { key: cat.key, label: cat.label, you: a, partner: b, status };
  });

  const compared = rows.filter((r) => r.status !== "MISSING");
  const align = compared.filter((r) => r.status === "ALIGN").length;
  const differ = compared.filter((r) => r.status === "DIFFER").length;
  const ratio = compared.length ? align / compared.length : 0;

  let label: AlignmentLabel = "NEEDS_DISCUSSION";
  if (!compared.length) label = "NEEDS_DISCUSSION";
  else if (ratio >= 0.75 && differ <= 2) label = "STRONG";
  else if (ratio >= 0.55) label = "GOOD";
  else if (ratio >= 0.35) label = "MIXED";
  else label = "NEEDS_DISCUSSION";

  return {
    label,
    labelCopy: labelCopy(label),
    summary:
      compared.length === 0
        ? "Complete Life Path answers on both sides to explore alignment."
        : `${align} aligned · ${differ} different · ${LIFE_PATH_CATEGORIES.length - compared.length} still open`,
    rows,
    whereYouAlign: rows.filter((r) => r.status === "ALIGN").map((r) => r.label),
    whereYouDiffer: rows.filter((r) => r.status === "DIFFER").map((r) => r.label),
    worthDiscussing: rows
      .filter((r) => r.status === "DIFFER" || r.status === "MISSING")
      .slice(0, 5)
      .map((r) => r.label),
  };
}

function buildDiscovery(
  report: Record<string, unknown> | null,
  lifePath: ReturnType<typeof compareLifePaths>,
) {
  const strengths = Array.isArray(report?.strengths)
    ? (report!.strengths as string[]).slice(0, 5)
    : [];
  const challenges = Array.isArray(report?.challenges)
    ? (report!.challenges as string[]).slice(0, 5)
    : [];

  return {
    vedic: report
      ? {
          overallScore: report.deepOverallScore ?? report.overallScore ?? null,
          decisionSummary: report.decisionSummary ?? null,
          totalGuna: report.totalGuna ?? null,
          maxGuna: report.maxGuna ?? 36,
          strengths,
          challenges,
        }
      : null,
    whereYouAlign: [
      ...lifePath.whereYouAlign.map((l) => `Life path: ${l}`),
      ...strengths.slice(0, 3),
    ].slice(0, 6),
    whereYouDiffer: [
      ...lifePath.whereYouDiffer.map((l) => `Life path: ${l}`),
      ...challenges.slice(0, 3),
    ].slice(0, 6),
    worthDiscussing: lifePath.worthDiscussing.length
      ? lifePath.worthDiscussing
      : challenges.slice(0, 3),
  };
}

function deterministicWhatIf(input: {
  scenarioId: WhatIfScenarioId;
  lifePath: ReturnType<typeof compareLifePaths>;
  discovery: ReturnType<typeof buildDiscovery>;
}) {
  const scenario = WHAT_IF_SCENARIOS.find((s) => s.id === input.scenarioId);
  if (!scenario) throw new ValidationError("Unknown scenario");

  const focusRows = input.lifePath.rows.filter((r) =>
    (scenario.focuses as readonly string[]).includes(r.key),
  );
  const align = focusRows.filter((r) => r.status === "ALIGN");
  const differ = focusRows.filter((r) => r.status === "DIFFER");
  const missing = focusRows.filter((r) => r.status === "MISSING");

  let alignmentLabel: AlignmentLabel = "MIXED";
  if (differ.length === 0 && align.length >= 2) alignmentLabel = "STRONG";
  else if (differ.length <= 1 && align.length >= 1) alignmentLabel = "GOOD";
  else if (differ.length >= 2) alignmentLabel = "NEEDS_DISCUSSION";

  const alignmentPoints = [
    ...align.map((r) => `You both selected similar preferences for ${r.label.toLowerCase()}.`),
    ...input.discovery.whereYouAlign.slice(0, 2),
  ].slice(0, 4);

  const frictionPoints = [
    ...differ.map(
      (r) =>
        `${r.label} looks different (you: ${r.you || "—"}; partner: ${r.partner || "—"}). This may need a calm conversation.`,
    ),
    ...missing.map(
      (r) =>
        `${r.label} is incomplete on one or both sides — filling it in may clarify this scenario.`,
    ),
  ].slice(0, 4);

  const discussionQuestions = [
    `How would we approach “${scenario.title.toLowerCase()}” in the first two years?`,
    "What would feel supportive from each other if priorities temporarily conflict?",
    "What would we want families to understand about this choice?",
  ];

  const reflection = withVedicDisclaimer(
    [
      `This is a reflective exploration of “${scenario.prompt}” — not a prediction.`,
      alignmentPoints[0]
        ? `Based on what you’ve both shared, ${alignmentPoints[0].charAt(0).toLowerCase()}${alignmentPoints[0].slice(1)}`
        : "Based on available preferences, there is still room to clarify this scenario together.",
      frictionPoints[0]
        ? `A potential consideration: ${frictionPoints[0].charAt(0).toLowerCase()}${frictionPoints[0].slice(1)}`
        : "No major preference conflicts appear in the focused categories yet.",
      "It may be worth discussing expectations early, with curiosity rather than pressure.",
    ].join(" "),
  );

  return {
    scenarioId: scenario.id,
    title: scenario.title,
    prompt: scenario.prompt,
    alignmentLabel,
    alignmentLabelCopy: labelCopy(alignmentLabel),
    sources: ["Life Path preferences", "Compatibility summary (if available)"].filter(Boolean),
    alignmentPoints: alignmentPoints.length
      ? alignmentPoints
      : ["Shared willingness to explore this topic together."],
    frictionPoints: frictionPoints.length
      ? frictionPoints
      : ["No strong friction flagged from current answers — still confirm in conversation."],
    discussionQuestions,
    reflection,
  };
}

async function partnerCard(userId: string) {
  const profile = await Profile.findOne({ userId }).lean();
  return {
    userId,
    name: formatPersonName(profile?.name, "Member"),
    city: profile?.city || null,
    profession: profile?.profession || null,
    photo: primaryPhotoUrl(profile?.photos as never) || null,
  };
}

export class RelationshipJourneyService {
  async getSpace(viewerId: string, partnerUserId: string) {
    await connectMongo();
    const pairKey = await requireConnectedPair(viewerId, partnerUserId);

    const [
      me,
      partner,
      myLife,
      theirLife,
      report,
      myJourney,
      notes,
      insights,
      questions,
      milestones,
    ] = await Promise.all([
      partnerCard(viewerId),
      partnerCard(partnerUserId),
      LifePathProfile.findOne({ userId: viewerId, status: "ACTIVE" }).lean(),
      LifePathProfile.findOne({ userId: partnerUserId, status: "ACTIVE" }).lean(),
      CompatibilityReport.findOne({ pairKey, status: "ACTIVE" }).lean(),
      ConnectionJourney.findOne({ userId: viewerId, partnerUserId, status: "ACTIVE" }).lean(),
      PrivateCompatibilityNote.find({
        ownerUserId: viewerId,
        aboutUserId: partnerUserId,
        status: "ACTIVE",
        deletedAt: null,
      })
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean(),
      SharedInsight.find({ pairKey, status: "ACTIVE", deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(40)
        .lean(),
      SharedQuestion.find({ pairKey, status: "ACTIVE", deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      CoupleMilestone.find({ pairKey, status: "ACTIVE", deletedAt: null })
        .sort({ occurredOn: -1, createdAt: -1 })
        .lean(),
    ]);

    const lifePath = compareLifePaths(
      lifePathAnswers(myLife?.answers as never),
      lifePathAnswers(theirLife?.answers as never),
    );
    const discovery = buildDiscovery(report as never, lifePath);

    const explored = new Set(myJourney?.exploredStageIds || []);
    const stages = JOURNEY_STAGES.map((s) => ({
      ...s,
      explored: explored.has(s.id),
    }));

    const safeQuestions = questions.map((q) => {
      const answers = (q.answers || []).map((a) => {
        const isMine = a.userId === viewerId;
        if (isMine || a.revealed) {
          return {
            userId: a.userId,
            body: a.body,
            revealed: Boolean(a.revealed),
            isMine,
            answeredAt: a.answeredAt,
          };
        }
        return {
          userId: a.userId,
          body: null,
          revealed: false,
          isMine: false,
          answeredAt: a.answeredAt,
          hidden: true,
        };
      });
      return {
        id: String(q._id),
        question: q.question,
        createdByUserId: q.createdByUserId,
        answers,
      };
    });

    return {
      pairKey,
      me,
      partner,
      lifePathCategories: LIFE_PATH_CATEGORIES,
      myLifePath: lifePathAnswers(myLife?.answers as never),
      lifePathAlignment: lifePath,
      discovery,
      journey: {
        stages,
        exploredCount: explored.size,
        totalStages: JOURNEY_STAGES.length,
      },
      whatIfScenarios: WHAT_IF_SCENARIOS,
      privateNotes: notes.map((n) => ({
        id: String(n._id),
        body: n.body,
        updatedAt: n.updatedAt,
        createdAt: n.createdAt,
      })),
      sharedInsights: insights.map((i) => ({
        id: String(i._id),
        category: i.category,
        title: i.title,
        body: i.body,
        source: i.source,
        sharedByUserId: i.sharedByUserId,
        createdAt: i.createdAt,
      })),
      sharedQuestions: safeQuestions,
      questionBank: SHARED_QUESTION_BANK,
      milestones: milestones
        .filter((m) => m.shared || m.notedByUserId === viewerId)
        .map((m) => ({
          id: String(m._id),
          milestoneType: m.milestoneType,
          label: m.label,
          occurredOn: m.occurredOn,
          notedByUserId: m.notedByUserId,
          shared: m.shared,
        })),
      milestoneTypes: MILESTONE_TYPES,
      disclaimer:
        "Reflections and life-path views are discussion aids — not guarantees, diagnoses, or astrological calculations.",
    };
  }

  async upsertLifePath(userId: string, answers: Record<string, unknown>) {
    await connectMongo();
    const cleaned = lifePathAnswers(answers);
    const filled = Object.values(cleaned).filter(Boolean).length;
    const doc = await LifePathProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          answers: cleaned,
          completedAt: filled >= 6 ? new Date() : null,
          status: "ACTIVE",
          deletedAt: null,
        },
      },
      { upsert: true, new: true },
    ).lean();
    return lifePathAnswers(doc?.answers as never);
  }

  async createNote(ownerUserId: string, aboutUserId: string, body: string) {
    await connectMongo();
    const pairKey = await requireConnectedPair(ownerUserId, aboutUserId);
    const text = body.trim();
    if (text.length < 2) throw new ValidationError("Write a short private note.");
    const note = await PrivateCompatibilityNote.create({
      ownerUserId,
      aboutUserId,
      pairKey,
      body: text.slice(0, 2000),
    });
    return {
      id: String(note._id),
      body: note.body,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  async updateNote(ownerUserId: string, noteId: string, body: string) {
    await connectMongo();
    const text = body.trim();
    if (text.length < 2) throw new ValidationError("Write a short private note.");
    const filter: Record<string, unknown> = { ownerUserId, status: "ACTIVE", deletedAt: null };
    if (Types.ObjectId.isValid(noteId)) filter._id = new Types.ObjectId(noteId);
    else filter._id = noteId;
    const note = await PrivateCompatibilityNote.findOneAndUpdate(
      filter,
      { $set: { body: text.slice(0, 2000) } },
      { new: true },
    ).lean();
    if (!note) throw new NotFoundError("Note not found");
    return { id: String(note._id), body: note.body, updatedAt: note.updatedAt };
  }

  async deleteNote(ownerUserId: string, noteId: string) {
    await connectMongo();
    const filter: Record<string, unknown> = { ownerUserId, status: "ACTIVE", deletedAt: null };
    if (Types.ObjectId.isValid(noteId)) filter._id = new Types.ObjectId(noteId);
    else filter._id = noteId;
    const res = await PrivateCompatibilityNote.updateOne(filter, {
      $set: { deletedAt: new Date(), status: "ARCHIVED" },
    });
    if (!res.matchedCount) throw new NotFoundError("Note not found");
    return { ok: true };
  }

  async markJourneyStage(userId: string, partnerUserId: string, stageId: JourneyStageId) {
    await connectMongo();
    const pairKey = await requireConnectedPair(userId, partnerUserId);
    if (!JOURNEY_STAGES.some((s) => s.id === stageId)) {
      throw new ValidationError("Unknown journey stage");
    }
    const doc = await ConnectionJourney.findOneAndUpdate(
      { userId, partnerUserId },
      {
        $set: {
          userId,
          partnerUserId,
          pairKey,
          lastStageId: stageId,
          status: "ACTIVE",
          deletedAt: null,
        },
        $addToSet: { exploredStageIds: stageId },
      },
      { upsert: true, new: true },
    ).lean();
    return {
      exploredStageIds: doc?.exploredStageIds || [],
      lastStageId: doc?.lastStageId || stageId,
    };
  }

  async shareInsight(
    userId: string,
    partnerUserId: string,
    input: {
      title: string;
      body: string;
      category?: "ALIGN" | "DIFFER" | "DISCUSS" | "CUSTOM";
      source?: "COMPATIBILITY" | "LIFE_PATH" | "USER";
    },
  ) {
    await connectMongo();
    const pairKey = await requireConnectedPair(userId, partnerUserId);
    const title = input.title.trim().slice(0, 160);
    const body = input.body.trim().slice(0, 2000);
    if (!title || !body) throw new ValidationError("Insight needs a title and body.");
    const category = input.category ?? "CUSTOM";
    const source = input.source ?? "USER";
    const insight = await SharedInsight.create({
      pairKey,
      sharedByUserId: userId,
      title,
      body,
      category,
      source,
    });
    await notificationService.create({
      userId: partnerUserId,
      type: "JOURNEY_SHARED_INSIGHT",
      title: "A shared insight is waiting",
      body: "Your connection shared something from Your Connection space.",
      data: {
        otherUserId: userId,
        insightId: String(insight._id),
        href: `/dashboard/your-connection?partner=${userId}`,
      },
    });
    return {
      id: String(insight._id),
      title: insight.title,
      body: insight.body,
      category: insight.category,
      source: insight.source,
      sharedByUserId: insight.sharedByUserId,
    };
  }

  async exploreWhatIf(userId: string, partnerUserId: string, scenarioId: WhatIfScenarioId) {
    await connectMongo();
    const pairKey = await requireConnectedPair(userId, partnerUserId);
    const space = await this.getSpace(userId, partnerUserId);
    const result = deterministicWhatIf({
      scenarioId,
      lifePath: space.lifePathAlignment,
      discovery: space.discovery,
    });

    await WhatIfResult.create({
      pairKey,
      requestedByUserId: userId,
      scenarioId: result.scenarioId,
      alignmentLabel: result.alignmentLabel,
      sources: result.sources,
      alignmentPoints: result.alignmentPoints,
      frictionPoints: result.frictionPoints,
      discussionQuestions: result.discussionQuestions,
      reflection: result.reflection,
      sharedWithPartner: false,
    });

    return result;
  }

  async upsertSharedQuestion(userId: string, partnerUserId: string, question: string) {
    await connectMongo();
    const pairKey = await requireConnectedPair(userId, partnerUserId);
    const q = question.trim().slice(0, 400);
    if (q.length < 8) throw new ValidationError("Choose or write a fuller question.");
    const doc = await SharedQuestion.create({
      pairKey,
      question: q,
      createdByUserId: userId,
      answers: [],
    });
    return { id: String(doc._id), question: doc.question };
  }

  async answerSharedQuestion(
    userId: string,
    partnerUserId: string,
    questionId: string,
    body: string,
    reveal: boolean,
  ) {
    await connectMongo();
    const pairKey = await requireConnectedPair(userId, partnerUserId);
    const text = body.trim().slice(0, 2000);
    if (text.length < 2) throw new ValidationError("Add a short answer first.");

    const filter: Record<string, unknown> = { pairKey, status: "ACTIVE", deletedAt: null };
    if (Types.ObjectId.isValid(questionId)) filter._id = new Types.ObjectId(questionId);
    else filter._id = questionId;

    const doc = await SharedQuestion.findOne(filter);
    if (!doc) throw new NotFoundError("Question not found");

    const answers = [...(doc.answers || [])];
    const idx = answers.findIndex((a) => a.userId === userId);
    const entry = {
      userId,
      body: text,
      revealed: Boolean(reveal),
      answeredAt: new Date(),
    };
    if (idx >= 0) answers[idx] = entry as never;
    else answers.push(entry as never);
    doc.answers = answers as never;
    await doc.save();

    if (reveal) {
      await notificationService.create({
        userId: partnerUserId,
        type: "JOURNEY_SHARED_ANSWER",
        title: "A shared answer was revealed",
        body: "Your connection shared an answer in Your Connection.",
        data: {
          otherUserId: userId,
          questionId: String(doc._id),
          href: `/dashboard/your-connection?partner=${userId}`,
        },
      });
    }

    return { ok: true };
  }

  async setMilestone(
    userId: string,
    partnerUserId: string,
    milestoneType: string,
    occurredOn?: string | null,
  ) {
    await connectMongo();
    const pairKey = await requireConnectedPair(userId, partnerUserId);
    const meta = MILESTONE_TYPES.find((m) => m.id === milestoneType);
    if (!meta) throw new ValidationError("Unknown milestone");
    const doc = await CoupleMilestone.findOneAndUpdate(
      { pairKey, milestoneType },
      {
        $set: {
          pairKey,
          milestoneType,
          label: meta.label,
          occurredOn: occurredOn ? new Date(occurredOn) : new Date(),
          notedByUserId: userId,
          shared: true,
          status: "ACTIVE",
          deletedAt: null,
        },
      },
      { upsert: true, new: true },
    ).lean();
    return {
      id: String(doc?._id),
      milestoneType: doc?.milestoneType,
      label: doc?.label,
      occurredOn: doc?.occurredOn,
    };
  }

  /** Soft-archive shared journey artifacts when a connection ends. Private notes stay owner-scoped. */
  async archivePairSpace(pairKey: string) {
    await connectMongo();
    const now = new Date();
    const soft = { $set: { status: "ARCHIVED" as const, deletedAt: now } };
    await Promise.all([
      SharedInsight.updateMany({ pairKey, deletedAt: null }, soft),
      SharedQuestion.updateMany({ pairKey, deletedAt: null }, soft),
      CoupleMilestone.updateMany({ pairKey, deletedAt: null }, soft),
      WhatIfResult.updateMany({ pairKey, deletedAt: null }, soft),
      ConnectionJourney.updateMany({ pairKey, deletedAt: null }, soft),
      // Intentionally do NOT archive PrivateCompatibilityNote by pairKey —
      // those remain private to each owner even after disconnect/block.
    ]);
  }
}

export const relationshipJourneyService = new RelationshipJourneyService();
