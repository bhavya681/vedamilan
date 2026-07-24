"use client";

import { useState } from "react";

import { GlassCard } from "@/components/ui/premium-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

function ModuleDetails({ module }: { module: AmdModule }) {
  return (
    <div className="space-y-3 pb-2">
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
    </div>
  );
}

const DIMENSION_LABELS: Record<string, string> = {
  d1Foundation: "Marriage Foundation",
  d9Marriage: "Marriage Experience",
  venusDynamics: "Attraction & Intimacy",
  moonEmotional: "Emotional Bond",
  houseTriad: "Overall Compatibility",
  lagnaCompatibility: "Relationship Balance",
  selfPartnerAxis: "Relationship Balance",
  yoniIntimacy: "Attraction & Intimacy",
  saturnResponsibility: "Relationship Balance",
  ninthSeventh: "Shared Growth",
  arudha: "Advanced Vedic View",
  relationshipBalance: "Relationship Balance",
  timingActivation: "Timing",
};

export function AdvancedMarriageDynamicsPanel({
  data,
  className,
}: {
  data: AdvancedMarriageDynamicsView | null | undefined;
  className?: string;
}) {
  const [showMethod, setShowMethod] = useState(false);

  if (!data) return null;

  const moduleEntries: Array<{ key: string; module: AmdModule }> = [];
  const pushModule = (key: string, module?: AmdModule) => {
    if (module) moduleEntries.push({ key, module });
  };
  pushModule("d1Foundation", data.modules?.d1Foundation);
  pushModule("d9Marriage", data.modules?.d9Marriage);
  pushModule("venusDynamics", data.modules?.venusDynamics);
  pushModule("moonEmotional", data.modules?.moonEmotional);
  pushModule("houseTriad", data.modules?.houseTriad);
  pushModule("lagnaCompatibility", data.modules?.lagnaCompatibility);
  pushModule("selfPartnerAxis", data.modules?.selfPartnerAxis);
  pushModule("yoniIntimacy", data.modules?.yoniIntimacy);
  pushModule("saturnResponsibility", data.modules?.saturnResponsibility);
  pushModule("ninthSeventh", data.modules?.ninthSeventh);
  pushModule("arudha", data.modules?.arudha);
  pushModule("relationshipBalance", data.modules?.relationshipBalance);
  pushModule("timingActivation", data.modules?.timingActivation);

  return (
    <div className={cn("space-y-4", className)}>
      <GlassCard glow className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
              Layer 4 · Vedic Marriage Intelligence
            </p>
            <h2 className="font-display mt-1 text-2xl sm:text-3xl">Your Compatibility</h2>
          </div>
          {data.overallTone ? (
            <Badge className="bg-primary/15 text-foreground">{data.overallTone}</Badge>
          ) : null}
        </div>
        <DualCopy dual={data.overallTheme} />
        <div className="grid gap-4 sm:grid-cols-2">
          <BulletList title="Why this works · key strengths" items={data.strongestFoundations} />
          <BulletList title="Areas to understand" items={data.potentialGrowthAreas} />
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
        <Button type="button" variant="outline" onClick={() => setShowMethod((v) => !v)}>
          {showMethod ? "Hide methodology" : "How we analyze"}
        </Button>
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

      {moduleEntries.length ? (
        <GlassCard className="space-y-2">
          <div>
            <h3 className="font-display text-xl">Explore dimensions</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Summary first — open a dimension for Vedic detail.
            </p>
          </div>
          <Accordion type="multiple" className="w-full">
            {moduleEntries.map(({ key, module }) => (
              <AccordionItem key={module.id} value={module.id}>
                <AccordionTrigger className="hover:no-underline">
                  <span className="flex flex-wrap items-center gap-2 pr-3 text-left">
                    <span className="font-display text-base sm:text-lg">{module.title}</span>
                    <Badge variant="secondary">{module.tone}</Badge>
                    <span className="text-muted-foreground text-xs">
                      {DIMENSION_LABELS[key] || "Dimension"} · Explore
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ModuleDetails module={module} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </GlassCard>
      ) : null}
    </div>
  );
}
