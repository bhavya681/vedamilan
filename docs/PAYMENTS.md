# Payments & Subscriptions (Module 9)

Stripe Checkout + Razorpay Orders with Mongo persistence for plans, payments, and subscriptions.

## APIs

| Method | Path                           | Purpose                                 |
| ------ | ------------------------------ | --------------------------------------- |
| GET    | `/api/billing`                 | Plans + current subscription + payments |
| POST   | `/api/billing/checkout`        | Start Stripe/Razorpay checkout          |
| POST   | `/api/billing/razorpay/verify` | Verify Razorpay signature + activate    |
| POST   | `/api/billing/webhooks/stripe` | Stripe webhook                          |
| GET    | `/api/billing/invoices`        | Payment history                         |

## Env

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

## Wired pages

- `/dashboard/billing`
- `/dashboard/billing/checkout`
- `/dashboard/billing/success`
- `/dashboard/billing/failure`
- `/dashboard/billing/invoices`
- `/dashboard/billing/invoice`
- `/dashboard/premium`
