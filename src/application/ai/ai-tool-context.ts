import { AsyncLocalStorage } from "async_hooks";

import { ForbiddenError } from "@/lib/utils/error-handler";

/**
 * Request-scoped identity for Mastra tools.
 * Tools must NEVER trust LLM-supplied userId arguments.
 */
export type AiToolContext = {
  sessionUserId: string;
  /** Optional partner the member is discussing; only this candidate may be loaded. */
  allowedCandidateUserId?: string | null;
};

export const aiToolContext = new AsyncLocalStorage<AiToolContext>();

export function runWithAiToolContext<T>(ctx: AiToolContext, fn: () => Promise<T>): Promise<T> {
  return aiToolContext.run(ctx, fn);
}

/** Always returns the authenticated session user — ignores any tool argument. */
export function requireSessionToolUserId(_requested?: string | null): string {
  const ctx = aiToolContext.getStore();
  if (!ctx?.sessionUserId) {
    throw new ForbiddenError("AI tool context is not authenticated");
  }
  return ctx.sessionUserId;
}

/**
 * Candidate access is allowlisted from the chat API (session-bound).
 * Ignores arbitrary LLM-chosen candidate ids.
 */
export function resolveAllowedCandidateUserId(requested?: string | null): string | undefined {
  const ctx = aiToolContext.getStore();
  if (!ctx?.sessionUserId) {
    throw new ForbiddenError("AI tool context is not authenticated");
  }
  const allowed = ctx.allowedCandidateUserId || undefined;
  if (!requested) return allowed;
  if (allowed && requested === allowed) return allowed;
  if (requested === ctx.sessionUserId) return undefined;
  // Never honor a candidate id outside the allowlist
  return allowed;
}
