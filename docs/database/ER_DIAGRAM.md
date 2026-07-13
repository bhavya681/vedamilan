# Entity Relationship Overview

High-level Mermaid diagrams. Full FK detail lives in Prisma schema files.

## Identity & profile

```mermaid
erDiagram
  USER ||--o| USER_PROFILE : has
  USER ||--o| BIRTH_DETAILS : has
  USER ||--o| PARTNER_PREFERENCE : has
  USER ||--o| PRIVACY_SETTINGS : has
  USER ||--o{ SESSION : owns
  USER ||--o{ ACCOUNT : owns
  USER ||--o{ USER_ROLE : assigned
  APP_ROLE ||--o{ USER_ROLE : grants
  APP_ROLE ||--o{ ROLE_PERMISSION : maps
  PERMISSION ||--o{ ROLE_PERMISSION : maps
  USER ||--o{ PROFILE_IMAGE : uploads
  USER ||--o{ USER_LOCATION : lives
  GEO_COUNTRY ||--o{ GEO_STATE : contains
  GEO_STATE ||--o{ GEO_CITY : contains
  GEO_CITY ||--o{ USER_LOCATION : referenced
  USER ||--o{ BLOCKED_USER : blocks
  USER ||--o{ SAVED_PROFILE : saves
```

## Astrology core

```mermaid
erDiagram
  USER ||--o{ HOROSCOPE_CHART : owns
  HOROSCOPE_CHART ||--o{ PLANET_POSITION : contains
  HOROSCOPE_CHART ||--o{ HOUSE_CUSP : contains
  HOROSCOPE_CHART ||--o{ NAKSHATRA_PLACEMENT : contains
  HOROSCOPE_CHART ||--o| MANGLIK_DOSHA : analyzes
  HOROSCOPE_CHART ||--o| NAVAMSA_CHART : derives
  HOROSCOPE_CHART ||--o| KP_DATA : stores
  HOROSCOPE_CHART ||--o| JAIMINI_DATA : stores
  USER ||--o{ DASHA_TIMELINE : owns
  DASHA_TIMELINE ||--o{ MAHADASHA : sequences
  MAHADASHA ||--o{ ANTARDASHA : sequences
  ANTARDASHA ||--o{ PRATYANTAR_DASHA : sequences
  USER ||--o{ DASHA_WINDOW : forecasts
```

## Match engine & social graph

```mermaid
erDiagram
  USER ||--o{ COMPATIBILITY_REPORT : asA
  USER ||--o{ COMPATIBILITY_REPORT : asB
  COMPATIBILITY_REPORT ||--o| ASHTA_KOOTA_SCORE : scores
  COMPATIBILITY_REPORT ||--o{ CONFLICT_INDICATOR : flags
  USER ||--o{ LIKE : sends
  USER ||--o{ INTEREST : expresses
  USER ||--o{ MUTUAL_MATCH : forms
  MUTUAL_MATCH }o--o| CONVERSATION : opens
  USER ||--o{ CONNECTION_REQUEST : requests
  USER ||--o{ MATCH_RECOMMENDATION : receives
```

## Chat, payments, ops

```mermaid
erDiagram
  CONVERSATION ||--o{ CONVERSATION_PARTICIPANT : includes
  CONVERSATION ||--o{ MESSAGE : contains
  MESSAGE ||--o{ READ_RECEIPT : tracks
  MESSAGE ||--o{ MESSAGE_ATTACHMENT : attaches
  USER ||--o{ SUBSCRIPTION : buys
  PLAN ||--o{ SUBSCRIPTION : defines
  USER ||--o| WALLET : holds
  USER ||--o{ PAYMENT_TRANSACTION : pays
  USER ||--o{ NOTIFICATION : receives
  USER ||--o| ADMIN : elevates
  ADMIN ||--o{ AUDIT_LOG : auditedViaActor
```

## Cardinality summary

| Pattern  | Examples                                                                          |
| -------- | --------------------------------------------------------------------------------- |
| 1:1      | User↔Profile, User↔BirthDetails, Chart↔ManglikDosha                               |
| 1:N      | User→Sessions, Chart→PlanetPositions, Conversation→Messages                       |
| N:M      | User↔Role via UserRole, Role↔Permission via RolePermission, Post↔Tag              |
| Self-ref | BlockedUser, SavedProfile, Message replies, BlogComment threads, DashaPeriod tree |
