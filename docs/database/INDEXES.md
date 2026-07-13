# Indexes & Query Performance

## Index strategy

1. **Every FK** used in joins is indexed (Prisma creates many automatically; composites added where selective filters combine).
2. **Soft-delete pairs** `@@index([status, deletedAt])` on all tables for default listing filters.
3. **Time-series access** indexes on `(userId, createdAt)` for feeds, chat, payments, AI usage.
4. **Unique natural keys** for idempotency: emails, tokens, provider IDs, `(userA, userB)` pairs, slug fields.
5. **Trigram / GIN ready** via `pg_trgm` + `btree_gin` extensions for name/city search (add expression indexes in follow-up migrations when query patterns stabilize).

## Hot-path composites

| Table                   | Index                                                         | Purpose                     |
| ----------------------- | ------------------------------------------------------------- | --------------------------- |
| `users`                 | `(status, deletedAt)`, `lastLoginAt`                          | Authz listing, reactivation |
| `user_profiles`         | `(gender, maritalStatus, status)`                             | Discovery filters           |
| `partner_preferences`   | `(minAge, maxAge)`                                            | Preference matching         |
| `user_locations`        | `(countryEnum, stateEnum, cityEnum)`, `(latitude, longitude)` | Geo filters                 |
| `horoscope_charts`      | `(userId, chartType)` unique                                  | Chart upsert                |
| `planet_positions`      | `(planet, sign)`                                              | Astro analytics             |
| `dasha_periods`         | `(timelineId, level, startAt)`, `(lord, startAt, endAt)`      | Timing queries              |
| `compatibility_reports` | `(userAId, userBId)` unique, score indexes                    | Pair lookup / ranking       |
| `match_recommendations` | `(userId, score)`                                             | Feed ranking                |
| `messages`              | `(conversationId, createdAt)`                                 | Chat pagination             |
| `subscriptions`         | `(userId, endsAt)`                                            | Entitlement checks          |
| `payment_transactions`  | `(provider, providerPaymentId)`                               | Webhook idempotency         |
| `notifications`         | `(userId, readAt, createdAt)`                                 | Inbox                       |
| `analytics_*`           | unique metric date keys                                       | Upsert daily facts          |

## Recommendations

- Use **keyset pagination** (`createdAt, id`) for chat and feeds; avoid large `OFFSET`.
- Keep compatibility pair orientation canonical (`min(userId), max(userId)`) in application code before insert to prevent duplicates.
- Partition candidates at 50M+ rows: `messages`, `activity_logs`, `notification_logs`, `ai_prompt_history`, `analytics_*` by month.
- Move embeddings to **pgvector** when infra is standardized; `vector_json` is the portable interim column.
- Add covering indexes only after `EXPLAIN (ANALYZE)` on production-like data.
