# Developer Guide

## Prerequisites

- Node.js 22+
- npm 10+
- Docker Desktop (for Postgres + Redis)
- Optional: Swiss Ephemeris ephemeris files in `./ephe`

## Local setup

1. Install dependencies: `npm install`
2. Copy env: `cp .env.example .env`
3. Start infrastructure:

```bash
docker compose -f docker/docker-compose.yml up -d postgres redis
```

4. Generate Prisma client: `npm run db:generate`
5. Apply baseline migration: `npm run db:migrate:deploy`
6. Run app: `npm run dev`

## Coding standards

- Feature code belongs in `src/features/<feature>`
- Shared primitives belong in `src/components` or `src/lib`
- Never import server-only services (`prisma`, `redis`, `sweph`, payment SDKs) into Client Components
- Use `cn()` for class composition
- Prefer semantic HTML and accessible labels
- Keep route handler responses in the shared API envelope

## Environment notes

- `DATABASE_URL` is required for Prisma access
- `REDIS_URL` is required when calling Redis helpers
- Payment/AI/Cloudinary keys are optional until those features are exercised
- `MAINTENANCE_MODE` is reserved for edge middleware in a later phase; a static `/maintenance` page is available now

## Quality gates

```bash
npm run lint
npm run typecheck
npm run build
```

Husky runs `lint-staged` on commit (ESLint + Prettier).

## Swiss Ephemeris

`SwissEphemerisService` wraps `sweph`. Place ephemeris files under the path configured by `SWISS_EPHEMERIS_PATH` (default `./ephe`). Without files, some calculations may fall back to built-in approximations depending on sweph configuration—provision real ephemeris assets before production astrology workloads.

## Deployment

- **Vercel:** set env vars in project settings; run `prisma migrate deploy` in CI before/with build
- **Railway / Docker:** use `docker/Dockerfile` (standalone output) and compose services for Postgres/Redis

## Troubleshooting

- Prisma client missing: run `npm run db:generate`
- Redis connection errors: ensure Docker Redis is healthy and `REDIS_URL` is set
- Theme flash: root layout uses `suppressHydrationWarning` with `next-themes`
