import { GrahaLearningProgress } from "@/infrastructure/database/models";
import { isGrahaId } from "@/domain/graha-katha/ids";
import { ValidationError } from "@/lib/utils/error-handler";

export type GrahaProgressDto = {
  exploredGrahaIds: string[];
  completedChapters: Record<string, string[]>;
  bookmarks: string[];
  savedInsights: string[];
  lastGrahaId: string | null;
};

function toDto(doc: {
  exploredGrahaIds?: string[] | null;
  completedChapters?: Record<string, string[]> | null;
  bookmarks?: string[] | null;
  savedInsights?: string[] | null;
  lastGrahaId?: string | null;
}): GrahaProgressDto {
  return {
    exploredGrahaIds: [...(doc.exploredGrahaIds ?? [])],
    completedChapters: { ...(doc.completedChapters ?? {}) },
    bookmarks: [...(doc.bookmarks ?? [])],
    savedInsights: [...(doc.savedInsights ?? [])],
    lastGrahaId: doc.lastGrahaId ?? null,
  };
}

export const grahaProgressService = {
  async getForUser(userId: string): Promise<GrahaProgressDto> {
    const doc = await GrahaLearningProgress.findOne({ userId, deletedAt: null }).lean();
    if (!doc) {
      return {
        exploredGrahaIds: [],
        completedChapters: {},
        bookmarks: [],
        savedInsights: [],
        lastGrahaId: null,
      };
    }
    return toDto(doc as never);
  },

  async patch(
    userId: string,
    input: {
      exploreGrahaId?: string;
      completeChapter?: { grahaId: string; chapterId: string };
      toggleBookmark?: string;
      saveInsight?: string;
    },
  ): Promise<GrahaProgressDto> {
    const current = await this.getForUser(userId);
    const explored = new Set(current.exploredGrahaIds);
    const bookmarks = new Set(current.bookmarks);
    const completed = { ...current.completedChapters };
    let lastGrahaId = current.lastGrahaId;
    const savedInsights = [...current.savedInsights];

    if (input.exploreGrahaId) {
      if (!isGrahaId(input.exploreGrahaId)) throw new ValidationError("Invalid graha id");
      explored.add(input.exploreGrahaId);
      lastGrahaId = input.exploreGrahaId;
    }

    if (input.completeChapter) {
      const { grahaId, chapterId } = input.completeChapter;
      if (!isGrahaId(grahaId) || !chapterId.trim()) {
        throw new ValidationError("Invalid chapter completion");
      }
      explored.add(grahaId);
      lastGrahaId = grahaId;
      const list = new Set(completed[grahaId] ?? []);
      list.add(chapterId.trim());
      completed[grahaId] = [...list];
    }

    if (input.toggleBookmark) {
      if (!isGrahaId(input.toggleBookmark)) throw new ValidationError("Invalid graha id");
      if (bookmarks.has(input.toggleBookmark)) bookmarks.delete(input.toggleBookmark);
      else bookmarks.add(input.toggleBookmark);
    }

    if (input.saveInsight?.trim()) {
      savedInsights.push(input.saveInsight.trim().slice(0, 500));
    }

    const doc = await GrahaLearningProgress.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          exploredGrahaIds: [...explored],
          completedChapters: completed,
          bookmarks: [...bookmarks],
          savedInsights: savedInsights.slice(-50),
          lastGrahaId,
          deletedAt: null,
          status: "ACTIVE",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    return toDto(doc as never);
  },
};
