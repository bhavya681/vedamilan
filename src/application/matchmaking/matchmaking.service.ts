import {
  Horoscope,
  Match,
  Profile,
  Like,
  Visitor,
  Shortlist,
} from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { compatibilityService } from "@/application/rules/compatibility.service";
import { scoreAshtaKoota } from "@/application/rules/ashta-koota";
import { normalizePagination, toPaginatedResult } from "@/repositories/pagination";

export type MatchFilters = {
  q?: string;
  city?: string;
  religion?: string;
  profession?: string;
  education?: string;
  language?: string;
  manglik?: "ANY" | "NON_MANGLIK" | "MANGLIK";
  minAge?: number;
  maxAge?: number;
  minHeightCm?: number;
  maxHeightCm?: number;
  minCompatibility?: number;
  page?: number;
  limit?: number;
};

function ageFromDob(dob?: Date | string | null): number | null {
  if (!dob) return null;
  const d = typeof dob === "string" ? new Date(dob) : dob;
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

function moonMeta(horoscope: {
  moonSign?: string;
  manglikStatus?: string;
  planets?: Array<{ planet: string; nakshatra?: string; sign?: string }>;
}) {
  const moon = horoscope.planets?.find((p) => p.planet === "Moon");
  return {
    moonSign: horoscope.moonSign || moon?.sign || "Aries",
    nakshatra: moon?.nakshatra || "Ashwini",
    manglik: horoscope.manglikStatus || "UNKNOWN",
  };
}

export class MatchmakingService {
  async search(userId: string, filters: MatchFilters = {}) {
    await connectMongo();
    const { page, limit, skip } = normalizePagination(filters);

    const query: Record<string, unknown> = {
      userId: { $ne: userId },
      status: "ACTIVE",
      visibility: { $ne: "HIDDEN" },
    };
    if (filters.city && filters.city !== "all") query.city = filters.city;
    if (filters.religion) query.religion = filters.religion;
    if (filters.profession) query.profession = new RegExp(filters.profession, "i");
    if (filters.education) query.education = new RegExp(filters.education, "i");
    if (filters.language) query.languages = filters.language;
    if (filters.minHeightCm || filters.maxHeightCm) {
      query.heightCm = {};
      if (filters.minHeightCm)
        (query.heightCm as Record<string, number>).$gte = filters.minHeightCm;
      if (filters.maxHeightCm)
        (query.heightCm as Record<string, number>).$lte = filters.maxHeightCm;
    }

    const [selfProfile, selfChart, candidates, total] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Profile.find(query)
        .skip(skip)
        .limit(limit * 3)
        .lean(),
      Profile.countDocuments(query),
    ]);

    const selfMoon = selfChart ? moonMeta(selfChart) : null;
    const candidateIds = candidates.map((c) => c.userId);
    const charts = await Horoscope.find({ userId: { $in: candidateIds } })
      .sort({ calculatedAt: -1 })
      .lean();
    const chartByUser = new Map<string, (typeof charts)[number]>();
    for (const c of charts) {
      if (!chartByUser.has(c.userId)) chartByUser.set(c.userId, c);
    }

    let ranked = candidates.map((profile) => {
      const age = ageFromDob(profile.dateOfBirth as Date | null);
      const chart = chartByUser.get(profile.userId);
      let compatibilityScore = 0;
      let reasons: string[] = [];
      if (selfMoon && chart) {
        const other = moonMeta(chart);
        const scored = scoreAshtaKoota({
          moonSignA: selfMoon.moonSign,
          moonSignB: other.moonSign,
          nakshatraA: selfMoon.nakshatra,
          nakshatraB: other.nakshatra,
          manglikA: selfMoon.manglik,
          manglikB: other.manglik,
        });
        compatibilityScore = scored.overallScore;
        reasons = scored.strengths.slice(0, 3);
      } else {
        reasons = ["Complete both kundlis for Vedic ranking"];
      }

      const photo =
        profile.photos?.find((p) => p.isPrimary)?.secureUrl ||
        profile.photos?.[0]?.secureUrl ||
        null;

      return {
        userId: profile.userId,
        name: profile.headline || profile.profession || "Member",
        age,
        city: profile.city,
        profession: profile.profession,
        education: profile.education,
        religion: profile.religion,
        languages: profile.languages,
        heightCm: profile.heightCm,
        manglik: chart?.manglikStatus || "UNKNOWN",
        nakshatra: chart ? moonMeta(chart).nakshatra : null,
        compatibilityScore,
        photo,
        reasons,
        about: profile.about,
      };
    });

    if (filters.q) {
      const q = filters.q.toLowerCase();
      ranked = ranked.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.profession || "").toLowerCase().includes(q) ||
          (m.city || "").toLowerCase().includes(q),
      );
    }
    if (filters.minAge != null)
      ranked = ranked.filter((m) => m.age == null || m.age >= filters.minAge!);
    if (filters.maxAge != null)
      ranked = ranked.filter((m) => m.age == null || m.age <= filters.maxAge!);
    if (filters.manglik && filters.manglik !== "ANY") {
      ranked = ranked.filter((m) => m.manglik === filters.manglik);
    }
    if (filters.minCompatibility != null) {
      ranked = ranked.filter((m) => m.compatibilityScore >= filters.minCompatibility!);
    }

    ranked.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    const pageItems = ranked.slice(0, limit).map((item, index) => ({
      ...item,
      rank: skip + index + 1,
    }));

    // Persist top recommendations snapshot
    await Promise.all(
      pageItems.map((item) =>
        Match.findOneAndUpdate(
          { userId, candidateUserId: item.userId },
          {
            $set: {
              userId,
              candidateUserId: item.userId,
              rank: item.rank,
              compatibilityScore: item.compatibilityScore,
              reasons: item.reasons,
              matchStatus: "ACTIVE",
              generatedAt: new Date(),
              deletedAt: null,
              status: "ACTIVE",
            },
          },
          { upsert: true },
        ),
      ),
    );

    return {
      ...toPaginatedResult(pageItems, ranked.length || total, page, limit),
      self: {
        hasChart: Boolean(selfChart),
        city: selfProfile?.city,
      },
    };
  }

  async like(
    fromUserId: string,
    toUserId: string,
    type: "LIKE" | "SUPER_LIKE" | "INTEREST" = "LIKE",
  ) {
    await connectMongo();
    return Like.findOneAndUpdate(
      { fromUserId, toUserId, type },
      { $set: { fromUserId, toUserId, type, deletedAt: null, status: "ACTIVE" } },
      { upsert: true, new: true },
    ).lean();
  }

  async shortlist(userId: string, targetUserId: string, note = "") {
    await connectMongo();
    return Shortlist.findOneAndUpdate(
      { userId, targetUserId },
      { $set: { userId, targetUserId, note, deletedAt: null, status: "ACTIVE" } },
      { upsert: true, new: true },
    ).lean();
  }

  async recordVisit(visitorUserId: string, profileUserId: string) {
    await connectMongo();
    if (visitorUserId === profileUserId) return null;
    return Visitor.findOneAndUpdate(
      { visitorUserId, profileUserId },
      {
        $inc: { visitCount: 1 },
        $set: { lastVisitedAt: new Date(), deletedAt: null, status: "ACTIVE" },
      },
      { upsert: true, new: true },
    ).lean();
  }

  async listLikes(userId: string) {
    await connectMongo();
    return Like.find({ fromUserId: userId, status: "ACTIVE" }).sort({ createdAt: -1 }).lean();
  }

  async listShortlist(userId: string) {
    await connectMongo();
    return Shortlist.find({ userId, status: "ACTIVE" }).sort({ createdAt: -1 }).lean();
  }

  async listVisitors(userId: string) {
    await connectMongo();
    return Visitor.find({ profileUserId: userId, status: "ACTIVE" })
      .sort({ lastVisitedAt: -1 })
      .lean();
  }

  async recommend(userId: string) {
    return this.search(userId, { limit: 10, page: 1, minCompatibility: 50 });
  }
}

export const matchmakingService = new MatchmakingService();
