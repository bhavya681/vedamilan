import { Mastra } from "@mastra/core";

import { vedaAgents } from "./agents/veda-agents";

export const mastra = new Mastra({
  agents: {
    astrologerGuruAgent: vedaAgents.ASTROLOGER_GURU,
    horoscopeAgent: vedaAgents.HOROSCOPE,
    compatibilityAgent: vedaAgents.COMPATIBILITY,
    marriageTimingAgent: vedaAgents.MARRIAGE_TIMING,
    relationshipCoachAgent: vedaAgents.RELATIONSHIP_COACH,
    profileAnalysisAgent: vedaAgents.PROFILE_ANALYSIS,
    searchAgent: vedaAgents.SEARCH,
    recommendationAgent: vedaAgents.RECOMMENDATION,
    notificationAgent: vedaAgents.NOTIFICATION,
    reportAgent: vedaAgents.REPORT,
    supportAgent: vedaAgents.SUPPORT,
    wisdomGuideAgent: vedaAgents.WISDOM_GUIDE,
    virtualAstrologerAgent: vedaAgents.VIRTUAL_ASTROLOGER,
  },
});

export { vedaAgents };
export type { VedaAgentKey } from "./agents/veda-agents";
