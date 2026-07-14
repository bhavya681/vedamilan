import { Agent } from "@mastra/core/agent";

import { VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import {
  getCompatibilityTool,
  getHoroscopeTool,
  getMarriageTimingTool,
  getProfileTool,
  getRecommendationsTool,
} from "../tools/veda-tools";

const EXPLAIN_ONLY_RULES = `
CRITICAL RULES:
- You NEVER calculate astrology, gunas, dashas, yogas, doshas, or planet positions.
- You ONLY explain data returned by your tools (rule engines / stored charts).
- If a tool says data is missing, ask the user to generate kundli / add birth details.
- Write clear, compassionate relationship guidance.
- Every response MUST end with exactly this disclaimer on its own line:
${VEDIC_AI_DISCLAIMER}
`;

function resolveModel(): string {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return "google/gemini-2.5-pro";
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_MODEL || "openai/gpt-4o";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic/claude-sonnet-4-20250514";
  return "openai/gpt-4o";
}

const model = resolveModel();

export const horoscopeAgent = new Agent({
  id: "horoscope-agent",
  name: "Horoscope Agent",
  instructions: `You explain Vedic birth charts and dashas in plain language.
Use get-horoscope-chart before answering.
${EXPLAIN_ONLY_RULES}`,
  model,
  tools: { getHoroscopeTool },
});

export const compatibilityAgent = new Agent({
  id: "compatibility-agent",
  name: "Compatibility Agent",
  instructions: `You explain Ashta Koota compatibility reports in plain language.
Use get-compatibility-report before answering.
${EXPLAIN_ONLY_RULES}`,
  model,
  tools: { getCompatibilityTool },
});

export const marriageTimingAgent = new Agent({
  id: "marriage-timing-agent",
  name: "Marriage Timing Agent",
  instructions: `You explain traditional marriage timing windows from dasha rule output.
Use get-marriage-timing before answering.
${EXPLAIN_ONLY_RULES}`,
  model,
  tools: { getMarriageTimingTool },
});

export const relationshipCoachAgent = new Agent({
  id: "relationship-coach-agent",
  name: "Relationship Coach Agent",
  instructions: `You coach intentional relationships using profile + chart tool context.
Use get-profile-summary and get-horoscope-chart when relevant.
Never invent astrology facts.
${EXPLAIN_ONLY_RULES}`,
  model,
  tools: { getProfileTool, getHoroscopeTool },
});

export const profileAnalysisAgent = new Agent({
  id: "profile-analysis-agent",
  name: "Profile Analysis Agent",
  instructions: `You analyze profile completeness and presentation.
Use get-profile-summary.
Suggest concrete improvements; do not invent astrology.
${EXPLAIN_ONLY_RULES}`,
  model,
  tools: { getProfileTool },
});

export const searchAgent = new Agent({
  id: "search-agent",
  name: "Search Agent",
  instructions: `You help interpret search/discover intent and explain why ranked profiles fit.
Use get-match-recommendations.
${EXPLAIN_ONLY_RULES}`,
  model,
  tools: { getRecommendationsTool },
});

export const recommendationAgent = new Agent({
  id: "recommendation-agent",
  name: "Recommendation Agent",
  instructions: `You recommend next actions and top matches from ranker output.
Use get-match-recommendations and get-profile-summary.
${EXPLAIN_ONLY_RULES}`,
  model,
  tools: { getRecommendationsTool, getProfileTool },
});

export const notificationAgent = new Agent({
  id: "notification-agent",
  name: "Notification Agent",
  instructions: `You draft clear notification copy for likes, visitors, and match updates.
Ground suggestions in tool data when available.
${EXPLAIN_ONLY_RULES}`,
  model,
  tools: { getRecommendationsTool },
});

export const reportAgent = new Agent({
  id: "report-agent",
  name: "Report Agent",
  instructions: `You summarize engine outputs into report-ready narrative sections.
Use get-horoscope-chart and get-compatibility-report as needed.
${EXPLAIN_ONLY_RULES}`,
  model,
  tools: { getHoroscopeTool, getCompatibilityTool, getMarriageTimingTool },
});

export const supportAgent = new Agent({
  id: "support-agent",
  name: "Support Agent",
  instructions: `You help members navigate VedaMilan: kundli generation, matching, billing basics, and privacy.
Use get-profile-summary when helpful.
Do not invent product policies.
${EXPLAIN_ONLY_RULES}`,
  model,
  tools: { getProfileTool },
});

export const vedaAgents = {
  HOROSCOPE: horoscopeAgent,
  COMPATIBILITY: compatibilityAgent,
  MARRIAGE_TIMING: marriageTimingAgent,
  RELATIONSHIP_COACH: relationshipCoachAgent,
  PROFILE_ANALYSIS: profileAnalysisAgent,
  SEARCH: searchAgent,
  RECOMMENDATION: recommendationAgent,
  NOTIFICATION: notificationAgent,
  REPORT: reportAgent,
  SUPPORT: supportAgent,
} as const;

export type VedaAgentKey = keyof typeof vedaAgents;
