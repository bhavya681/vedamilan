import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { Horoscope, Dasha, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { compatibilityService } from "@/application/rules/compatibility.service";
import { matchmakingService } from "@/application/matchmaking/matchmaking.service";

/**
 * Tools only read calculated engine/DB data.
 * AI must never invent planet positions, scores, or dashas.
 */

export const getHoroscopeTool = createTool({
  id: "get-horoscope-chart",
  description:
    "Load the user's stored Vedic kundli chart and dasha from the calculation engine. Never invent planets.",
  inputSchema: z.object({
    userId: z.string().describe("Authenticated user id"),
  }),
  execute: async ({ userId }) => {
    await connectMongo();
    const [chart, dasha] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
    ]);
    if (!chart) {
      return {
        found: false as const,
        message: "No kundli chart stored. Generate from birth details first.",
      };
    }
    return {
      found: true as const,
      chart: {
        lagnaSign: chart.lagnaSign,
        moonSign: chart.moonSign,
        sunSign: chart.sunSign,
        manglikStatus: chart.manglikStatus,
        planets: (chart.planets || []).map((p) => ({
          planet: p.planet,
          sign: p.sign,
          house: p.house,
          nakshatra: p.nakshatra,
          pada: p.nakshatraPada,
          longitude: p.longitude,
        })),
        yogas: chart.yogas || [],
        doshas: chart.doshas || [],
      },
      dasha: dasha
        ? {
            currentMaha: dasha.currentMaha,
            currentAntar: dasha.currentAntar,
            periods: (dasha.periods || []).slice(0, 12),
          }
        : null,
    };
  },
});

export const getCompatibilityTool = createTool({
  id: "get-compatibility-report",
  description:
    "Load or compute Ashta Koota compatibility from the deterministic rule engine for two users.",
  inputSchema: z.object({
    userId: z.string(),
    candidateUserId: z.string().optional(),
  }),
  execute: async ({ userId, candidateUserId }) => {
    if (!candidateUserId) {
      const reports = await compatibilityService.listForUser(userId);
      return { mode: "list" as const, reports: reports.slice(0, 5) };
    }
    const result = await compatibilityService.compare(userId, candidateUserId);
    return {
      mode: "compare" as const,
      report: {
        totalGuna: result.report.totalGuna,
        maxGuna: result.report.maxGuna,
        overallScore: result.report.overallScore,
        manglikCompatibility: result.report.manglikCompatibility,
        nadiDosha: result.report.nadiDosha,
        bhakootDosha: result.report.bhakootDosha,
        strengths: result.report.strengths,
        challenges: result.report.challenges,
        gunaBreakdown: result.report.gunaBreakdown,
        marriageWindows: result.report.marriageWindows?.slice?.(0, 5) || [],
      },
    };
  },
});

export const getMarriageTimingTool = createTool({
  id: "get-marriage-timing",
  description: "Load marriage timing windows from the dasha rule engine for the user.",
  inputSchema: z.object({
    userId: z.string(),
  }),
  execute: async ({ userId }) => {
    const timing = await compatibilityService.marriageTimingForUser(userId);
    return {
      manglikStatus: timing.manglikStatus,
      currentMaha: timing.currentMaha,
      windows: (timing.windows || []).slice(0, 8),
    };
  },
});

export const getProfileTool = createTool({
  id: "get-profile-summary",
  description: "Load the member profile summary used for relationship coaching context.",
  inputSchema: z.object({
    userId: z.string(),
  }),
  execute: async ({ userId }) => {
    await connectMongo();
    const profile = await Profile.findOne({ userId }).lean();
    if (!profile) return { found: false as const };
    return {
      found: true as const,
      headline: profile.headline,
      about: profile.about,
      city: profile.city,
      profession: profile.profession,
      education: profile.education,
      religion: profile.religion,
      isProfileComplete: profile.isProfileComplete,
      completionHints: [
        !profile.about ? "Add an about section" : null,
        !profile.photos?.length ? "Upload a photo" : null,
        !profile.profession ? "Add profession" : null,
      ].filter(Boolean),
    };
  },
});

export const getRecommendationsTool = createTool({
  id: "get-match-recommendations",
  description: "Load ranked matchmaking recommendations from the rule-based matchmaker.",
  inputSchema: z.object({
    userId: z.string(),
  }),
  execute: async ({ userId }) => {
    const result = await matchmakingService.recommend(userId);
    return {
      hasChart: result.self.hasChart,
      matches: (result.data || []).slice(0, 8).map((m) => ({
        userId: m.userId,
        name: m.name,
        city: m.city,
        profession: m.profession,
        compatibilityScore: m.compatibilityScore,
        totalGuna: m.totalGuna,
        reasons: m.reasons,
        manglik: m.manglik,
      })),
    };
  },
});
