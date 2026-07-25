# Production Security Checklist — VedaMilan AI

## Secrets & config

- [ ] `BETTER_AUTH_SECRET` ≥ 32 random chars (secret manager)
- [ ] No `.env*` committed; `.env.example` placeholders only
- [ ] Payment, AI, Pusher, Cloudinary, Resend secrets set
- [ ] `REDIS_URL` configured for multi-instance rate limits
- [ ] `ALLOW_DB_SEED` is **not** set in production
- [ ] Seed / demo passwords never applied to prod DB

## Network & platform

- [ ] HTTPS only + HSTS (app headers enabled)
- [ ] MongoDB Atlas IP allowlist / Private Link
- [ ] Redis not publicly reachable
- [ ] WAF / CDN in front of app (recommended)
- [ ] `/api/health` and `/api/ready` monitored (no sensitive payload)

## Application

- [ ] `NODE_ENV=production`
- [ ] Source maps not publicly exposed
- [ ] Admin accounts use strong unique passwords (+ MFA when available)
- [ ] Email delivery (`RESEND_API_KEY`) verified for reset flows
- [ ] Stripe webhook endpoint + secret configured
- [ ] Razorpay keys match environment (test vs live)

## Verification before go-live

- [ ] `npm run typecheck && npm test && npm run lint`
- [ ] `npm run audit:deps` reviewed (no unmitigated criticals)
- [ ] Manual IDOR smoke: User A cannot open User B notes/chat
- [ ] Payment: unpaid / bad signature does not unlock premium
- [ ] Independent VAPT scheduled
