import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/lib/constants/routes";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const plan = params.plan ?? "sangam";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Checkout</h1>
        <p className="text-muted-foreground mt-2">
          Mock checkout for <span className="capitalize">{plan}</span>. No payment is processed.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment details</CardTitle>
          <CardDescription>UI fields only</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card">Card number</Label>
            <Input id="card" placeholder="4242 4242 4242 4242" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry</Label>
              <Input id="expiry" placeholder="12/28" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="123" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={routes.paymentSuccess}>Pay successfully</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href={routes.paymentFailure}>Simulate failure</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
