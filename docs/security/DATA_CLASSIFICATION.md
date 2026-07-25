# Data Classification — VedaMilan AI

| Class                            | Examples                                       | Handling                                           |
| -------------------------------- | ---------------------------------------------- | -------------------------------------------------- |
| **C0 Public**                    | Marketing copy, public FAQs                    | CDN cacheable                                      |
| **C1 Internal**                  | Feature flags, non-PII metrics                 | Auth optional / staff                              |
| **C2 PII**                       | Name, email, phone, city, photos               | Session auth; minimize logs                        |
| **C3 Sensitive PII**             | DOB, exact birth time, coordinates             | Session auth; never log; consider field encryption |
| **C4 Confidential relationship** | Private notes, Couple Space, chats, AI threads | Ownership / membership gates                       |
| **C5 Secrets**                   | Auth secret, payment keys, API keys            | Secret manager / env only; never commit            |
| **C6 Financial**                 | Payments, invoices, entitlements               | Server verify; retention per law                   |

## Encryption posture

| Layer                              | Status                       |
| ---------------------------------- | ---------------------------- |
| TLS in transit                     | Required in production       |
| Atlas encryption at rest           | Configure in Atlas           |
| Object storage encryption          | Cloudinary / bucket settings |
| Password hashing                   | Better Auth scrypt           |
| App-level field encryption (C3/C4) | Planned — not yet shipped    |

## Retention notes

- Payment records may require legal retention even after account deletion
- Soft-delete used for many collections — hard-delete / anonymize workflow still required for GDPR
