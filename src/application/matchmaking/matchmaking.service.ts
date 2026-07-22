import {
  Horoscope,
  Match,
  Profile,
  Like,
  Visitor,
  Shortlist,
  PartnerPreferences,
} from "@/infrastructure/database/models";
import { connectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { scoreMatchBlend, toPlanetsLite } from "@/application/rules/match-blend";
import { normalizePagination, toPaginatedResult } from "@/repositories/pagination";
import { ObjectId } from "mongodb";

function userIdQuery(userIds: string[]) {
  const objectIds = userIds
    .filter((id) => ObjectId.isValid(id) && String(new ObjectId(id)) === id)
    .map((id) => new ObjectId(id));

  return {
    $or: [
      { id: { $in: userIds } },
      { _id: { $in: userIds as never[] } },
      ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
    ],
  };
}

function canonicalUserId(user: { id?: string; _id?: unknown }) {
  return String(user.id || user._id);
}

export type MatchFilters = {
  q?: string;
  city?: string;
  religion?: string;
  profession?: string;
  education?: string;
  language?: string;
  manglik?: "ANY" | "NON_MANGLIK" | "MANGLIK" | "PARTIAL";
  minAge?: number;
  maxAge?: number;
  minHeightCm?: number;
  maxHeightCm?: number;
  minCompatibility?: number;
  page?: number;
  limit?: number;
  applyPreferences?: boolean;
};

export type RankedMatch = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  education: string | null;
  religion: string | null;
  languages: string[];
  heightCm: number | null;
  manglik: string;
  nakshatra: string | null;
  compatibilityScore: number;
  totalGuna: number;
  maxGuna: number;
  photo: string | null;
  reasons: string[];
  about: string | null;
  headline: string | null;
  cardSummary: string;
  gunaBreakdown: Array<{ koota: string; score: number; max: number; note: string }>;
  rank: number;
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

async function resolveUserNames(userIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (userIds.length === 0) return map;

  const profiles = await Profile.find({ userId: { $in: userIds } })
    .select("userId name headline")
    .lean();

  const needsBackfill: Array<{ userId: string; name: string }> = [];

  for (const p of profiles) {
    const fromProfile = String(p.name || "").trim();
    if (fromProfile) {
      map.set(p.userId, fromProfile);
      continue;
    }
    const fromHeadline = nameFromPlaceholderHeadline(p.headline);
    if (fromHeadline) {
      map.set(p.userId, fromHeadline);
      needsBackfill.push({ userId: p.userId, name: fromHeadline });
    }
  }

  const missing = userIds.filter((id) => !map.has(id));
  if (missing.length > 0) {
    const db = getMongoDb();
    const users = await db
      .collection("user")
      .find(userIdQuery(missing))
      .project({ id: 1, name: 1, _id: 1 })
      .toArray();

    for (const u of users) {
      const raw = String((u as { name?: string }).name || "").trim();
      if (!raw) continue;
      const keys = new Set<string>([
        canonicalUserId(u as { id?: string; _id?: unknown }),
        String(u._id),
      ]);
      if ((u as { id?: string }).id) keys.add(String((u as { id: string }).id));
      for (const key of keys) {
        if (!key) continue;
        map.set(key, raw);
        needsBackfill.push({ userId: key, name: raw });
      }
    }
  }

  if (needsBackfill.length > 0) {
    const unique = new Map(needsBackfill.map((item) => [item.userId, item.name]));
    await Promise.all(
      [...unique.entries()].map(([userId, name]) =>
        Profile.updateOne(
          { userId, $or: [{ name: { $exists: false } }, { name: "" }, { name: null }] },
          { $set: { name } },
        ),
      ),
    );
  }

  return map;
}

function nameFromPlaceholderHeadline(headline?: string | null): string | null {
  const value = String(headline || "").trim();
  if (!value) return null;
  const match = value.match(/^(.+?)['’]s profile$/i);
  return match?.[1]?.trim() || null;
}

/** True profile tagline — ignore placeholder "${name}'s profile" seeds. */
export function sanitizeHeadline(headline?: string | null, name?: string | null): string | null {
  const value = String(headline || "").trim();
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower.endsWith("'s profile") || lower.endsWith("’s profile")) return null;
  if (name && lower === `${name.trim().toLowerCase()}'s profile`) return null;
  return value;
}

/** Prefer profile/user display name — never invent from profession. */
function displayName(names: Map<string, string>, userId: string) {
  return names.get(userId)?.trim() || "Member";
}

/** Matrimonial default: males see females, females see males. */
export function oppositeGender(gender?: string | null): "MALE" | "FEMALE" | null {
  if (gender === "MALE") return "FEMALE";
  if (gender === "FEMALE") return "MALE";
  return null;
}

export class MatchmakingService {
  async search(userId: string, filters: MatchFilters = {}) {
    await connectMongo();
    const { page, limit, skip } = normalizePagination(filters);

    const prefs =
      filters.applyPreferences !== false
        ? await PartnerPreferences.findOne({ userId }).lean()
        : null;

    const selfProfile = await Profile.findOne({ userId }).lean();
    const targetGender = oppositeGender(selfProfile?.gender);

    const query: Record<string, unknown> = {
      userId: { $ne: userId },
      status: "ACTIVE",
      visibility: { $ne: "HIDDEN" },
      // Profile picture is mandatory for discovery
      "photos.0": { $exists: true },
    };

    // Same-gender profiles are never suggested for matchmaking
    if (targetGender) {
      query.gender = targetGender;
    }

    const city = filters.city;
    if (city && city !== "all") {
      query.city = city;
    } else if (city !== "all" && filters.applyPreferences !== false && prefs?.cities?.[0]) {
      query.city = prefs.cities[0];
    }
    if (filters.religion) {
      query.religion = filters.religion;
    } else if (filters.applyPreferences !== false && prefs?.religions?.[0]) {
      query.religion = prefs.religions[0];
    }
    if (filters.profession) query.profession = new RegExp(filters.profession, "i");
    if (filters.education) query.education = new RegExp(filters.education, "i");
    if (filters.language) query.languages = filters.language;

    const minHeight = filters.minHeightCm ?? prefs?.heightMinCm ?? undefined;
    const maxHeight = filters.maxHeightCm ?? prefs?.heightMaxCm ?? undefined;
    if (minHeight || maxHeight) {
      query.heightCm = {};
      if (minHeight) (query.heightCm as Record<string, number>).$gte = minHeight;
      if (maxHeight) (query.heightCm as Record<string, number>).$lte = maxHeight;
    }

    const [selfChart, candidates] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Profile.find(query).limit(200).lean(),
    ]);

    const selfMoon = selfChart ? moonMeta(selfChart) : null;
    const candidateIds = candidates.map((c) => c.userId);
    const [charts, names] = await Promise.all([
      Horoscope.find({ userId: { $in: candidateIds } })
        .sort({ calculatedAt: -1 })
        .lean(),
      resolveUserNames(candidateIds),
    ]);
    const chartByUser = new Map<string, (typeof charts)[number]>();
    for (const c of charts) {
      if (!chartByUser.has(c.userId)) chartByUser.set(c.userId, c);
    }

    const minAge = filters.minAge ?? prefs?.ageMin ?? undefined;
    const maxAge = filters.maxAge ?? prefs?.ageMax ?? undefined;
    const minGuna = prefs?.minCompatibilityScore ?? undefined;
    const minCompatPct = filters.minCompatibility ?? undefined;
    const manglikFilter =
      filters.manglik && filters.manglik !== "ANY"
        ? filters.manglik
        : prefs?.manglikPreference &&
            prefs.manglikPreference !== "ANY" &&
            prefs.manglikPreference !== "PARTIAL_OK"
          ? (prefs.manglikPreference as "NON_MANGLIK" | "MANGLIK")
          : "ANY";

    let ranked: Omit<RankedMatch, "rank">[] = candidates.map((profile) => {
      const age = ageFromDob(profile.dateOfBirth as Date | null);
      const chart = chartByUser.get(profile.userId);
      let compatibilityScore = 0;
      let totalGuna = 0;
      let maxGuna = 36;
      let reasons: string[] = [];
      let gunaBreakdown: RankedMatch["gunaBreakdown"] = [];

      if (selfMoon && chart && selfChart) {
        const other = moonMeta(chart);
        const blended = scoreMatchBlend({
          moonSignA: selfMoon.moonSign,
          moonSignB: other.moonSign,
          nakshatraA: selfMoon.nakshatra,
          nakshatraB: other.nakshatra,
          manglikA: selfMoon.manglik,
          manglikB: other.manglik,
          planetsA: toPlanetsLite(selfChart),
          planetsB: toPlanetsLite(chart),
        });
        compatibilityScore = blended.compatibilityScore;
        totalGuna = blended.totalGuna;
        maxGuna = blended.maxGuna;
        reasons = blended.strengths.slice(0, 3);
        gunaBreakdown = blended.gunaBreakdown;
      } else {
        reasons = ["Complete both kundlis for Vedic ranking"];
      }

      const photo =
        profile.photos?.find((p) => p.isPrimary)?.secureUrl ||
        profile.photos?.[0]?.secureUrl ||
        null;
      const name = displayName(names, profile.userId);
      const tagline = sanitizeHeadline(profile.headline, name);

      return {
        userId: profile.userId,
        name,
        age,
        city: profile.city ?? null,
        profession: profile.profession ?? null,
        education: profile.education ?? null,
        religion: profile.religion ?? null,
        languages: profile.languages || [],
        heightCm: profile.heightCm ?? null,
        manglik: chart?.manglikStatus || "UNKNOWN",
        nakshatra: chart ? moonMeta(chart).nakshatra : null,
        compatibilityScore,
        totalGuna,
        maxGuna,
        photo,
        reasons,
        about: profile.about ?? null,
        headline: tagline,
        cardSummary: reasons[0] || tagline || profile.about || "Explore this connection",
        gunaBreakdown,
      };
    });

    if (filters.q) {
      const q = filters.q.toLowerCase();
      ranked = ranked.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.profession || "").toLowerCase().includes(q) ||
          (m.city || "").toLowerCase().includes(q) ||
          (m.education || "").toLowerCase().includes(q),
      );
    }
    if (minAge != null) ranked = ranked.filter((m) => m.age == null || m.age >= minAge);
    if (maxAge != null) ranked = ranked.filter((m) => m.age == null || m.age <= maxAge);
    if (manglikFilter && manglikFilter !== "ANY") {
      ranked = ranked.filter((m) => m.manglik === manglikFilter);
    }
    if (minGuna != null && filters.minCompatibility == null) {
      ranked = ranked.filter((m) => m.totalGuna >= minGuna);
    }
    if (minCompatPct != null) {
      ranked = ranked.filter((m) => m.compatibilityScore >= minCompatPct);
    }

    ranked.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    const pageItems: RankedMatch[] = ranked.slice(skip, skip + limit).map((item, index) => ({
      ...item,
      rank: skip + index + 1,
    }));

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
      ...toPaginatedResult(pageItems, ranked.length, page, limit),
      self: {
        hasChart: Boolean(selfChart),
        city: selfProfile?.city,
      },
    };
  }

  async getCandidate(viewerUserId: string, candidateUserId: string) {
    await connectMongo();
    const [profile, chart, names, match] = await Promise.all([
      Profile.findOne({ userId: candidateUserId, status: "ACTIVE" }).lean(),
      Horoscope.findOne({ userId: candidateUserId }).sort({ calculatedAt: -1 }).lean(),
      resolveUserNames([candidateUserId]),
      Match.findOne({ userId: viewerUserId, candidateUserId }).lean(),
    ]);
    if (!profile) return null;

    await this.recordVisit(viewerUserId, candidateUserId);

    let scored: ReturnType<typeof scoreMatchBlend> | null = null;
    const selfChart = await Horoscope.findOne({ userId: viewerUserId })
      .sort({ calculatedAt: -1 })
      .lean();
    if (selfChart && chart) {
      const a = moonMeta(selfChart);
      const b = moonMeta(chart);
      scored = scoreMatchBlend({
        moonSignA: a.moonSign,
        moonSignB: b.moonSign,
        nakshatraA: a.nakshatra,
        nakshatraB: b.nakshatra,
        manglikA: a.manglik,
        manglikB: b.manglik,
        planetsA: toPlanetsLite(selfChart),
        planetsB: toPlanetsLite(chart),
      });
    }

    const name = displayName(names, candidateUserId);
    const headline = sanitizeHeadline(profile.headline, name);

    return {
      userId: candidateUserId,
      name,
      age: ageFromDob(profile.dateOfBirth as Date | null),
      city: profile.city,
      profession: profile.profession,
      company: profile.company,
      education: profile.education,
      religion: profile.religion,
      languages: profile.languages,
      heightCm: profile.heightCm,
      about: profile.about,
      headline,
      photos: profile.photos,
      manglik: chart?.manglikStatus || "UNKNOWN",
      nakshatra: chart ? moonMeta(chart).nakshatra : null,
      moonSign: chart?.moonSign || null,
      compatibilityScore: scored?.compatibilityScore ?? match?.compatibilityScore ?? 0,
      totalGuna: scored?.totalGuna ?? 0,
      maxGuna: scored?.maxGuna ?? 36,
      gunaBreakdown: scored?.gunaBreakdown ?? [],
      strengths: scored?.strengths ?? [],
      challenges: scored?.challenges ?? [],
      reasons: match?.reasons ?? scored?.strengths?.slice(0, 3) ?? [],
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

  private async enrichPeople(
    userIds: string[],
    viewerId: string,
  ): Promise<
    Map<
      string,
      {
        name: string;
        city: string | null;
        profession: string | null;
        photo: string | null;
        compatibilityScore: number;
      }
    >
  > {
    const [profiles, names, matches] = await Promise.all([
      Profile.find({ userId: { $in: userIds } }).lean(),
      resolveUserNames(userIds),
      Match.find({ userId: viewerId, candidateUserId: { $in: userIds } }).lean(),
    ]);
    const matchBy = new Map(matches.map((m) => [m.candidateUserId, m.compatibilityScore || 0]));
    const map = new Map<
      string,
      {
        name: string;
        city: string | null;
        profession: string | null;
        photo: string | null;
        compatibilityScore: number;
      }
    >();
    for (const p of profiles) {
      map.set(p.userId, {
        name: displayName(names, p.userId),
        city: p.city ?? null,
        profession: p.profession ?? null,
        photo: p.photos?.find((ph) => ph.isPrimary)?.secureUrl || p.photos?.[0]?.secureUrl || null,
        compatibilityScore: matchBy.get(p.userId) || 0,
      });
    }
    return map;
  }

  async listLikes(userId: string) {
    await connectMongo();
    const sent = await Like.find({ fromUserId: userId, status: "ACTIVE" })
      .sort({ createdAt: -1 })
      .lean();
    const received = await Like.find({ toUserId: userId, status: "ACTIVE" })
      .sort({ createdAt: -1 })
      .lean();
    const otherIds = [
      ...new Set([...sent.map((l) => l.toUserId), ...received.map((l) => l.fromUserId)]),
    ];
    const people = await this.enrichPeople(otherIds, userId);
    const mutualSet = new Set(
      sent.filter((s) => received.some((r) => r.fromUserId === s.toUserId)).map((s) => s.toUserId),
    );

    return {
      sent: sent.map((l) => ({
        ...l,
        ...(people.get(l.toUserId) || { name: "Member", city: null, profession: null }),
        mutual: mutualSet.has(l.toUserId),
      })),
      received: received.map((l) => ({
        ...l,
        ...(people.get(l.fromUserId) || { name: "Member", city: null, profession: null }),
        mutual: mutualSet.has(l.fromUserId),
      })),
    };
  }

  async listShortlist(userId: string) {
    await connectMongo();
    const items = await Shortlist.find({ userId, status: "ACTIVE" }).sort({ createdAt: -1 }).lean();
    const people = await this.enrichPeople(
      items.map((i) => i.targetUserId),
      userId,
    );
    return items.map((item) => ({
      ...item,
      ...(people.get(item.targetUserId) || { name: "Member", city: null, profession: null }),
    }));
  }

  async listVisitors(userId: string) {
    await connectMongo();
    const visitors = await Visitor.find({ profileUserId: userId, status: "ACTIVE" })
      .sort({ lastVisitedAt: -1 })
      .lean();
    const people = await this.enrichPeople(
      visitors.map((v) => v.visitorUserId),
      userId,
    );
    return visitors.map((v) => ({
      ...v,
      ...(people.get(v.visitorUserId) || { name: "Member", city: null, profession: null }),
    }));
  }

  async recommend(userId: string) {
    return this.search(userId, {
      limit: 10,
      page: 1,
      minCompatibility: 0,
      applyPreferences: true,
    });
  }
}

export const matchmakingService = new MatchmakingService();
