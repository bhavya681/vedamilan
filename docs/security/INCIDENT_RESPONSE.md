# Incident Response — VedaMilan AI

## Severity

| Level | Examples                                                   |
| ----- | ---------------------------------------------------------- |
| Sev-1 | Active account takeover, payment fraud, mass data exposure |
| Sev-2 | Confirmed IDOR affecting multiple users, auth bypass       |
| Sev-3 | Single-user privacy leak, abuse of rate limits             |
| Sev-4 | Suspected anomaly, failed exploit attempts                 |

## First response (Sev-1 / Sev-2)

1. Contain — revoke sessions, rotate secrets, disable abused endpoint if needed
2. Preserve evidence — audit logs, request IDs, payment ids (no plaintext secrets)
3. Assess blast radius — affected user IDs / collections
4. Notify stakeholders / legal as required
5. Remediate and deploy fix
6. Post-incident review within 5 business days

## Useful signals

- `AuditLog` / `recordSecurityEvent` (`pusher.channel_denied`, `relationship.block`, billing events)
- Application error rate / 401 / 403 / 429 spikes
- Payment webhook signature failures
- Unusual AI token spend

## Contacts

Maintain an on-call rotation and security email in the ops runbook (do not commit personal phone numbers here).
