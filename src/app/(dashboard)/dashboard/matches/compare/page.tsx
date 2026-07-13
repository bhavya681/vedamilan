import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-shell";
import { mockMatches } from "@/lib/mock/vedamilan";

export default function CompareMatchesPage() {
  const left = mockMatches[0];
  const right = mockMatches[1];

  if (!left || !right) {
    return null;
  }

  const rows = [
    ["City", left.city, right.city],
    ["Profession", left.profession, right.profession],
    ["Education", left.education, right.education],
    ["Vedic score", `${left.score}%`, `${right.score}%`],
    ["AI score", `${left.aiScore}%`, `${right.aiScore}%`],
    ["Guna", String(left.guna), String(right.guna)],
    ["Manglik", left.manglik, right.manglik],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Discover"
        title="Compare profiles"
        description="Side-by-side comparison for thoughtful shortlisting."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {[left, right].map((profile) => (
          <Card key={profile.id} className="glass-panel">
            <CardHeader>
              <CardTitle className="font-display text-2xl">{profile.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={profile.score} />
              <div className="flex gap-2">
                <Badge>{profile.score}% Vedic</Badge>
                <Badge variant="secondary">{profile.aiScore}% AI</Badge>
              </div>
              <p className="text-muted-foreground text-sm">{profile.headline}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="glass-panel">
        <CardContent className="divide-border/60 divide-y p-0">
          {rows.map(([label, a, b]) => (
            <div key={label} className="grid grid-cols-3 gap-3 px-4 py-3 text-sm">
              <p className="text-muted-foreground font-medium">{label}</p>
              <p>{a}</p>
              <p>{b}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
