import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";

export default function InvoicePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Invoice</h1>
        <Button asChild variant="outline">
          <Link href={routes.payments}>Back</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-primary text-2xl">{brand.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice number</span>
            <span>INV-2026-0001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span>Sangam · Monthly</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Billed to</span>
            <span>Aryan Mehta</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹2,499.00</span>
          </div>
          <div className="flex justify-between">
            <span>GST (18%)</span>
            <span>₹449.82</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹2,948.82</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
