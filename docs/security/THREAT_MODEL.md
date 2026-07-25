# Threat Model — VedaMilan AI

## System context

```text
Internet
  → CDN / WAF (recommended)
  → Next.js (App Router + API routes)
  → Application services
  → MongoDB Atlas
  → Redis (rate limits / ephemeral)
  → Pusher (realtime)
  → Stripe / Razorpay
  → Cloudinary
  → AI providers (Mastra)
  → Resend / Twilio
```

## Assets

| Asset                               | Sensitivity |
| ----------------------------------- | ----------- |
| Credentials / sessions              | Critical    |
| Birth time / place / Kundli         | High        |
| Private notes / Couple Space / chat | High        |
| AI conversation context             | High        |
| Payment & entitlement state         | High        |
| Profile photos / PII                | Medium–High |
| Public marketing content            | Low         |

## Trust boundaries

1. Browser ↔ Next.js (cookie session, SameSite=Lax)
2. Next.js ↔ MongoDB / Redis
3. Next.js ↔ Payment providers (signed webhooks)
4. Next.js ↔ Pusher (server-authorized private channels)
5. Next.js ↔ AI tools (session-derived context only)
6. Next.js ↔ Cloudinary (server SDK)

## Primary threat actors

- Anonymous internet attacker
- Authenticated member (horizontal privilege / IDOR)
- Compromised browser / CSRF
- Abusive scraper / bot
- Malicious payment callback / replay
- Prompt-injection against AI tools

## Key abuse cases & controls

| Abuse                            | Control                                             |
| -------------------------------- | --------------------------------------------------- |
| Cross-user private note / chat   | Owner + participant checks                          |
| Hidden / blocked profile access  | `assertCandidateAccessible`                         |
| Premium bypass via client flags  | Server entitlements + signed payment verify         |
| Open redirect after login        | `sanitizeInternalPath`                              |
| SSRF via photo URL               | `assertSafePublicHttpsUrl` + Cloudinary-only ingest |
| Auth brute force                 | Auth route rate limits                              |
| AI quota abuse                   | Per-user rate limits + REPORT entitlement           |
| Mass assignment of role/plan     | Zod `.strict()` allowlists                          |
| Seeded default passwords in prod | Seed blocked unless `ALLOW_DB_SEED=true`            |

## Residual risks

- Field-level encryption for birth data not yet implemented
- Full GDPR export/delete workflow incomplete
- No Razorpay server webhook (client verify + signature only)
- CSP still allows `unsafe-inline` / `unsafe-eval` for Next/payment widgets
- Independent VAPT not yet executed
