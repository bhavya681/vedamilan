import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pages = [
  { title: "Landing hero copy", status: "Published" },
  { title: "FAQ · Astrology accuracy", status: "Draft" },
  { title: "Success story · Ananya & Rohan", status: "Review" },
];

export default function AdminCmsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">CMS</h1>
        <Button type="button">New entry</Button>
      </div>
      <div className="grid gap-4">
        {pages.map((page) => (
          <Card key={page.title}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{page.title}</CardTitle>
              <Badge variant="secondary">{page.status}</Badge>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Content workspace mock for Phase 1 editorial flows.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
