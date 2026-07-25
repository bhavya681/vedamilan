# Security Architecture — VedaMilan AI

## Principles

- Secure by design / secure by default
- Least privilege
- Zero trust for client claims
- Defense in depth
- Fail closed for security-critical paths (e.g. Redis rate limit in production)

## Identity & session

- Better Auth + MongoDB adapter
- HttpOnly cookies; `Secure` in production; `SameSite=Lax`
- `requireSession()` on protected APIs
- `requireAdmin()` / `isAdmin()` for admin UI
- Shorter cookie cache (60s) to reduce stale privilege windows

## Authorization layers

```text
requireSession
  → ownership / membership (chat, notes, payments)
  → assertCandidateAccessible (discovery / AI candidate)
  → requireEntitlement (premium features)
  → requireAdmin (admin surfaces)
```

## Data classification (summary)

See `DATA_CLASSIFICATION.md`.

## Logging

- Operational: pino (`logger`)
- Security: `recordSecurityEvent` → `AuditLog` (no secrets/OTPs/passwords)
- API errors: sanitized client messages (`Something went wrong.` for unexpected 500s)

## Payments

1. Client sends `planCode` only
2. Server loads Plan price
3. Creates PENDING Payment
4. Provider capture
5. Signature / webhook verification
6. Atomic SUCCEEDED claim + entitlement activation
