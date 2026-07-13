import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function AdminAiPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">AI usage</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Prompt tokens", "12.4M", 72],
          ["Completion tokens", "4.1M", 48],
          ["Estimated cost", "$1,842", 61],
        ].map(([label, value, progress]) => (
          <Card key={String(label)}>
            <CardHeader>
              <p className="text-muted-foreground text-sm">{label}</p>
              <CardTitle className="font-display text-3xl">{value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={Number(progress)} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
