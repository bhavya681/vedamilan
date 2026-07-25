import { requireSession } from "@/lib/auth/session";
import { relationshipJourneyService } from "@/application/relationship/journey.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import {
  journeyStageSchema,
  lifePathUpdateSchema,
  milestoneSchema,
  noteCreateSchema,
  shareInsightSchema,
  sharedQuestionAnswerSchema,
  sharedQuestionCreateSchema,
  whatIfSchema,
} from "@/lib/validators/relationship-journey";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const partnerUserId = new URL(request.url).searchParams.get("partnerUserId") || "";
    if (!partnerUserId) throw new ValidationError("partnerUserId is required");
    const data = await relationshipJourneyService.getSpace(session.user.id, partnerUserId);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = await request.json();
    const action = String(body.action || "");

    switch (action) {
      case "upsertLifePath": {
        const parsed = lifePathUpdateSchema.parse(body);
        const answers = await relationshipJourneyService.upsertLifePath(
          session.user.id,
          parsed.answers,
        );
        return successResponse({ answers });
      }
      case "createNote": {
        const parsed = noteCreateSchema.parse(body);
        const note = await relationshipJourneyService.createNote(
          session.user.id,
          parsed.partnerUserId,
          parsed.body,
        );
        return successResponse(note);
      }
      case "markJourneyStage": {
        const parsed = journeyStageSchema.parse(body);
        const progress = await relationshipJourneyService.markJourneyStage(
          session.user.id,
          parsed.partnerUserId,
          parsed.stageId,
        );
        return successResponse(progress);
      }
      case "shareInsight": {
        const parsed = shareInsightSchema.parse(body);
        const insight = await relationshipJourneyService.shareInsight(
          session.user.id,
          parsed.partnerUserId,
          parsed,
        );
        return successResponse(insight);
      }
      case "exploreWhatIf": {
        const parsed = whatIfSchema.parse(body);
        const result = await relationshipJourneyService.exploreWhatIf(
          session.user.id,
          parsed.partnerUserId,
          parsed.scenarioId,
        );
        return successResponse(result);
      }
      case "createSharedQuestion": {
        const parsed = sharedQuestionCreateSchema.parse(body);
        const q = await relationshipJourneyService.upsertSharedQuestion(
          session.user.id,
          parsed.partnerUserId,
          parsed.question,
        );
        return successResponse(q);
      }
      case "answerSharedQuestion": {
        const parsed = sharedQuestionAnswerSchema.parse(body);
        const result = await relationshipJourneyService.answerSharedQuestion(
          session.user.id,
          parsed.partnerUserId,
          parsed.questionId,
          parsed.body,
          parsed.reveal,
        );
        return successResponse(result);
      }
      case "setMilestone": {
        const parsed = milestoneSchema.parse(body);
        const milestone = await relationshipJourneyService.setMilestone(
          session.user.id,
          parsed.partnerUserId,
          parsed.milestoneType,
          parsed.occurredOn,
        );
        return successResponse(milestone);
      }
      default:
        throw new ValidationError("Unknown action");
    }
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = await request.json();
    const action = String(body.action || "");
    if (action === "updateNote") {
      const noteId = String(body.noteId || "");
      const noteBody = String(body.body || "");
      if (!noteId) throw new ValidationError("noteId is required");
      const note = await relationshipJourneyService.updateNote(session.user.id, noteId, noteBody);
      return successResponse(note);
    }
    throw new ValidationError("Unknown action");
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const noteId = new URL(request.url).searchParams.get("noteId") || "";
    if (!noteId) throw new ValidationError("noteId is required");
    const result = await relationshipJourneyService.deleteNote(session.user.id, noteId);
    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
