# Security Policy — VedaMilan AI

## Reporting a vulnerability

Email **security@vedamilan.ai** (or the current security contact in the company registry) with:

- Affected URL / API route
- Steps to reproduce
- Impact assessment
- Any proof-of-concept (non-destructive)

Do **not** open a public GitHub issue for exploitable vulnerabilities.

We aim to acknowledge reports within **3 business days**.

## Supported security controls (application)

- Session-bound identity (`requireSession`) — never trust `body.userId`
- Candidate / profile access gates (`assertCandidateAccessible`)
- Payment plan & amount from server catalog + signed webhooks/verify
- AI tools bind to authenticated session context only
- Distributed rate limiting (Redis in production)
- Security headers (CSP, HSTS, X-Content-Type-Options, …)
- Security audit events via `recordSecurityEvent` → `AuditLog`
- Open-redirect sanitization for `next=` callbacks
- SSRF protections on user-supplied image URLs
- Chat media magic-byte validation; profile photo size/MIME limits

## Out of scope for in-app control alone

- Cloud WAF / CDN configuration
- MongoDB Atlas network ACLs & encryption-at-rest settings
- Secret manager / KMS provisioning
- Independent third-party VAPT

## Production deployment requirements

See `docs/security/PRODUCTION_CHECKLIST.md`.

## Philosophy

VedaMilan has been hardened against identified OWASP Top 10 and API Security risks, automated security checks have been implemented, and remaining risk requires continuous monitoring and independent penetration testing.

Security is continuous — not a one-time checkbox.
