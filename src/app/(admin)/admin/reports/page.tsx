import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reports = [
  { id: "R-1021", subject: "Inappropriate photo", severity: "High" },
  { id: "R-1022", subject: "Spam messaging", severity: "Medium" },
  { id: "R-1023", subject: "Fake profile claim", severity: "High" },
];

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Reports</h1>
      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {report.id} · {report.subject}
              </CardTitle>
              <Badge variant={report.severity === "High" ? "destructive" : "secondary"}>
                {report.severity}
              </Badge>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Awaiting moderator review. Mock queue item for Phase 1.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
