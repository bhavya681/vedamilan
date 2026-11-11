"use client";

import { ChevronRight, CircleAlert, Compass, Sparkles } from "lucide-react";

import {
  createLibrary,
  defineComponent,
  useTriggerAction,
  type ComponentRenderProps,
} from "@openuidev/react-lang";

import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { cn } from "@/lib/utils/cn";

import {
  Callout,
  FollowUpChips,
  guruComponentGroups,
  guruUiLibraryId,
  InsightList,
  PlanetRow,
  PlanetTable,
  ScoreGauge,
  Stack,
  StatCard,
  StatGrid,
  TextBlock,
  TimingList,
  TimingWindow,
} from "./contracts";

function TextBlockView({ props }: ComponentRenderProps<{ text: string }>) {
  return <GuruMarkdown content={props.text} className="guru-md min-w-0" />;
}

const calloutTones = {
  insight: {
    wrap: "border-gold/30 bg-gold/[0.06]",
    icon: "text-gold",
    Icon: Sparkles,
  },
  caution: {
    wrap: "border-amber/30 bg-amber/[0.07]",
    icon: "text-amber",
    Icon: CircleAlert,
  },
  success: {
    wrap: "border-emerald/30 bg-emerald/[0.07]",
    icon: "text-emerald",
    Icon: Compass,
  },
} as const;

function CalloutView({
  props,
}: ComponentRenderProps<{ tone: keyof typeof calloutTones; title: string; text: string }>) {
  const tone = calloutTones[props.tone] ?? calloutTones.insight;
  return (
    <div className={cn("rounded-2xl border px-4 py-3.5", tone.wrap)}>
      <p
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase",
          tone.icon,
        )}
      >
        <tone.Icon className="h-3.5 w-3.5" />
        {props.title}
      </p>
      <p className="text-foreground/85 mt-1.5 text-[13.5px] leading-relaxed sm:text-sm">
        {props.text}
      </p>
    </div>
  );
}

function StatCardView({
  props,
}: ComponentRenderProps<{ label: string; value: string; hint?: string }>) {
  return (
    <div className="border-border/55 from-background to-muted/25 rounded-2xl border bg-gradient-to-br px-3.5 py-3">
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.12em] uppercase">
        {props.label}
      </p>
      <p className="font-display mt-1 text-lg leading-tight">{props.value}</p>
      {props.hint ? (
        <p className="text-muted-foreground mt-1 text-[11px] leading-snug">{props.hint}</p>
      ) : null}
    </div>
  );
}

function StatGridView({ props, renderNode }: ComponentRenderProps<{ cards: unknown[] }>) {
  return <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{renderNode(props.cards)}</div>;
}

function ScoreGaugeView({
  props,
}: ComponentRenderProps<{ title: string; score: number; caption?: string }>) {
  const value = Math.max(0, Math.min(100, Math.round(props.score)));
  return (
    <div className="border-border/55 bg-card/70 flex items-center gap-4 rounded-2xl border px-4 py-3.5">
      <div
        className="relative flex size-16 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(var(--gold) ${value * 3.6}deg, color-mix(in srgb, var(--muted) 82%, transparent) 0deg)`,
        }}
        aria-label={`${props.title}: ${value} out of 100`}
      >
        <div className="bg-card flex size-[3.15rem] items-center justify-center rounded-full">
          <span className="font-display text-lg leading-none tabular-nums">{value}</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.12em] uppercase">
          {props.title}
        </p>
        <p className="mt-1 text-sm font-medium">
          {value >= 75 ? "Supportive" : value >= 50 ? "Mixed but workable" : "Needs careful review"}
        </p>
        {props.caption ? (
          <p className="text-muted-foreground mt-1 text-[11px] leading-snug">{props.caption}</p>
        ) : null}
      </div>
    </div>
  );
}

function PlanetRowView({
  props,
}: ComponentRenderProps<{ planet: string; sign: string; house: number; note?: string }>) {
  return (
    <div className="border-border/50 bg-background/70 rounded-xl border px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold">{props.planet}</p>
        <span className="bg-gold/12 text-gold rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
          House {props.house}
        </span>
      </div>
      <p className="text-muted-foreground mt-0.5 text-xs">{props.sign}</p>
      {props.note ? (
        <p className="text-muted-foreground/85 mt-1 text-[11px] leading-snug">{props.note}</p>
      ) : null}
    </div>
  );
}

function PlanetTableView({
  props,
  renderNode,
}: ComponentRenderProps<{ rows: unknown[]; title?: string }>) {
  return (
    <section className="space-y-2.5">
      {props.title ? (
        <h4 className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
          {props.title}
        </h4>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{renderNode(props.rows)}</div>
    </section>
  );
}

function TimingWindowView({
  props,
}: ComponentRenderProps<{ label: string; period: string; score?: number; note?: string }>) {
  return (
    <li className="border-border/50 bg-background/70 rounded-xl border px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{props.label}</p>
        {typeof props.score === "number" ? (
          <span className="text-gold shrink-0 text-xs font-semibold tabular-nums">
            {Math.round(props.score)}%
          </span>
        ) : null}
      </div>
      <p className="text-muted-foreground mt-0.5 text-[11px]">{props.period}</p>
      {typeof props.score === "number" ? (
        <div className="bg-muted/70 mt-2 h-1.5 overflow-hidden rounded-full">
          <div
            className="from-gold to-amber h-full rounded-full bg-gradient-to-r"
            style={{ width: `${Math.max(0, Math.min(100, props.score))}%` }}
          />
        </div>
      ) : null}
      {props.note ? (
        <p className="text-muted-foreground/85 mt-1.5 text-[11px] leading-snug">{props.note}</p>
      ) : null}
    </li>
  );
}

function TimingListView({
  props,
  renderNode,
}: ComponentRenderProps<{ windows: unknown[]; title?: string }>) {
  return (
    <section className="space-y-2.5">
      <h4 className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {props.title || "Timing windows"}
      </h4>
      <ul className="space-y-2">{renderNode(props.windows)}</ul>
    </section>
  );
}

function InsightListView({ props }: ComponentRenderProps<{ items: string[]; title?: string }>) {
  return (
    <section className="space-y-2">
      <h4 className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {props.title || "Key insights"}
      </h4>
      <ul className="space-y-1.5">
        {props.items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-2 text-[13.5px] leading-relaxed">
            <Sparkles className="text-gold mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="text-foreground/90">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FollowUpChipsView({ props }: ComponentRenderProps<{ prompts: string[] }>) {
  const triggerAction = useTriggerAction();

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {props.prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => void triggerAction(prompt)}
          className="border-border/60 bg-card/80 hover:border-gold/45 hover:bg-gold/[0.07] group inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-[11.5px] leading-snug transition-colors"
        >
          <span className="truncate">{prompt}</span>
          <ChevronRight className="text-muted-foreground group-hover:text-gold h-3 w-3 shrink-0 transition-colors" />
        </button>
      ))}
    </div>
  );
}

function StackView({ props, renderNode }: ComponentRenderProps<{ children: unknown[] }>) {
  return <div className="space-y-3.5 sm:space-y-4">{renderNode(props.children)}</div>;
}

const RTextBlock = defineComponent({
  name: TextBlock.name,
  description: TextBlock.description,
  props: TextBlock.props,
  component: TextBlockView,
});

const RCallout = defineComponent({
  name: Callout.name,
  description: Callout.description,
  props: Callout.props,
  component: CalloutView,
});

const RStatCard = defineComponent({
  name: StatCard.name,
  description: StatCard.description,
  props: StatCard.props,
  component: StatCardView,
});

const RStatGrid = defineComponent({
  name: StatGrid.name,
  description: StatGrid.description,
  props: StatGrid.props,
  component: StatGridView,
});

const RScoreGauge = defineComponent({
  name: ScoreGauge.name,
  description: ScoreGauge.description,
  props: ScoreGauge.props,
  component: ScoreGaugeView,
});

const RPlanetRow = defineComponent({
  name: PlanetRow.name,
  description: PlanetRow.description,
  props: PlanetRow.props,
  component: PlanetRowView,
});

const RPlanetTable = defineComponent({
  name: PlanetTable.name,
  description: PlanetTable.description,
  props: PlanetTable.props,
  component: PlanetTableView,
});

const RTimingWindow = defineComponent({
  name: TimingWindow.name,
  description: TimingWindow.description,
  props: TimingWindow.props,
  component: TimingWindowView,
});

const RTimingList = defineComponent({
  name: TimingList.name,
  description: TimingList.description,
  props: TimingList.props,
  component: TimingListView,
});

const RInsightList = defineComponent({
  name: InsightList.name,
  description: InsightList.description,
  props: InsightList.props,
  component: InsightListView,
});

const RFollowUpChips = defineComponent({
  name: FollowUpChips.name,
  description: FollowUpChips.description,
  props: FollowUpChips.props,
  component: FollowUpChipsView,
});

const RStack = defineComponent({
  name: Stack.name,
  description: Stack.description,
  props: Stack.props,
  component: StackView,
});

export const guruUiLibrary = createLibrary({
  id: guruUiLibraryId,
  root: "Stack",
  componentGroups: guruComponentGroups,
  components: [
    RTextBlock,
    RCallout,
    RStatCard,
    RStatGrid,
    RScoreGauge,
    RPlanetRow,
    RPlanetTable,
    RTimingWindow,
    RTimingList,
    RInsightList,
    RFollowUpChips,
    RStack,
  ],
});
