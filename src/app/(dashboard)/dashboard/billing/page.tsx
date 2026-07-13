import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";

const plans = [
  {
    name: "Essence",
    price: "₹999",
    features: ["AI matches", "Basic kundali", "Messaging"],
  },
  {
    name: "Sangam",
    price: "₹2,499",
    features: ["Advanced reports", "Priority ranking", "Family sharing"],
    highlighted: true,
  },
  {
    name: "Parampara",
    price: "₹5,999",
    features: ["Concierge", "Multi-chart compare", "Premium support"],
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Premium & billing</h1>
        <p className="text-muted-foreground mt-2">
          Subscription and invoice UI with mock data only.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Current plan</CardTitle>
            <CardDescription>Free · upgrade to unlock full matchmaking</CardDescription>
          </div>
          <Badge variant="secondary">Active</Badge>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? "border-primary shadow-gold" : undefined}
          >
            <CardHeader>
              <CardTitle className="font-display text-2xl">{plan.name}</CardTitle>
              <CardDescription className="font-display text-foreground text-3xl">
                {plan.price}
                <span className="text-muted-foreground font-sans text-sm">/mo</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-muted-foreground space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                <Link href={`${routes.checkout}?plan=${plan.name.toLowerCase()}`}>
                  Choose {plan.name}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoices</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.invoice}>View sample invoice</Link>
          </Button>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          No paid invoices yet in this mock account.
        </CardContent>
      </Card>
    </div>
  );
}
