# VedaMilan AI

AI Powered Vedic Relationship Intelligence Platform.

Frontend is complete. Backend is being wired module-by-module to production services — **no UI redesign**.

## Stack

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js Route Handlers, Clean Architecture (domain / application / infrastructure / repositories)
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** Better Auth
- **Integrations:** Cloudinary, Stripe, Razorpay, Pusher, Resend, Twilio, Redis
- **AI:** Mastra orchestration (explain-only); Gemini / OpenAI / Claude
- **Astrology:** Swiss Ephemeris + deterministic TypeScript rule engines (**AI never calculates charts**)

## Quick start

```bash
npm install
cp .env.example .env
# Set MONGODB_URI to your MongoDB Atlas connection string
# Optionally start Redis: docker compose -f docker/docker-compose.yml up -d redis
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script               | Purpose                           |
| -------------------- | --------------------------------- |
| `npm run dev`        | Local development                 |
| `npm run build`      | Production build                  |
| `npm run db:seed`    | Seed plans, FAQs, bootstrap users |
| `npm run db:indexes` | Ensure MongoDB indexes            |
| `npm run test:db`    | Module database tests             |
| `npm run typecheck`  | TypeScript check                  |

## Documentation

- [Architecture & module roadmap](docs/architecture/ARCHITECTURE.md)
- [Database (MongoDB)](docs/database/DATABASE.md)
- [Environment variables](docs/ENV.md)
- [Visual identity](docs/design/VISUAL_IDENTITY.md)

## Module status

| Module               | Status                   |
| -------------------- | ------------------------ |
| 1 MongoDB foundation | Complete                 |
| 2 Better Auth        | Complete                 |
| 3–14                 | See architecture roadmap |

## Hard rules

1. Do not redesign UI while wiring backend.
2. AI explains; rule engines + Swiss Ephemeris calculate.
3. Every AI astrology explanation includes the Vedic disclaimer.
