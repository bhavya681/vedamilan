# Mastra AI Module (Module 7)

AI **never** calculates astrology. Deterministic rule engines and stored charts provide facts; Mastra agents only explain.

## Agents

| Agent key          | Purpose                       | Tools                          |
| ------------------ | ----------------------------- | ------------------------------ |
| ASTROLOGER_GURU    | Jyotish Guru chat (main UI)   | chart + gochar + timing + more |
| HOROSCOPE          | Explain kundli / dasha        | `get-horoscope-chart`          |
| COMPATIBILITY      | Explain Ashta Koota           | `get-compatibility-report`     |
| MARRIAGE_TIMING    | Explain dasha windows         | `get-marriage-timing`          |
| RELATIONSHIP_COACH | Coaching from profile + chart | profile + horoscope tools      |
| PROFILE_ANALYSIS   | Completeness coaching         | `get-profile-summary`          |
| SEARCH             | Interpret discovery           | `get-match-recommendations`    |
| RECOMMENDATION     | Next actions + top matches    | recommendations + profile      |
| NOTIFICATION       | Notification copy             | recommendations                |
| REPORT             | Report narratives             | chart + compatibility + timing |
| SUPPORT            | Product guidance              | profile                        |

## APIs

- `GET /api/ai/insights` — chart panels (Raja Yogas, Dasha, Gochar) + opening guru message
- `GET/POST /api/ai/chat` — agent conversation (persisted in `ai_conversations`; default agent `ASTROLOGER_GURU`)

## Models

Uses Mastra model router when credentials exist:

- `GOOGLE_GENERATIVE_AI_API_KEY` → `google/gemini-2.5-pro`
- `OPENAI_API_KEY` → `OPENAI_MODEL` or `openai/gpt-4o`
- `ANTHROPIC_API_KEY` → Claude

Without keys, the service returns **deterministic explanations of real engine/DB output** (not mock astrology).

## Disclaimer

Every explanation ends with:

> This is a traditional Vedic astrological interpretation and should not be considered a guarantee or factual prediction.

## Wired pages

- `/dashboard/ai-insights`
- `/dashboard/recommendations`
