"use client";

import { useState } from "react";

import { GlassCard } from "@/components/ui/premium-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type DualView = { simple: string; vedic: string };

type AmdModule = {
  id: string;
  title: string;
  tone: string;
  dual: DualView;
  strengths: string[];
  challenges: string[];
  personA?: {
    strengths?: string[];
    challenges?: string[];
    relationshipNeeds?: string[];
    consciousEffort?: string[];
    atmosphere?: string[];
    effort?: string[];
  };
  personB?: {
    strengths?: string[];
    challenges?: string[];
    relationshipNeeds?: string[];
    consciousEffort?: string[];
    atmosphere?: string[];
    effort?: string[];
  };
  themes?: string[];
  weighting?: { signWeight: number; houseWeight: number };
  compositeScore?: number;
  shukraMilanPercent?: number;
  personANeeds?: string[];
  personBNeeds?: string[];
  sharedUnderstanding?: string[];
  misunderstandingRisks?: string[];
  d9Notes?: string[];
  naturalAlignment?: string[];
  potentialDifferences?: string[];
  complementary?: string[];
  attractionTendencies?: string[];
  communicationGuidance?: string[];
  constructive?: string[];
  challenging?: string[];
  challengingSaturn?: string[];
  activationNotes?: string[];
  balanceLabel?: string;
  gocharStatus?: string;
  signInsights?: DualView[];
};

export type AdvancedMarriageDynamicsView = {
  methodologyVersion?: string;
  disclaimer?: string;
  overallTheme?: DualView;
  overallTone?: string;
  strongestFoundations?: string[];
  potentialGrowthAreas?: string[];
  emotionalDynamic?: DualView;
  intimacyDynamic?: DualView;
  longTermStability?: DualView;
  marriageExperience?: DualView;
  relationshipEffort?: DualView;
  keyVedicInsights?: string[];
  modules?: {
    d1Foundation?: AmdModule;
    d9Marriage?: AmdModule;
    venusDynamics?: AmdModule;
    moonEmotional?: AmdModule;
    houseTriad?: AmdModule;
    lagnaCompatibility?: AmdModule;
    selfPartnerAxis?: AmdModule;
    yoniIntimacy?: AmdModule;
    saturnResponsibility?: AmdModule;
    ninthSeventh?: AmdModule;
    arudha?: AmdModule;
    relationshipBalance?: AmdModule;
    timingActivation?: AmdModule;
  };
  methodologyLayers?: Array<{ layer: number; title: string; description: string }>;
};

function DualCopy({ dual }: { dual?: DualView }) {
  if (!dual) return null;
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      <p>{dual.simple}</p>
      <p className="text-muted-foreground text-xs">{dual.vedic}</p>
    </div>
  );
}

function BulletList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
        {title}
      </p>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function ModuleCard({ module }: { module: AmdModule }) {
  return (
    <GlassCard className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl">{module.title}</h3>
        <Badge variant="secondary">{module.tone}</Badge>
      </div>
      <DualCopy dual={module.dual} />
      {typeof module.compositeScore === "number" ? (
        <p className="text-muted-foreground text-xs">
          Venus dynamics composite {module.compositeScore}
          {module.weighting
            ? ` · sign ${module.weighting.signWeight}% / house ${module.weighting.houseWeight}%`
            : ""}
          {typeof module.shukraMilanPercent === "number"
            ? ` · Shukra Milan ${module.shukraMilanPercent}% (separate)`
            : ""}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <BulletList title="Strengths" items={module.strengths} />
        <BulletList title="Growth areas" items={module.challenges} />
      </div>
      <BulletList title="Themes" items={module.themes} />
      <BulletList title="Shared understanding" items={module.sharedUnderstanding} />
      <BulletList title="Misunderstanding risks" items={module.misunderstandingRisks} />
      <BulletList title="Natural alignment" items={module.naturalAlignment} />
      <BulletList title="Potential differences" items={module.potentialDifferences} />
      <BulletList title="Complementary" items={module.complementary} />
      <BulletList title="Attraction tendencies" items={module.attractionTendencies} />
      <BulletList title="Communication guidance" items={module.communicationGuidance} />
      <BulletList title="Constructive Saturn" items={module.constructive} />
      <BulletList title="Activation notes" items={module.activationNotes} />
      {module.balanceLabel ? (
        <p className="text-sm">
          <span className="font-medium">Balance: </span>
          {module.balanceLabel}
        </p>
      ) : null}
      {module.gocharStatus ? (
        <p className="text-muted-foreground text-xs">{module.gocharStatus}</p>
      ) : null}
      {module.signInsights?.length ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
            Sign-axis insights
          </p>
          {module.signInsights.map((insight) => (
            <div key={insight.simple} className="border-border/40 rounded-lg border p-2 text-sm">
              <p>{insight.simple}</p>
              <p className="text-muted-foreground mt-1 text-xs">{insight.vedic}</p>
            </div>
          ))}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <BulletList title="Person A needs" items={module.personANeeds} />
        <BulletList title="Person B needs" items={module.personBNeeds} />
      </div>
      {module.personA?.atmosphere || module.personA?.strengths ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-medium">Person A</p>
            <BulletList title="Atmosphere" items={module.personA.atmosphere} />
            <BulletList title="Strengths" items={module.personA.strengths} />
            <BulletList title="Needs" items={module.personA.relationshipNeeds} />
            <BulletList
              title="Effort"
              items={module.personA.effort || module.personA.consciousEffort}
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">Person B</p>
            <BulletList title="Atmosphere" items={module.personB?.atmosphere} />
            <BulletList title="Strengths" items={module.personB?.strengths} />
            <BulletList title="Needs" items={module.personB?.relationshipNeeds} />
            <BulletList
              title="Effort"
              items={module.personB?.effort || module.personB?.consciousEffort}
            />
          </div>
        </div>
      ) : null}
      {module.d9Notes?.length ? (
        <p className="text-muted-foreground text-xs">{module.d9Notes.join(" ")}</p>
      ) : null}
    </GlassCard>
  );
}

export function AdvancedMarriageDynamicsPanel({
  data,
  className,
}: {
  data: AdvancedMarriageDynamicsView | null | undefined;
  className?: string;
}) {
  const [openDetails, setOpenDetails] = useState(false);
  const [showMethod, setShowMethod] = useState(false);

  if (!data) return null;

  const modules = [
    data.modules?.d1Foundation,
    data.modules?.d9Marriage,
    data.modules?.venusDynamics,
    data.modules?.moonEmotional,
    data.modules?.houseTriad,
    data.modules?.lagnaCompatibility,
    data.modules?.selfPartnerAxis,
    data.modules?.yoniIntimacy,
    data.modules?.saturnResponsibility,
    data.modules?.ninthSeventh,
    data.modules?.arudha,
    data.modules?.relationshipBalance,
    data.modules?.timingActivation,
  ].filter(Boolean) as AmdModule[];

  return (
    <div className={cn("space-y-4", className)}>
      <GlassCard glow className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
              Layer 4 · Vedic Marriage Intelligence
            </p>
            <h2 className="font-display mt-1 text-2xl sm:text-3xl">Advanced Marriage Dynamics</h2>
          </div>
          {data.overallTone ? (
            <Badge className="bg-primary/15 text-foreground">{data.overallTone}</Badge>
          ) : null}
        </div>
        <DualCopy dual={data.overallTheme} />
        <div className="grid gap-4 sm:grid-cols-2">
          <BulletList title="Strongest foundations" items={data.strongestFoundations} />
          <BulletList title="Potential growth areas" items={data.potentialGrowthAreas} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border-border/50 rounded-xl border p-3">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
              Emotional dynamic
            </p>
            <DualCopy dual={data.emotionalDynamic} />
          </div>
          <div className="border-border/50 rounded-xl border p-3">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
              Intimacy dynamic
            </p>
            <DualCopy dual={data.intimacyDynamic} />
          </div>
          <div className="border-border/50 rounded-xl border p-3">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
              Long-term stability
            </p>
            <DualCopy dual={data.longTermStability} />
          </div>
          <div className="border-border/50 rounded-xl border p-3">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
              Relationship effort
            </p>
            <DualCopy dual={data.relationshipEffort} />
          </div>
        </div>
        <BulletList title="Key Vedic insights" items={data.keyVedicInsights} />
        {data.disclaimer ? (
          <p className="text-muted-foreground text-xs leading-relaxed">{data.disclaimer}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setOpenDetails((v) => !v)}>
            {openDetails ? "Hide Vedic details" : "Explore the Vedic details"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowMethod((v) => !v)}>
            {showMethod ? "Hide methodology" : "How we analyze"}
          </Button>
        </div>
        {data.methodologyVersion ? (
          <p className="text-muted-foreground text-[10px]">Method {data.methodologyVersion}</p>
        ) : null}
      </GlassCard>

      {showMethod && data.methodologyLayers?.length ? (
        <GlassCard className="space-y-3">
          <h3 className="font-display text-xl">How we analyze compatibility</h3>
          <p className="text-muted-foreground text-sm">
            This is not one number invented by AI. Match score (discovery) stays separate from
            Compatibility score (deep compare) and from this Advanced Marriage Dynamics layer.
          </p>
          <ol className="space-y-2 text-sm">
            {data.methodologyLayers.map((layer) => (
              <li key={layer.layer}>
                <span className="font-medium">
                  Layer {layer.layer} · {layer.title}
                </span>
                <span className="text-muted-foreground"> — {layer.description}</span>
              </li>
            ))}
          </ol>
        </GlassCard>
      ) : null}

      {openDetails ? (
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
