# VedaMilan AI — MongoDB Database (Module 1)

> Authoritative data layer. Legacy Prisma/PostgreSQL docs are superseded.

## Stack

| Layer            | Choice                                                               |
| ---------------- | -------------------------------------------------------------------- |
| Database         | MongoDB Atlas                                                        |
| ODM              | Mongoose                                                             |
| Auth collections | Better Auth compatible: `user`, `session`, `account`, `verification` |
| Soft delete      | `deletedAt` + `status` via plugin (domain collections)               |
| Pagination       | Repository helpers (`page`, `limit`, max 100)                        |

## Collections

| Collection                                      | Model               | Purpose                                 |
| ----------------------------------------------- | ------------------- | --------------------------------------- |
| `user`                                          | User                | Identity + roles                        |
| `session` / `account` / `verification`          | Auth artifacts      | Better Auth                             |
| `profiles`                                      | Profile             | Public/member profile + photos + geo    |
| `birth_details`                                 | BirthDetails        | Natal input for Swiss Ephemeris         |
| `partner_preferences`                           | PartnerPreferences  | Match filters                           |
| `horoscopes`                                    | Horoscope           | Calculated chart + planets/yogas/doshas |
| `dashas`                                        | Dasha               | Mahadasha / antardasha periods          |
| `compatibility_reports`                         | CompatibilityReport | Ashta Koota + scores                    |
| `matches` / `likes` / `visitors` / `shortlists` | Matchmaking         | Discovery graph                         |
| `chats` / `messages`                            | Chat                | Messaging                               |
| `notifications`                                 | Notification        | In-app / channel notices                |
| `plans` / `subscriptions` / `payments`          | Billing             | Monetization                            |
| `reports`                                       | Report              | PDF/JSON artifacts                      |
| `consultations`                                 | Consultation        | Expert bookings                         |
| `blogs` / `faqs`                                | Content             | Marketing CMS                           |
| `audit_logs`                                    | AuditLog            | Security trail                          |
| `ai_conversations`                              | AiConversation      | Mastra agent threads                    |
| `otps`                                          | Otp                 | OTP login / verify                      |

## Indexes (highlights)

- Profile: `2dsphere` on `location`, city/religion filters
- Compatibility / Chat: unique `pairKey`
- Match: unique `(userId, candidateUserId)`
- Message: `(chatId, createdAt)`
- User: email unique, roles

## Commands

```bash
# Seed plans, FAQs, bootstrap admin + sample member
npm run db:seed

# Schema unit tests (no Atlas required)
npm run test:db
```

## Connect

Set `MONGODB_URI` in `.env` to your Atlas SRV string.  
Application entry: `connectMongo()` from `@/infrastructure/database/mongodb`.
