# Architecture

## System overview

```mermaid
flowchart TB
  subgraph Clients
    Web[Next.js Web App]
    Mobile[Future Mobile Clients]
  end

  subgraph Edge["Delivery Edge"]
    Vercel[Vercel / CDN]
  end

  subgraph App["Application Layer"]
    RSC[React Server Components]
    RH[Route Handlers]
    Features[Feature Modules]
  end

  subgraph Data["Data & Cache"]
    PG[(PostgreSQL)]
    Redis[(Redis)]
  end

  subgraph External["External Services"]
    Auth[Better Auth]
    Cloudinary[Cloudinary]
    OpenAI[OpenAI]
    Sweph[Swiss Ephemeris]
    Stripe[Stripe]
    Razorpay[Razorpay]
  end

  Web --> Vercel --> RSC
  Mobile --> RH
  RSC --> Features
  RH --> Features
  Features --> PG
  Features --> Redis
  Features --> Auth
  Features --> Cloudinary
  Features --> OpenAI
  Features --> Sweph
  Features --> Stripe
  Features --> Razorpay
```

## Architectural principles

1. **Feature-based modularity** — business capabilities live under `src/features/*` with clear public exports.
2. **Clean boundaries** — UI depends on hooks/services; services depend on infrastructure adapters.
3. **Server-first data** — prefer Server Components and route handlers; hydrate client islands only when interaction demands it.
4. **Strict typing** — Zod at boundaries, TypeScript strict mode, no unchecked indexed access.
5. **Dependency injection via factories/singletons** — Prisma, Redis, OpenAI, Stripe, Razorpay, Cloudinary, and Swiss Ephemeris are encapsulated services.
6. **Scale readiness** — Redis for cache/sessions, Postgres for durable state, image CDN via Cloudinary, horizontal-friendly Next.js deployment.

## Request flow

1. Browser hits App Router route group (`(landing)`, `(auth)`, `(dashboard)`).
2. Layouts compose shared chrome (navbar/sidebar/auth shell).
3. Feature sections render as Server Components with client motion/UI islands.
4. API route handlers return standardized `successResponse` / `errorResponse` envelopes.
5. Infrastructure clients are lazily initialized and reused via `globalThis` in development.

## Security posture (foundation)

- `poweredByHeader` disabled
- Environment validation helpers
- Timing-safe Razorpay signature verification
- Stripe webhook signature construction helper
- Auth secret reserved for Better Auth integration in the next phase

## Next phases

- Domain schema (users, profiles, charts, matches, conversations, subscriptions)
- Better Auth session wiring
- Matchmaking ranking pipeline
- Realtime chat
- Admin operations console
