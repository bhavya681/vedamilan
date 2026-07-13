# Normalization Notes

## Form targets

| Area                 | Form                 | Notes                                                     |
| -------------------- | -------------------- | --------------------------------------------------------- |
| Auth / RBAC          | 3NF                  | Users, roles, permissions separated; join tables explicit |
| Profile attributes   | 3NF                  | Education/career/languages as child rows, not CSV blobs   |
| Geo                  | 3NF                  | Country→State→City reference data                         |
| Horoscope positions  | 3NF                  | One row per planet/house/attribute                        |
| Compatibility scores | 3NF + 1:1 extensions | Core report + dimension tables avoid wide sparse rows     |
| Chat                 | 3NF                  | Conversation / participant / message / receipt            |
| Payments             | 3NF                  | Plan → subscription → invoice → transaction → refund      |
| Analytics            | Denormalized facts   | Intentional star-schema daily aggregates                  |

## Controlled denormalization

- `UserProfile.profileCompleteness` — cached counter
- `Astrologer.ratingAvg` / `ratingCount` — maintained by review writes
- `Conversation.lastMessageAt` — chat list sort accelerator
- `CompatibilityReport.overallMatchScore` / `aiMatchScore` — ranked feed fields
- Analytics daily tables — pre-aggregated for dashboard latency

## Enum vs reference table

- **Enums** for closed vocabularies (Gender, Religion, MatchStatus, etc.)
- **GeoCity / GeoState / GeoCountry** for open-ended locations (City enum only covers metros for filter UX)
- **Language enum** for product locales; spoken language rows still stored per user

This hybrid keeps migrations manageable while remaining scalable for Indian + diaspora geography.
