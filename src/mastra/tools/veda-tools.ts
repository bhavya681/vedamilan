import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
  requireSessionToolUserId,
  resolveAllowedCandidateUserId,
} from "@/application/ai/ai-tool-context";
import { Horoscope, Dasha, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { compatibilityService } from "@/application/rules/compatibility.service";
import { matchmakingService } from "@/application/matchmaking/matchmaking.service";
import { computeGocharForUser } from "@/application/horoscope/gochar.service";

/**
 * Tools only read calculated engine/DB data.
 * AI must never invent planet positions, scores, or dashas.
 * Identity always comes from AsyncLocalStorage session context — not LLM args.
 */

const optionalUserId = z
  .string()
  .optional()
  .describe("Ignored — server binds the authenticated member id");

export const getHoroscopeTool = createTool({
  id: "get-horoscope-chart",
  description:
    "Load the authenticated member's stored Vedic kundli chart, yogas, doshas, and dasha. Never invent planets.",
  inputSchema: z.object({
    userId: optionalUserId,
  }),
  execute: async () => {
    const userId = requireSessionToolUserId();
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
    const yogas = chart.yogas || [];
    return {
      found: true as const,
      chart: {
        lagnaSign: chart.lagnaSign,
        lagnaDegree: chart.lagnaDegree,
        moonSign: chart.moonSign,
        sunSign: chart.sunSign,
        manglikStatus: chart.manglikStatus,
        planets: (chart.planets || []).map((p) => ({
          planet: p.planet,
          sign: p.sign,
          house: p.house,
          nakshatra: p.nakshatra,
          pada: p.nakshatraPada,
          dignity: p.dignity,
          isRetrograde: p.isRetrograde,
          longitude: p.longitude,
        })),
        yogas,
        rajaYogas: yogas.filter((y) =>
          /raja|gajakesari|dharma.?karma|budhaditya/i.test(y.code + y.name),
        ),
        doshas: chart.doshas || [],
      },
      dasha: dasha
        ? {
            system: dasha.system,
            currentMaha: dasha.currentMaha,
            currentAntar: dasha.currentAntar,
            balanceAtBirth: dasha.balanceAtBirth,
            periods: (dasha.periods || []).slice(0, 16).map((p) => ({
              lord: p.lord,
              level: p.level,
              parentLord: p.parentLord,
              startDate: p.startDate,
              endDate: p.endDate,
            })),
          }
        : null,
    };
  },
});

export const getGocharTool = createTool({
  id: "get-gochar-transits",
  description:
    "Load current Gochar (transit) planets relative to the authenticated member's natal Lagna.",
  inputSchema: z.object({
    userId: optionalUserId,
  }),
  execute: async () => {
    const userId = requireSessionToolUserId();
    try {
      const gochar = await computeGocharForUser(userId);
      return { found: true as const, gochar };
    } catch {
      return {
        found: false as const,
        message: "Generate kundli and birth details before reading Gochar.",
      };
    }
  },
});

export const getCompatibilityTool = createTool({
  id: "get-compatibility-report",
  description:
    "Load or compute deep compatibility for the authenticated member. Candidate must be the allowlisted partner from the chat context.",
  inputSchema: z.object({
    userId: optionalUserId,
    candidateUserId: z
      .string()
      .optional()
      .describe("Optional; only honored if it matches the chat allowlist"),
  }),
  execute: async ({ candidateUserId: requestedCandidate }) => {
    const userId = requireSessionToolUserId();
    const candidateUserId = resolveAllowedCandidateUserId(requestedCandidate);
    if (!candidateUserId) {
      const reports = await compatibilityService.listForUser(userId);
      return { mode: "list" as const, reports: reports.slice(0, 5) };
    }
    const result = await compatibilityService.compare(userId, candidateUserId);
    const report = result.report as Record<string, unknown>;
    return {
      mode: "compare" as const,
      report: {
        totalGuna: report.totalGuna,
        maxGuna: report.maxGuna,
        overallScore: report.overallScore,
        deepOverallScore: report.deepOverallScore,
        decisionSummary: report.decisionSummary,
        decisionReason: report.decisionReason,
        manglikCompatibility: report.manglikCompatibility,
        nadiDosha: report.nadiDosha,
        bhakootDosha: report.bhakootDosha,
        strengths: report.strengths,
        challenges: report.challenges,
        gunaBreakdown: report.gunaBreakdown,
        shukraMilan: report.shukraMilan,
        categoryScores: report.categoryScores,
        deepAnalysis: report.deepAnalysis,
        marriageWindows: Array.isArray(report.marriageWindows)
          ? report.marriageWindows.slice(0, 5)
          : [],
        advancedMarriageDynamics: report.advancedMarriageDynamics || null,
      },
    };
  },
});

export const getMarriageTimingTool = createTool({
  id: "get-marriage-timing",
  description:
    "Load multi-factor marriage timing for the authenticated member. Never invent dates.",
  inputSchema: z.object({
    userId: optionalUserId,
  }),
  execute: async () => {
    const userId = requireSessionToolUserId();
    const timing = await compatibilityService.marriageTimingForUser(userId);
    return {
      manglikStatus: timing.manglikStatus,
      currentMaha: timing.currentMaha,
      currentAntar: timing.currentAntar,
      seventhLord: timing.seventhLord,
      windows: (timing.windows || []).slice(0, 8),
      partnerArrivalWindows: (timing.partnerArrivalWindows || []).slice(0, 4),
      timingPrediction: timing.timingPrediction,
      gochar: timing.gochar,
    };
  },
});

export const getProfileTool = createTool({
  id: "get-profile-summary",
  description: "Load the authenticated member profile summary for coaching context.",
  inputSchema: z.object({
    userId: optionalUserId,
  }),
  execute: async () => {
    const userId = requireSessionToolUserId();
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
  description: "Load ranked matchmaking recommendations for the authenticated member.",
  inputSchema: z.object({
    userId: optionalUserId,
  }),
  execute: async () => {
    const userId = requireSessionToolUserId();
    const result = await matchmakingService.recommend(userId);
    return {
      hasChart: result.self.hasChart,
      matches: (result.data || []).slice(0, 8).map((m) => ({
        userId: m.userId,
        name: m.name,
        city: m.city,
        profession: m.profession,
        matchScore: m.compatibilityScore,
        totalGuna: m.totalGuna,
        reasons: m.reasons,
        manglik: m.manglik,
      })),
    };
  },
});
