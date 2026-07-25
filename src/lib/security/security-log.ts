import { AuditLog } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { logger } from "@/lib/utils/logger";

export type SecurityEventSeverity = "INFO" | "WARN" | "CRITICAL";

export type SecurityEventInput = {
  action: string;
  resource: string;
  resourceId?: string | null;
  actorUserId?: string | null;
  severity?: SecurityEventSeverity;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

const SENSITIVE_META_KEYS = /password|secret|token|otp|authorization|cookie|card|cvv|key/i;

function redactMetadata(meta: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!meta) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_META_KEYS.test(key)) {
      out[key] = "[REDACTED]";
      continue;
    }
    if (typeof value === "string" && value.length > 500) {
      out[key] = `${value.slice(0, 500)}…`;
      continue;
    }
    out[key] = value;
  }
  return out;
}

/**
 * Persist a security-relevant event. Never throws to callers — logging must not break requests.
 */
export async function recordSecurityEvent(input: SecurityEventInput): Promise<void> {
  const payload = {
    actorUserId: input.actorUserId ?? null,
    action: input.action,
    resource: input.resource,
    resourceId: input.resourceId ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    metadata: redactMetadata(input.metadata),
    severity: input.severity ?? "INFO",
  };

  logger.info(
    {
      security: true,
      action: payload.action,
      resource: payload.resource,
      actorUserId: payload.actorUserId,
      severity: payload.severity,
    },
    "security_event",
  );

  try {
    await connectMongo();
    await AuditLog.create(payload);
  } catch (error) {
    logger.warn({ err: error, action: input.action }, "Failed to persist security audit event");
  }
}

export function clientIpFromRequest(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}
