# Environment Variables

Copy `.env.example` to `.env.local` / `.env` and fill secrets.

## Required for Module 1+

| Variable              | Description                             |
| --------------------- | --------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Public app URL                          |
| `MONGODB_URI`         | MongoDB Atlas SRV connection string     |
| `BETTER_AUTH_SECRET`  | ≥32 char secret (Module 2)              |
| `BETTER_AUTH_URL`     | Auth base URL (usually same as app URL) |

## Integrations (enable per module)

Redis, Cloudinary, Stripe, Razorpay, Resend, Twilio, Pusher, OpenAI, Gemini, Anthropic — see `.env.example`.

## Swiss Ephemeris

`SWISS_EPHEMERIS_PATH` — directory containing ephemeris files for `sweph`.
