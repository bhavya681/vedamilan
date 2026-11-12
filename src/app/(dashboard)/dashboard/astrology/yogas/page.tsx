"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  YogaDetailList,
  DoshaDetailList,
  NoRajaYogaState,
} from "@/features/horoscope/components/yoga-dosha-details";
import { getYogaCategory } from "@/application/horoscope/yoga-filters";
import { getYogaCategoryDisplay } from "@/application/horoscope/yoga-icons";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import {
  Crown,
  Coins,
  Gem,
  MoonStar,
  Sun,
  BookOpen,
  Layers,
  Star,
  Shield,
  Sparkles,
  Search,
} from "lucide-react";

type YogaRow = {
  code?: string;
  name: string;
  category?: string;
  strength?: number;
  description?: string;
  insight: {
    meaning: string;
    whenActivates: string;
    watchFor: string;
    lifeAreas: string[];
    activationNow: string;
    engineNote: string;
  };
  details?: {
    planets: string[];
    houses: number[];
    signs: string[];
    condition: string;
    classicalReference: string;
  };
};

type DoshaRow = {
  code: string;
  name: string;
  present: boolean;
  severity?: string;
  notes?: string;
  insight: {
    meaning: string;
    whenActivates: string;
    watchFor: string;
    lifeAreas: string[];
    activationNow: string;
    engineNote: string;
    statusLabel?: string;
  };
};

type Extras = {
  currentMaha?: string | null;
  currentAntar?: string | null;
  yogas: YogaRow[];
  doshas: DoshaRow[];
};

const YOGA_CATEGORIES = [
  { id: "all", label: "All Yogas", icon: Sparkles },
  { id: "Raja Yoga", label: "Raja Yogas", icon: Crown },
  { id: "Dhana Yoga", label: "Dhana Yogas", icon: Coins },
  { id: "Pancha Mahapurusha", label: "Pancha Mahapurusha", icon: Gem },
  { id: "Lunar Yoga", label: "Lunar Yogas", icon: MoonStar },
  { id: "Solar Yoga", label: "Solar Yogas", icon: Sun },
  { id: "Nabhasa Yoga", label: "Nabhasa Yogas", icon: Layers },
  { id: "Planetary Yoga", label: "Planetary Yogas", icon: Star },
  { id: "Other", label: "Other Yogas", icon: Shield },
] as const;

type CategoryId = (typeof YOGA_CATEGORIES)[number]["id"];

const CATEGORY_ICON_MAP: Record<string, typeof Crown> = {
  "Raja Yoga": Crown,
  "Dhana Yoga": Coins,
  "Pancha Mahapurusha": Gem,
  "Lunar Yoga": MoonStar,
  "Solar Yoga": Sun,
  "Nabhasa Yoga": Layers,
  "Planetary Yoga": Star,
  "Other": Shield,
};

const CATEGORY_COLOR_MAP: Record<string, string> = {
  "Raja Yoga": "border-gold/40 bg-gold/10 text-gold",
  "Dhana Yoga": "border-saffron/40 bg-saffron/10 text-saffron",
  "Pancha Mahapurusha": "border-emerald/40 bg-emerald/10 text-emerald",
  "Lunar Yoga": "border-cosmic/40 bg-cosmic/10 text-cosmic",
  "Solar Yoga": "border-amber/40 bg-amber/10 text-amber",
  "Nabhasa Yoga": "border-rose/40 bg-rose/10 text-rose",
  "Planetary Yoga": "border-blue/40 bg-blue/10 text-blue",
  "Other": "border-muted/40 bg-muted/10 text-muted-foreground",
};

function CategoryBadge({ category }: { category: string }) {
  const display = getYogaCategoryDisplay(category);
  const Icon = CATEGORY_ICON_MAP[display] || Shield;
  const color = CATEGORY_COLOR_MAP[display] || CATEGORY_COLOR_MAP.Other;
  return (
    <Badge variant="outline" className={cn("gap-1.5 text-[10px]", color)}>
      <Icon className="h-3 w-3" />
      {display}
    </Badge>
  );
}

function CategoryTabButton({
  category,
  isActive,
  count,
  onClick,
}: {
  category: (typeof YOGA_CATEGORIES)[number];
  isActive: boolean;
  count: number;
  onClick: () => void;
}) {
  const Icon = category.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        isActive
          ? "border-gold/40 bg-gold/10 text-foreground"
          : "border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground",
      )}
      aria-pressed={isActive}
    >
      <Icon className="h-3.5 w-3.5" />
      {category.label}
      <span className="text-muted-foreground/80 tabular-nums">{count}</span>
    </button>
  );
}

export default function AstrologyYogasPage() {
  const [data, setData] = useState<Extras | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyDetected, setShowOnlyDetected] = useState(false);
  const [sortBy, setSortBy] = useState<"strength" | "name" | "category">("strength");

  useEffect(() => {
    void fetch("/api/horoscope/vedic-extras")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load yogas & doshas");
          return;
        }
        setData(json.data);
      })
      .catch(() => setError("Unable to load yogas & doshas"))
      .finally(() => setLoading(false));
  }, []);

  const rankedYogas = useMemo(() => {
    const list = [...(data?.yogas || [])];
    list.sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0));
    return list;
  }, [data?.yogas]);

  const presentDoshas = (data?.doshas || []).filter((d) => d.present);
  const clearDoshas = (data?.doshas || []).filter((d) => !d.present);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const yoga of rankedYogas) {
      const cat = getYogaCategory(yoga);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [rankedYogas]);

  const filteredYogas = useMemo(() => {
    let list = [...rankedYogas];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (y) =>
          y.name.toLowerCase().includes(q) ||
          y.code?.toLowerCase().includes(q) ||
          getYogaCategory(y).toLowerCase().includes(q) ||
          y.details?.planets.some((p) => p.toLowerCase().includes(q)) ||
          y.details?.condition.toLowerCase().includes(q),
      );
    }

    if (selectedCategory !== "all") {
      list = list.filter((y) => getYogaCategory(y) === selectedCategory);
    }

    if (showOnlyDetected) {
      list = list.filter((y) => (y.strength ?? 0) > 0);
    }

    if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "category") {
      list.sort((a, b) => getYogaCategory(a).localeCompare(getYogaCategory(b)));
    }

    return list;
  }, [rankedYogas, searchQuery, selectedCategory, showOnlyDetected, sortBy]);

  const yogasByCategory = useMemo(() => {
    const grouped: Record<string, YogaRow[]> = {};
    for (const yoga of filteredYogas) {
      const cat = getYogaCategory(yoga);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(yoga);
    }
    return grouped;
  }, [filteredYogas]);

  const categoryTabs = YOGA_CATEGORIES.map((cat) => ({
    ...cat,
    count: cat.id === "all" ? rankedYogas.length : categoryCounts[cat.id] || 0,
  }));

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Parashari combinations · Kundli engine"
        title="Classical Yogas"
        description="Explore traditional Vedic planetary combinations — what forms them, when they activate through dasha, and how they appear in your chart."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrologyDasha}>Dasha</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.lalKitab}>Lal Kitab</Link>
            </Button>
          </div>
        }
      />

      {loading ? <PanelSkeleton lines={8} /> : null}
      {error ? (
        <EmptyState
          title="Chart required"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate Kundli</Link>
            </Button>
          }
        />
      ) : null}

      {data ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Total Yogas</p>
              <p className="font-display text-2xl sm:text-3xl">{rankedYogas.length}</p>
              <p className="text-muted-foreground text-xs">In catalog</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Detected</p>
              <p className="font-display text-2xl sm:text-3xl">
                {rankedYogas.filter((y) => (y.strength ?? 0) > 0).length}
              </p>
              <p className="text-muted-foreground text-xs">Present in your chart</p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Doshas present
              </p>
              <p className="font-display text-2xl sm:text-3xl">
                {presentDoshas.length}
                <span className="text-muted-foreground text-base">
                  {" "}
                  / {(data.doshas || []).length}
                </span>
              </p>
              <p className="text-muted-foreground text-xs">
                {clearDoshas.length} clear · friction, not fate
              </p>
            </GlassCard>
            <GlassCard className="space-y-1 p-3 sm:p-4">
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Current Mahadasha
              </p>
              <p className="font-display text-lg leading-snug sm:text-xl">
                {data.currentMaha || "—"}
              </p>
              <p className="text-muted-foreground text-xs">
                {data.currentAntar ? `Antardasha · ${data.currentAntar}` : "Open Dashas for timing"}
              </p>
            </GlassCard>
          </div>

          <Tabs defaultValue="library">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              <TabsTrigger value="library" className="justify-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Library
              </TabsTrigger>
              <TabsTrigger value="my-yogas" className="justify-center gap-1.5">
                <Star className="h-3.5 w-3.5" />
                My Yogas
              </TabsTrigger>
              <TabsTrigger value="doshas" className="justify-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Doshas
              </TabsTrigger>
              <TabsTrigger value="guide" className="justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Guide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="space-y-4">
              <GlassCard className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Search className="text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name, code, planets, or condition..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 max-w-xs"
                      aria-label="Search yogas"
                    />
                    <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={showOnlyDetected}
                        onChange={(e) => setShowOnlyDetected(e.target.checked)}
                        className="rounded border-border/60"
                      />
                      Detected only
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "strength" | "name" | "category")}
                      className="border-border/60 bg-background rounded-lg px-2 py-1 text-xs text-sm"
                      aria-label="Sort by"
                    >
                      <option value="strength">Strength</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {filteredYogas.length} of {rankedYogas.length} yogas
                    </span>
                  </div>
                </div>

                <div className="scrollbar-hidden flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                  {categoryTabs.map((cat) => (
                    <CategoryTabButton
                      key={cat.id}
                      category={cat}
                      isActive={selectedCategory === cat.id}
                      count={cat.count}
                      onClick={() => setSelectedCategory(cat.id)}
                    />
                  ))}
                </div>

                <GlassCard className="space-y-3">
                  {Object.keys(yogasByCategory).length === 0 ? (
                    <EmptyState
                      title="No yogas match"
                      description="Try adjusting your search or filters."
                    />
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(yogasByCategory)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([catName, items]) => (
                          <div key={catName} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CategoryBadge category={catName} />
                              <span className="text-muted-foreground text-xs">
                                {items.length} {items.length === 1 ? "yoga" : "yogas"}
                              </span>
                            </div>
                            <YogaDetailList items={items} empty="" />
                          </div>
                        ))}
                    </div>
                  )}
                </GlassCard>
              </GlassCard>
            </TabsContent>

            <TabsContent value="my-yogas" className="space-y-4">
              <GlassCard className="space-y-3">
                <div>
                  <h2 className="font-display text-xl">Yogas in Your Kundli</h2>
                  <p className="text-muted-foreground text-xs">
                    All detected yogas organized by category — each shows the specific planets, houses, signs,
                    and classical condition satisfied.
                  </p>
                </div>

                {rankedYogas.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      rankedYogas.reduce((acc, yoga) => {
                        const cat = getYogaCategory(yoga);
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(yoga);
                        return acc;
                      }, {} as Record<string, YogaRow[]>),
                    )
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([catName, items]) => (
                        <div key={catName} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={catName} />
                            <span className="text-muted-foreground text-xs">
                              {items.length} {items.length === 1 ? "yoga" : "yogas"}
                            </span>
                          </div>
                          <YogaDetailList items={items} empty="" />
                        </div>
                      ))}
                  </div>
                ) : (
                  <NoRajaYogaState />
                )}
              </GlassCard>
            </TabsContent>

            <TabsContent value="doshas">
              <GlassCard className="space-y-3">
                <div>
                  <h2 className="font-display text-xl">Dosha scan</h2>
                  <p className="text-muted-foreground text-xs">
                    Present flags first conceptually — still listed with clear items so you can see
                    what was checked.
                  </p>
                </div>
                <DoshaDetailList items={[...presentDoshas, ...clearDoshas]} />
              </GlassCard>
            </TabsContent>

            <TabsContent value="guide">
              <GlassCard className="space-y-4 text-sm leading-relaxed">
                <h2 className="font-display text-xl">How to read this page</h2>
                <p>
                  Yogas are named combinations from your stored Kundli. Strength is an engine score
                  for how clearly the pattern formed — not a percentage of life success.
                </p>
                <p>
                  <span className="font-medium">Raja Yogas</span> covers classical combinations: Kendra-Trikona Raja Yoga,
                  Dharma-Karmadhipati, Gaja Kesari, Budhaditya, Chandra-Mangal, Neecha Bhanga,
                  Vipareeta Raja (Harsha, Sarala, Vimala), Pancha Mahapurusha (Ruchaka, Bhadra, Hamsa, Malavya, Shasha),
                  and Dhana Yogas.
                </p>
                <p>
                  <span className="font-medium">Lunar Yogas</span> (from Moon): Adhi, Sunapha, Anapha, Durudhara, Kemadruma.
                </p>
                <p>
                  <span className="font-medium">Solar Yogas</span> (from Sun): Vasi, Vesi, Ubhayachari.
                </p>
                <p>
                  <span className="font-medium">Nabhasa Yogas</span> (structural): Ashraya (Rajju/Musala/Nala), Dala (Maala/Sarpa),
                  Akriti (Gada/Shakata), Sankhya (Veena/Damini/Pasha/Kedara/Shula/Yuga/Gola).
                </p>
                <p>
                  <span className="font-medium">Planetary Yogas</span>: Saraswati, Lakshmi, Parivartana, Amala, Pushkala,
                  Shubha/Papa Kartari.
                </p>
                <p>
                  Results usually show more during the dasha of the planets that form the yoga. Open
                  Dashas to see whether those lords are running now.
                </p>
                <p>
                  Doshas describe friction (Manglik, Kaal Sarp, and similar engine flags). They are
                  not curses. Pair this page with Lal Kitab for everyday upayas when a theme needs
                  care.
                </p>
                <p className="text-muted-foreground text-xs">
                  Public-life parallels are teaching devices. They are not verified celebrity charts
                  or predictions.
                </p>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}