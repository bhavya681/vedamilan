# VedaMilan AI — Backend Architecture & Module Roadmap

> CTO directive: **No UI redesign.** Wire the existing frontend to a production backend module-by-module.

## Stack (authoritative)

| Layer            | Choice                                               |
| ---------------- | ---------------------------------------------------- |
| App              | Next.js App Router (Route Handlers)                  |
| Language         | TypeScript                                           |
| Database         | **MongoDB Atlas + Mongoose**                         |
| Auth             | Better Auth (MongoDB adapter)                        |
| Cache            | Redis (ioredis)                                      |
| Storage          | Cloudinary                                           |
| Payments         | Stripe + Razorpay                                    |
| Realtime         | Pusher                                               |
| Email / SMS      | Resend / Twilio                                      |
| AI orchestration | Mastra                                               |
| Models           | Gemini 2.5 Pro, OpenAI GPT, Claude                   |
| Embeddings       | Gemini Embeddings                                    |
| Vector           | MongoDB Atlas Vector Search                          |
| Astrology calc   | Swiss Ephemeris (`sweph`) — **deterministic only**   |
| AI role          | Explain results only — **never calculate astrology** |

> **Note:** Legacy Prisma/PostgreSQL schemas under `prisma/` are **superseded** by MongoDB. Do not extend them.

## Clean architecture

```
src/
  app/api/                 # Controllers (Route Handlers)
  features/<domain>/       # UI (unchanged) + feature hooks
  domain/                  # Entities, value objects, ports (interfaces)
  application/             # Use-cases / services
  infrastructure/          # Mongoose models, external SDKs, adapters
  repositories/            # Repository implementations
  agents/                  # Mastra agents + tools
  lib/                     # Cross-cutting: env, logger, cache, auth helpers
```

**SOLID:** Services depend on repository interfaces; controllers stay thin; validation via Zod; utilities have no domain side-effects.

## Module roadmap (strict order)

| #   | Module                                                             | Done when          |
| --- | ------------------------------------------------------------------ | ------------------ |
| 1   | MongoDB schemas, indexes, connection, seed, repos                  | **Complete**       |
| 2   | Better Auth (email, Google, OTP, sessions, RBAC, protected routes) | **Complete**       |
| 3   | Profile CRUD + Cloudinary + preferences + completion               | **Complete**       |
| 4   | Swiss Ephemeris horoscope engine + persistence                     | **Complete**       |
| 5   | Deterministic rule engines (compat, timing, yogas, doshas)         | **Complete**       |
| 6   | Matchmaking + ranking + search                                     | Next               |
| 7   | Mastra agents (explain-only AI)                                    | AI insights live   |
| 8   | Chat + Pusher realtime                                             | Messages live      |
| 9   | Payments (Stripe/Razorpay) + webhooks                              | Premium live       |
| 10  | Notifications (email/SMS/in-app)                                   | Notifications live |
| 11  | Admin + audit + analytics                                          | Admin live         |
| 12  | Security hardening + rate limits                                   | OWASP checklist    |
| 13  | Performance (Redis, pagination, streaming)                         | SLOs met           |
| 14  | Full test suite + docs finalize                                    | Ship-ready         |

**Workflow per module:** implement → tests → fix → commit → next.

## AI hard rule

1. Rule engine / Swiss Ephemeris **calculate**.
2. Mastra agents **receive calculated payloads** and **explain**.
3. Every AI explanation includes the Vedic disclaimer string defined in `src/lib/constants/ai-disclaimer.ts`.

## Gate

Module 1 establishes the MongoDB foundation. No feature module ships without Module 1 + 2.
