import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAdminMetrics } from "@/lib/mock/phase1";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Admin overview</h1>
        <p className="text-muted-foreground mt-2">Operations snapshot with mock telemetry.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockAdminMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <p className="text-muted-foreground text-sm">{metric.label}</p>
              <CardTitle className="font-display text-3xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-primary text-xs">{metric.delta}</CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s focus</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>• 12 verification documents awaiting review</p>
          <p>• 5 payment disputes need finance attention</p>
          <p>• AI spend trending down after prompt cache rollout</p>
        </CardContent>
      </Card>
    </div>
  );
}
