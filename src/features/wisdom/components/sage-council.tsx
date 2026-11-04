"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookmarkPlus,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  HeartHandshake,
  Home,
  Leaf,
  Loader2,
  MoonStar,
  RefreshCw,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { SageOrnamentLine } from "@/features/wisdom/components/sage-discourse";
import { WisdomPortrait } from "@/features/wisdom/components/wisdom-portrait";
import { getWisdomGuide, listWisdomGuides } from "@/domain/wisdom/guides";
import { LIFE_NEEDS, type LifeNeedId } from "@/domain/wisdom/sage-alignment";
import { COUNCIL_QUESTION_STARTERS, LIFE_NEED_QUESTIONS } from "@/domain/wisdom/life-prompts";
import { WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const DEFAULT_IDS = ["krishna", "vidura", "chanakya"];

const NEED_ICONS: Record<LifeNeedId, LucideIcon> = {
  relationship: HeartHandshake,
  career: BriefcaseBusiness,
  inner: Leaf,
  duty: Home,
  inquiry: Compass,
  astrology: MoonStar,
};

const JOURNAL_CATEGORY: Record<LifeNeedId, string> = {
  relationship: "Relationships",
  career: "Career",
  inner: "Personal Growth",
  duty: "Family",
  inquiry: "Personal Growth",
  astrology: "Other",
};

type AlignmentPayload = {
  need: LifeNeedId;
  context: {
    moonSign: string | null;
    gana: string | null;
    currentMaha: string | null;
  };
  suggestions: Array<{
    guide: { id: string };
    reasons: string[];
  }>;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function SageCouncil() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const questionParam = searchParams.get("q") || "";
  const needParam = searchParams.get("need") || "";
  const allGuides = useMemo(() => listWisdomGuides(), []);
  const [need, setNeed] = useState<LifeNeedId>("relationship");
  const [selected, setSelected] = useState<string[]>(DEFAULT_IDS);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [suggestedReasons, setSuggestedReasons] = useState<Record<string, string>>({});
  const [alignmentNote, setAlignmentNote] = useState("");
  const [alignmentLoading, setAlignmentLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState(LIFE_NEED_QUESTIONS.relationship);
  const [answer, setAnswer] = useState<string | null>(null);
  const [askedQuestion, setAskedQuestion] = useState("");
  const [askedGuides, setAskedGuides] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const selectionTouchedRef = useRef(false);
  const messageTouchedRef = useRef(false);
  const alignmentRequestRef = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadAlignment = useCallback(async (targetNeed?: LifeNeedId) => {
    const requestId = ++alignmentRequestRef.current;
    setAlignmentLoading(true);
    try {
      const query = targetNeed ? `?need=${targetNeed}` : "";
      const res = await fetch(`/api/wisdom${query}`);
      const json = await res.json();
      if (requestId !== alignmentRequestRef.current || !res.ok || !json.success) return;
      const alignment = json.data.alignment as AlignmentPayload;
      const resolvedNeed = targetNeed ?? alignment.need;
      const nextSuggested = alignment.suggestions.slice(0, 6).map((row) => row.guide.id);
      const nextReasons = Object.fromEntries(
        alignment.suggestions.map((row) => [row.guide.id, row.reasons[0] ?? ""]),
      );

      setNeed(resolvedNeed);
      setSuggested(nextSuggested);
      setSuggestedReasons(nextReasons);
      if (!selectionTouchedRef.current && nextSuggested.length >= 2) {
        setSelected(nextSuggested.slice(0, 3));
      }
      if (!messageTouchedRef.current) {
        setMessage(LIFE_NEED_QUESTIONS[resolvedNeed]);
      }
      const context = [
        alignment.context.moonSign ? `Moon ${alignment.context.moonSign}` : null,
        alignment.context.gana ? `${alignment.context.gana} gana` : null,
        alignment.context.currentMaha ? `${alignment.context.currentMaha} Mahadasha` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      setAlignmentNote(context);
    } catch {
      if (requestId === alignmentRequestRef.current) setAlignmentNote("");
    } finally {
      if (requestId === alignmentRequestRef.current) setAlignmentLoading(false);
    }
  }, []);

  useEffect(() => {
    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => Boolean(getWisdomGuide(id)))
      .slice(0, 3);
    if (ids.length >= 2) {
      selectionTouchedRef.current = true;
      setSelected(ids);
    }

    const question = questionParam.trim();
    if (question) {
      messageTouchedRef.current = true;
      setMessage(question.slice(0, 4000));
    }

    const requestedNeed = LIFE_NEEDS.some((item) => item.id === needParam)
      ? (needParam as LifeNeedId)
      : undefined;
    void loadAlignment(requestedNeed);
  }, [idsParam, loadAlignment, needParam, questionParam]);

  const orderedGuides = useMemo(() => {
    const seen = new Set<string>();
    return [...suggested, ...selected, ...allGuides.map((guide) => guide.id)].flatMap((id) => {
      if (seen.has(id)) return [];
      seen.add(id);
      const guide = getWisdomGuide(id);
      return guide ? [guide] : [];
    });
  }, [allGuides, selected, suggested]);

  const picker = showAll ? orderedGuides : orderedGuides.slice(0, 9);
  const answerGuides = askedGuides
    .map((id) => getWisdomGuide(id))
    .filter((guide): guide is NonNullable<typeof guide> => Boolean(guide));
  const needle = LIFE_NEEDS.find((item) => item.id === need);
  const canSubmit = selected.length >= 2 && Boolean(message.trim()) && !busy;

  function clearResult() {
    setAnswer(null);
    setError(null);
    setSaveStatus("idle");
  }

  function chooseNeed(nextNeed: LifeNeedId) {
    if (nextNeed === need) return;
    setNeed(nextNeed);
    clearResult();
    if (!messageTouchedRef.current) setMessage(LIFE_NEED_QUESTIONS[nextNeed]);
    void loadAlignment(nextNeed);
  }

  function toggle(id: string) {
    selectionTouchedRef.current = true;
    clearResult();
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  function updateMessage(value: string) {
    messageTouchedRef.current = true;
    setMessage(value);
  }

  function applyStarter(question: string) {
    updateMessage(question);
    clearResult();
    textareaRef.current?.focus();
  }

  async function runCouncil() {
    if (selected.length < 2 || !message.trim() || busy) return;
    const question = message.trim();
    const council = [...selected];
    setBusy(true);
    setAnswer(null);
    setError(null);
    setSaveStatus("idle");
    setAskedQuestion(question);
    setAskedGuides(council);
    try {
      const res = await fetch("/api/wisdom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "council",
          message: question,
          guideIds: council,
          need,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");
      setAnswer(json.data.answer);
    } catch {
      setError("The council reflection could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void runCouncil();
  }

  async function saveCouncil() {
    if (!answer || saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      const names = answerGuides.map((guide) => guide.displayName).join(", ");
      const res = await fetch("/api/wisdom/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: askedGuides[0],
          guideName: names ? `Council · ${names}` : "Council of sages",
          category: JOURNAL_CATEGORY[need],
          question: askedQuestion,
          insight: answer,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  function askAnother() {
    clearResult();
    setMessage("");
    messageTouchedRef.current = true;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => textareaRef.current?.focus(), 300);
  }

  return (
    <div data-dashboard-bleed className="w-full min-w-0 space-y-5 sm:space-y-7">
      <ContentReveal className="space-y-5 sm:space-y-7">
        <PageHeader
          eyebrow="Rishi Sabha · Practical counsel"
          title="Ask the Sages"
          description="Bring one real question — work, family, conflict, a habit, or a change you are avoiding. Compare a few grounded perspectives, then leave with one honest next step."
          actions={
            <>
              <Button asChild variant="outline">
                <Link href={routes.vedicWisdom}>Wisdom library</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={routes.wisdomJournal}>Open journal</Link>
              </Button>
            </>
          }
        />

        <div className="border-gold/20 from-card/80 via-muted/20 relative overflow-hidden rounded-3xl border bg-gradient-to-br to-transparent px-4 py-4 sm:px-6 sm:py-5">
          <SageOrnamentLine className="max-w-[14rem]" />
          <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
            This is not a fortune-telling session. Each sage is an AI guide inspired by a teaching
            tradition. The aim is practical clarity: name the trade-off, see it from more than one
            angle, and choose a step you can actually take.
          </p>
        </div>

        <form ref={formRef} onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
          <section className="border-border/55 bg-card/55 shadow-soft rounded-3xl border p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="bg-gold/15 text-gold font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm">
                1
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl tracking-tight sm:text-2xl">
                  What needs counsel?
                </h2>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  Choose the closest area of life. This shapes suggested guides and a useful
                  starting question — you can still write anything you want.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {LIFE_NEEDS.map((item) => {
                const Icon = NEED_ICONS[item.id];
                const active = need === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseNeed(item.id)}
                    aria-pressed={active}
                    className={cn(
                      "group flex min-h-[4.5rem] items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
                      active
                        ? "border-gold/45 bg-gold/12 text-foreground"
                        : "border-border/60 bg-background/40 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                        active ? "bg-gold/20 text-gold" : "bg-muted text-foreground/65",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed">{item.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              {alignmentLoading
                ? "Finding guides for this area…"
                : alignmentNote
                  ? `Suggested with your personal context: ${alignmentNote}.`
                  : `Guides matched to ${needle?.label.toLowerCase() ?? "this area"}.`}
            </p>
          </section>

          <section className="border-border/55 bg-card/55 shadow-soft rounded-3xl border p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="bg-gold/15 text-gold font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm">
                  2
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-xl tracking-tight sm:text-2xl">
                    Build your council
                  </h2>
                  <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
                    Pick two or three guides. Suggested voices appear first, but every tradition in
                    the library is available.
                  </p>
                </div>
              </div>
              <span className="border-gold/25 bg-gold/8 text-gold ml-11 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:ml-0">
                <Users className="h-3.5 w-3.5" aria-hidden />
                {selected.length}/3 selected
              </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {picker.map((guide) => {
                const active = selected.includes(guide.id);
                const isSuggested = suggested.includes(guide.id);
                return (
                  <button
                    key={guide.id}
                    type="button"
                    onClick={() => toggle(guide.id)}
                    aria-pressed={active}
                    className={cn(
                      "group relative flex min-w-0 items-start gap-3 rounded-2xl border p-3 text-left transition-all",
                      active
                        ? "border-gold/55 from-gold/12 via-card/90 to-card/80 shadow-gold bg-gradient-to-br"
                        : "border-border/60 bg-background/40 hover:border-gold/30 hover:bg-gold/5",
                    )}
                  >
                    <WisdomPortrait
                      guide={guide}
                      size="md"
                      className="ring-gold/15 group-hover:ring-gold/30 !h-12 !w-12 shrink-0 transition-shadow"
                    />
                    <span className="min-w-0 flex-1 pr-4">
                      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="font-display truncate text-sm font-semibold tracking-tight">
                          {guide.displayName}
                        </span>
                        {isSuggested ? (
                          <span className="text-gold/80 text-[9px] font-semibold tracking-[0.14em] uppercase">
                            Suggested
                          </span>
                        ) : null}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block truncate text-[10px] font-medium tracking-[0.12em] uppercase">
                        {guide.role}
                      </span>
                      <span className="text-muted-foreground mt-1 block truncate text-xs">
                        {guide.domain}
                      </span>
                      {isSuggested && suggestedReasons[guide.id] ? (
                        <span className="text-gold/80 mt-1 line-clamp-1 block text-[11px] leading-relaxed">
                          {suggestedReasons[guide.id]}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                        active
                          ? "border-gold/40 bg-gold text-background"
                          : "border-border/70 text-transparent",
                      )}
                      aria-hidden
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-xs leading-relaxed">
                {selected.length < 2
                  ? "Choose at least two guides to compare perspectives."
                  : selected.length === 3
                    ? "Choosing another guide replaces the earliest selection."
                    : "Add one more guide for a richer comparison."}
              </p>
              {orderedGuides.length > 9 ? (
                <button
                  type="button"
                  onClick={() => setShowAll((value) => !value)}
                  className="text-gold/90 hover:text-gold inline-flex w-fit items-center gap-1.5 text-xs font-semibold transition-colors"
                >
                  {showAll ? (
                    <>
                      Show fewer
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                    </>
                  ) : (
                    <>
                      Show all {orderedGuides.length} guides
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </section>

          <section className="border-border/55 bg-card/55 shadow-soft rounded-3xl border p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="bg-gold/15 text-gold font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm">
                3
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl tracking-tight sm:text-2xl">
                  Ask one honest question
                </h2>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  Be specific about the situation, the choice, and what you are afraid of getting
                  wrong. You will get more useful counsel.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label htmlFor="council-q" className="text-sm font-medium">
                Your question
              </label>
              <textarea
                ref={textareaRef}
                id="council-q"
                rows={5}
                maxLength={4000}
                value={message}
                onChange={(event) => updateMessage(event.target.value)}
                placeholder="What is actually happening, and what would you like clarity on?"
                className="border-border bg-background/60 focus-visible:ring-ring min-h-32 w-full resize-y rounded-2xl border px-3.5 py-3 text-base leading-relaxed outline-none focus-visible:ring-2 sm:text-sm"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-[11px]">
                  Specific situations get specific counsel. Avoid names if you prefer privacy.
                </p>
                <p className="text-muted-foreground text-[11px] tabular-nums">
                  {message.length}/4000
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
                Or start with a real-life prompt
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {COUNCIL_QUESTION_STARTERS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => applyStarter(question)}
                    className="border-border/60 hover:border-gold/35 hover:bg-gold/8 text-muted-foreground hover:text-foreground rounded-full border px-3 py-1.5 text-left text-xs leading-relaxed transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button type="submit" disabled={!canSubmit} className="min-h-11 w-full sm:w-auto">
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gathering perspectives…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Compare perspectives
                  </>
                )}
              </Button>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {selected.length < 2
                  ? "Select two or three guides first."
                  : "Usually takes a few moments. Reflections are AI interpretation."}
              </p>
            </div>
          </section>
        </form>

        {busy ? (
          <section className="sage-discourse border-gold/20 relative overflow-hidden rounded-3xl border px-5 py-6 sm:px-7">
            <div className="sage-discourse-wash pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative flex items-center gap-4">
              <div className="flex -space-x-2">
                {answerGuides.map((guide) => (
                  <WisdomPortrait
                    key={guide.id}
                    guide={guide}
                    size="sm"
                    className="ring-background !h-10 !w-10 ring-2"
                  />
                ))}
              </div>
              <div className="min-w-0">
                <p className="text-gold/80 text-[10px] font-medium tracking-[0.18em] uppercase">
                  Council reflection · AI interpretation
                </p>
                <p className="font-display mt-1 text-lg">
                  The council is considering your question…
                </p>
                <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{askedQuestion}</p>
              </div>
            </div>
          </section>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-2xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void runCouncil()}>
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        ) : null}

        {answer ? (
          <section className="sage-discourse border-gold/20 relative overflow-hidden rounded-3xl border px-4 py-5 sm:px-7 sm:py-6">
            <div className="sage-discourse-wash pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {answerGuides.map((guide) => (
                      <WisdomPortrait
                        key={guide.id}
                        guide={guide}
                        size="sm"
                        className="ring-background !h-10 !w-10 ring-2"
                      />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="text-gold/80 text-[10px] font-medium tracking-[0.18em] uppercase">
                      Council reflection · AI interpretation
                    </p>
                    <h2 className="font-display mt-1 text-xl tracking-tight sm:text-2xl">
                      {answerGuides.length === 2
                        ? "Two perspectives, one decision"
                        : "Three perspectives, one decision"}
                    </h2>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void saveCouncil()}
                  disabled={saveStatus === "saving" || saveStatus === "saved"}
                  className="w-full sm:w-auto"
                >
                  {saveStatus === "saving" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : saveStatus === "saved" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <BookmarkPlus className="h-3.5 w-3.5" />
                  )}
                  {saveStatus === "saved" ? "Saved to journal" : "Save reflection"}
                </Button>
              </div>

              <blockquote className="border-gold/30 text-foreground/85 border-l-2 pl-3 text-sm leading-relaxed italic">
                {askedQuestion}
              </blockquote>

              <div className="sage-manuscript">
                <GuruMarkdown content={answer} />
              </div>

              {saveStatus === "error" ? (
                <p className="text-destructive text-xs">
                  Could not save this reflection. Please try again.
                </p>
              ) : null}

              <div className="border-border/40 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center">
                <Button type="button" onClick={askAnother} className="w-full sm:w-auto">
                  Ask another question
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button asChild variant="ghost" className="w-full sm:w-auto">
                  <Link href={routes.wisdomJournal}>Open Wisdom Journal</Link>
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
          {WISDOM_AI_DISCLAIMER} Historical teaching, traditional interpretation, and AI-generated
          modern reflection are distinguished in the response when possible. Never treat invented
          lines as quotations.
        </p>
      </ContentReveal>
    </div>
  );
}
