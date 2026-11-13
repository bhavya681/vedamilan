"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/layout/page-shell";
import { Surface } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  YogaCardGrid,
  DoshaCardGrid,
  NoRajaYogaState,
  yogaCardTheme,
} from "@/features/horoscope/components/yoga-dosha-details";
import { getYogaCategory } from "@/application/horoscope/yoga-filters";
import { getYogaCategoryDisplay } from "@/application/horoscope/yoga-icons";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import {
  BookOpen,
  Coins,
  Compass,
  Crown,
  Gem,
  Layers,
  MoonStar,
  Search,
  Shield,
  Sparkles,
  Star,
  Sun,
  type LucideIcon,
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
  { id: "Pancha Mahapurusha", label: "Mahapurusha", icon: Gem },
  { id: "Lunar Yoga", label: "Lunar Yogas", icon: MoonStar },
  { id: "Solar Yoga", label: "Solar Yogas", icon: Sun },
  { id: "Nabhasa Yoga", label: "Nabhasa Yogas", icon: Layers },
  { id: "Planetary Yoga", label: "Planetary Yogas", icon: Compass },
  { id: "Other", label: "Other Yogas", icon: Shield },
] as const;

type CategoryId = (typeof YOGA_CATEGORIES)[number]["id"];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Raja Yoga": Crown,
  "Dhana Yoga": Coins,
  "Pancha Mahapurusha": Gem,
  "Lunar Yoga": MoonStar,
  "Solar Yoga": Sun,
  "Nabhasa Yoga": Layers,
  "Planetary Yoga": Compass,
  Other: Shield,
};

function renderCategoryIcon(category: string, className: string) {
  const Icon = CATEGORY_ICONS[category] || yogaCardTheme(category).icon;
  return <Icon className={className} aria-hidden />;
}

function CategoryHeading({ category }: { category: string }) {
  const theme = yogaCardTheme(category);
  const display = getYogaCategoryDisplay(category);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg border",
          theme.chip,
        )}
      >
        {renderCategoryIcon(category, "h-3.5 w-3.5")}
      </span>
      <h3 className="font-display truncate text-base font-medium sm:text-lg">{display}</h3>
    </div>
  );
}

function CategoryPill({
  label,
  icon: Icon,
  isActive,
  count,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        isActive
          ? "border-gold/45 bg-gold/12 text-foreground"
          : "border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-[10px] tabular-nums",
          isActive ? "bg-gold/15 text-foreground" : "text-muted-foreground/80",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function HeroStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-border/60 bg-background/60 min-w-0 rounded-xl border px-3 py-3 backdrop-blur-sm">
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <p className="font-display mt-1 truncate text-xl leading-none sm:text-2xl">{value}</p>
      {hint ? <p className="text-muted-foreground mt-1.5 truncate text-[10px]">{hint}</p> : null}
    </div>
  );
}

function YogaHero({
  total,
  detected,
  doshasPresent,
  doshasTotal,
  currentMaha,
  currentAntar,
}: {
  total: number;
  detected: number;
  doshasPresent: number;
  doshasTotal: number;
  currentMaha?: string | null;
  currentAntar?: string | null;
}) {
  return (
    <div className="border-border/60 bg-card shadow-soft relative overflow-hidden rounded-3xl border">
      <div className="mandala-bg pointer-events-none absolute inset-0 opacity-[0.4]" aria-hidden />
      <div
        className="pointer-events-none absolute -top-28 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--gold)_20%,transparent),transparent_70%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--saffron)_14%,transparent),transparent_70%)] blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between lg:p-9">
        <div className="max-w-2xl min-w-0">
          <p className="text-gold flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
            <Crown className="h-3.5 w-3.5" />
            Parashari combinations · Kundli engine
          </p>
          <h1 className="font-display mt-2 text-3xl leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Classical Yogas
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
            Explore traditional Vedic planetary combinations — what forms them, when they activate
            through dasha, and how they show up in your chart.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={routes.kundli}>Open Kundli</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={routes.astrologyDasha}>Dasha timing</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={routes.lalKitab}>Lal Kitab</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:min-w-[26rem]">
          <HeroStat label="Total yogas" value={String(total)} hint="In catalog" />
          <HeroStat label="Detected" value={String(detected)} hint="In your chart" />
          <HeroStat
            label="Doshas"
            value={`${doshasPresent}/${doshasTotal}`}
            hint="Present / checked"
          />
          <HeroStat
            label="Mahadasha"
            value={currentMaha || "—"}
            hint={currentAntar ? `Antar · ${currentAntar}` : "Open Dasha for timing"}
          />
        </div>
      </div>
    </div>
  );
}

export default function AstrologyYogasPage() {
  const [data, setData] = useState<Extras | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyDetected, setShowOnlyDetected] = useState(true);
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

  const detectedByCategory = useMemo(() => {
    const grouped: Record<string, YogaRow[]> = {};
    for (const yoga of rankedYogas) {
      if ((yoga.strength ?? 0) <= 0) continue;
      const cat = getYogaCategory(yoga);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(yoga);
    }
    return grouped;
  }, [rankedYogas]);

  const categoryTabs = YOGA_CATEGORIES.map((cat) => ({
    ...cat,
    count: cat.id === "all" ? rankedYogas.length : categoryCounts[cat.id] || 0,
  }));

  const detectedCount = rankedYogas.filter((y) => (y.strength ?? 0) > 0).length;

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
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
        <div className="space-y-5 sm:space-y-6">
          <YogaHero
            total={rankedYogas.length}
            detected={detectedCount}
            doshasPresent={presentDoshas.length}
            doshasTotal={(data.doshas || []).length}
            currentMaha={data.currentMaha}
            currentAntar={data.currentAntar}
          />

          <Tabs defaultValue="library" className="min-w-0">
            <TabsList>
              <TabsTrigger value="library" className="gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Library
              </TabsTrigger>
              <TabsTrigger value="my-yogas" className="gap-1.5">
                <Star className="h-3.5 w-3.5" />
                My Yogas
              </TabsTrigger>
              <TabsTrigger value="doshas" className="gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Doshas
              </TabsTrigger>
              <TabsTrigger value="guide" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Guide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="space-y-4">
              <Surface className="space-y-3 p-3.5 sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="relative w-full sm:w-64">
                      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        placeholder="Search name, code, planets…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        aria-label="Search yogas"
                      />
                    </div>

                    <label className="text-muted-foreground inline-flex shrink-0 items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={showOnlyDetected}
                        onChange={(e) => setShowOnlyDetected(e.target.checked)}
                        className="border-border/60 accent-[var(--gold)]"
                      />
                      Detected only
                    </label>

                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as "strength" | "name" | "category")
                      }
                      className="border-border/60 bg-background focus-visible:border-gold/50 rounded-lg border px-2.5 py-1.5 text-xs focus-visible:outline-none"
                      aria-label="Sort by"
                    >
                      <option value="strength">Sort · Strength</option>
                      <option value="name">Sort · Name (A–Z)</option>
                      <option value="category">Sort · Category</option>
                    </select>
                  </div>

                  <span className="text-muted-foreground shrink-0 text-xs">
                    {filteredYogas.length} of {rankedYogas.length} yogas
                  </span>
                </div>

                <div className="scrollbar-hidden -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                  {categoryTabs.map((cat) => (
                    <CategoryPill
                      key={cat.id}
                      label={cat.label}
                      icon={cat.icon}
                      isActive={selectedCategory === cat.id}
                      count={cat.count}
                      onClick={() => setSelectedCategory(cat.id)}
                    />
                  ))}
                </div>
              </Surface>

              {Object.keys(yogasByCategory).length === 0 ? (
                <EmptyState
                  title="No yogas match"
                  description={
                    showOnlyDetected
                      ? "No yogas were detected in your chart. Untick “Detected only” to browse the full classical catalog."
                      : "Try adjusting your search or filters."
                  }
                />
              ) : (
                <div className="space-y-6">
                  {Object.entries(yogasByCategory)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([catName, items]) => (
                      <section key={catName} className="space-y-3">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <CategoryHeading category={catName} />
                          <span className="text-muted-foreground text-xs">
                            {items.length} {items.length === 1 ? "yoga" : "yogas"}
                          </span>
                        </div>
                        <YogaCardGrid items={items} initialVisible={6} />
                      </section>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-yogas" className="space-y-4">
              <Surface className="space-y-3 p-4 sm:p-5">
                <div>
                  <h2 className="font-display text-xl">Yogas in your kundli</h2>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {detectedCount} detected yogas organized by category — each card shows the
                    planets, houses, signs, and the classical condition satisfied.
                  </p>
                </div>

                {detectedCount > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(detectedByCategory)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([catName, items]) => (
                        <section key={catName} className="space-y-3">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <CategoryHeading category={catName} />
                            <span className="text-muted-foreground text-xs">
                              {items.length} {items.length === 1 ? "yoga" : "yogas"}
                            </span>
                          </div>
                          <YogaCardGrid items={items} initialVisible={6} />
                        </section>
                      ))}
                  </div>
                ) : (
                  <NoRajaYogaState />
                )}
              </Surface>
            </TabsContent>

            <TabsContent value="doshas" className="space-y-4">
              <Surface className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-display text-xl">Dosha scan</h2>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Friction themes — not curses. Present flags come first, with clear items
                      listed so you can see what the engine checked.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {presentDoshas.length} present
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {clearDoshas.length} clear
                    </Badge>
                  </div>
                </div>
                <DoshaCardGrid items={[...presentDoshas, ...clearDoshas]} />
              </Surface>
            </TabsContent>

            <TabsContent value="guide">
              <Surface className="space-y-4 text-sm leading-relaxed">
                <h2 className="font-display text-xl">How to read this page</h2>
                <p>
                  Yogas are named combinations from your stored Kundli. Strength is an engine score
                  for how clearly the pattern formed — not a percentage of life success.
                </p>
                <p>
                  <span className="font-medium">Raja Yogas</span> covers classical combinations:
                  Kendra-Trikona Raja Yoga, Dharma-Karmadhipati, Gaja Kesari, Budhaditya,
                  Chandra-Mangal, Neecha Bhanga, Vipareeta Raja (Harsha, Sarala, Vimala), Pancha
                  Mahapurusha (Ruchaka, Bhadra, Hamsa, Malavya, Shasha), and Dhana Yogas.
                </p>
                <p>
                  <span className="font-medium">Lunar Yogas</span> (from Moon): Adhi, Sunapha,
                  Anapha, Durudhara, Kemadruma.
                </p>
                <p>
                  <span className="font-medium">Solar Yogas</span> (from Sun): Vasi, Vesi,
                  Ubhayachari.
                </p>
                <p>
                  <span className="font-medium">Nabhasa Yogas</span> (structural): Ashraya
                  (Rajju/Musala/Nala), Dala (Maala/Sarpa), Akriti (Gada/Shakata), Sankhya
                  (Veena/Damini/Pasha/Kedara/Shula/Yuga/Gola).
                </p>
                <p>
                  <span className="font-medium">Planetary Yogas</span>: Saraswati, Lakshmi,
                  Parivartana, Amala, Pushkala, Shubha/Papa Kartari.
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
              </Surface>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}
