# API Security Notes — VedaMilan AI

## Authentication

- Cookie session via Better Auth (`/api/auth/*`)
- Protected business APIs: `requireSession()`
- Public: `/api/health`, `/api/ready`, `/api/ai/guide` (rate-limited)

## Object-level authorization

| Resource          | Rule                               |
| ----------------- | ---------------------------------- |
| Profile self      | `session.user.id`                  |
| Candidate profile | `assertCandidateAccessible`        |
| Chat / messages   | participant membership             |
| Private notes     | `ownerUserId === session.user.id`  |
| Shared journey    | connected pair                     |
| Payments          | Payment.userId === session.user.id |
| AI conversations  | `AiConversation.userId`            |

## Property-level authorization

- Profile updates: `profileUpdateSchema.strict()` — rejects `role`, `status`, `isVerified`, etc.
- Localization PATCH does **not** mutate `status` / `deletedAt`

## Rate limits (representative)

| Key pattern               | Limit                    |
| ------------------------- | ------------------------ |
| `auth:*`                  | 15 / min / IP            |
| `ai:chat:*`               | 15–40 / min + daily caps |
| `chat:send:*`             | 60 / min                 |
| `compatibility:compare:*` | 20 / min                 |
| `profile:photos:*`        | 15 / min                 |
| `billing:checkout:*`      | 10 / min                 |

## CSRF

Mutating routes (photos, blocks, checkout, razorpay verify) call `assertSameOriginMutation` against `NEXT_PUBLIC_APP_URL`.

## Inventory hygiene

- No Server Actions currently
- No first-party `/api/admin/*` (admin is RSC + Better Auth admin plugin)
- Deprecated Prisma paths may still exist in package.json — do not expose as APIs
