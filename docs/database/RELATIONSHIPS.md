# Relationship Rules

## Delete behaviors

| Behavior             | When used                                                         |
| -------------------- | ----------------------------------------------------------------- |
| `onDelete: Cascade`  | Owned children (sessions, messages, planet rows, likes)           |
| `onDelete: Restrict` | Catalog / billing anchors (Plan, AppRole, Astrologer on bookings) |
| `onDelete: SetNull`  | Optional references (device on session, template on notification) |

Soft delete is application-level. Cascades still apply for hard deletes / GDPR purge jobs.

## Key relationship inventory

### Authentication

- `User` 1—N `Session`, `Account`, `RefreshToken`, `LoginHistory`, `Device`, `Otp`, `PasswordReset`, `EmailVerification`, `SocialLogin`
- `User` N—M `AppRole` via `UserRole`
- `AppRole` N—M `Permission` via `RolePermission`

### Profile

- `User` 1—1 `UserProfile`, `PartnerPreference`, `Lifestyle`, `ReligionProfile`, `CommunityProfile`, `PrivacySettings`
- `User` 1—N media, education, career, languages, hobbies, interests, locations
- Self graphs: blocked, reported, saved, recently viewed, shortlisted

### Geography

- `GeoCountry` 1—N `GeoState` 1—N `GeoCity`
- Enums `Country` / `State` / `City` used for fast filters; `Geo*` tables hold the scalable catalog

### Horoscope

- `User` 1—N `HoroscopeChart` (unique per `chartType`)
- Chart 1—N positional/analytical children
- Chart 1—1 specialized attributes (Manglik, Kaal Sarp, Nadi, KP, Jaimini, karakas)

### Dasha

- Timeline 1—N polymorphic `DashaPeriod` (self tree)
- Timeline 1—N explicit `Mahadasha` → `Antardasha` → `PratyantarDasha`
- User 1—N typed timing windows + generic `DashaWindow`

### Compatibility

- Ordered pair `(userAId, userBId)` unique
- Report 1—1 score dimensions + 1—N conflict indicators

### Matchmaking & chat

- Directed edges for likes/interests/requests/rejects/blocks
- Mutual match optionally opens a conversation
- Conversation N—M users via participants; messages cascade with receipts/attachments

### Payments

- Plan Restrict on subscriptions
- Invoice / transaction / refund chain
- Wallet 1—N ledger entries

### Admin / analytics

- Actor optional on audit logs (retain history if user purged)
- Analytics tables are date-keyed facts, not OLTP parents
