# Scalability Notes (10M+ Users)

## Capacity assumptions

| Domain                | 10M users rough volume      | Strategy                                                    |
| --------------------- | --------------------------- | ----------------------------------------------------------- |
| Profiles              | 10M rows                    | Vertical partition hot columns; read replicas               |
| Images                | 30–50M rows                 | Object storage (Cloudinary); DB holds metadata only         |
| Planet positions      | ~120M (12 planets × charts) | Chart-scoped access; archive old engine versions            |
| Compatibility reports | 100M–1B potential pairs     | Compute on demand + cache top-N; never materialize full N²  |
| Messages              | Billions                    | Partition by month; cold storage after retention            |
| AI embeddings         | Tens of millions            | pgvector / dedicated vector DB at scale                     |
| Analytics             | Small fact tables           | Cheap upserts; warehouse sync (BigQuery/Snowflake) optional |

## Application patterns

1. **Canonical pair keys** for compatibility and mutual matches.
2. **Recommendation precompute** into `match_recommendations` with TTL/`expiresAt`.
3. **Redis** for sessions, OTP rate limits, feed caches, online presence.
4. **Idempotent webhooks** via unique provider payment IDs.
5. **Outbox tables** (`email_notifications`, `sms_notifications`, `push_notifications`) for reliable delivery workers.
6. **Soft delete + hard-delete worker** for GDPR with cascaded physical purge.

## PostgreSQL ops

- Connection pooling via PgBouncer / Prisma adapter pool (`max` tuned per service).
- Read replicas for discovery/search; primary for writes.
- Autovacuum tuning on high-churn tables (`messages`, `activity_logs`).
- Separate tablespaces/disks for WAL vs data at large scale.
- Logical replication into analytics warehouse; keep OLTP lean.

## Sharding outlook (future, not required now)

- Shard key candidate: `user_id` hash for user-owned OLTP graphs.
- Keep global catalogs unsharded: plans, permissions, geo, CMS.
- Cross-shard compatibility compute stays in a dedicated match service with its own store/cache.

The current schema does **not** require redesign to reach 10M users; scale is achieved through indexing, partitioning, caching, and service decomposition around these tables.
