import Link from "next/link";

import { MarketingPageShell } from "@/components/layout/landing-section";
import { PageHeader } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { routes } from "@/lib/constants/routes";
import { mockBlogPosts } from "@/lib/mock/vedamilan";

export const metadata = { title: "Blog" };

export default function BlogPage() {
  return (
    <MarketingPageShell>
      <PageHeader
        eyebrow="Insights"
        title="Blog"
        description="Research notes on Vedic intelligence and intentional matching."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.home}>Home</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockBlogPosts.map((post) => (
          <GlassCard key={post.slug} className="flex h-full flex-col">
            <Badge variant="secondary">{post.tag}</Badge>
            <h2 className="font-display mt-3 text-xl leading-snug">{post.title}</h2>
            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
              {post.excerpt}
            </p>
            <p className="text-muted-foreground mt-4 text-xs">
              {post.author} · {post.date}
            </p>
          </GlassCard>
        ))}
      </div>
    </MarketingPageShell>
  );
}
