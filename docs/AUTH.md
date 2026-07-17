# Authentication (Module 2)

Better Auth + MongoDB adapter. Auth collections `user`, `session`, `account`, `verification` are owned by Better Auth (not Mongoose).

## Features

| Feature                           | Status                                                              |
| --------------------------------- | ------------------------------------------------------------------- |
| Email + password login/register   | Live                                                                |
| Forgot / reset password           | Live (dev logs reset URL)                                           |
| Email verification OTP            | Live (dev logs OTP; not used for passwordless login)                |
| Passwordless OTP login            | Disabled (redirects to `/login`)                                    |
| Phone OTP login                   | Disabled                                                            |
| Google OAuth                      | When `GOOGLE_CLIENT_*` set + `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` |
| Sessions + secure cookies         | Live                                                                |
| Protected `/dashboard` + `/admin` | Middleware cookie gate                                              |
| RBAC helpers                      | `getUserRoles` / `isAdmin`                                          |
| `GET /api/auth/me`                | Session payload                                                     |

## Routes

- `POST/GET /api/auth/[...all]` — Better Auth handler
- `GET /api/auth/me` — current user

## Seed accounts

After `npm run db:seed` (requires `MONGODB_URI` + `BETTER_AUTH_SECRET`):

| Email                   | Password          | Role  |
| ----------------------- | ----------------- | ----- |
| admin@vedamilan.ai      | VedaMilanAdmin!23 | admin |
| ananya.sharma@email.com | AnanyaDemo!23     | user  |

## Hard rule

Never store passwords in app code beyond seed. Production: rotate seed passwords immediately.
