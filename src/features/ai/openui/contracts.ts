import {
  createLibrary,
  defineComponent,
  type ComponentGroup,
  type DefinedComponent,
} from "@openuidev/lang-core";
import { z } from "zod/v4";

/**
 * Shared OpenUI contracts for AI Guru.
 *
 * The schemas and descriptions here power both:
 * - the server-side system prompt + validation, and
 * - the client-side renderer library.
 *
 * Keep this module free of React so the backend can import it safely.
 */

const placeholder = () => null;

export const TextBlock = defineComponent({
  name: "TextBlock",
  description:
    "A narrative paragraph or short section. Supports light markdown (**bold**, *italic*, lists).",
  props: z.object({
    text: z.string().describe("The prose to show. Keep it to 1-3 short paragraphs."),
  }),
  component: placeholder,
});

export const Callout = defineComponent({
  name: "Callout",
  description:
    "A highlighted insight, caution, or encouraging note. Use for one key takeaway, not for the main answer.",
  props: z.object({
    tone: z
      .enum(["insight", "caution", "success"])
      .describe(
        "insight = golden guidance, caution = gentle warning, success = supportive strength",
      ),
    title: z.string().describe("Short heading, max 6 words."),
    text: z.string().describe("One or two clear sentences."),
  }),
  component: placeholder,
});

export const StatCard = defineComponent({
  name: "StatCard",
  description: "A single metric or chart fact with a label, value, and optional context.",
  props: z.object({
    label: z.string().describe("Short label such as Lagna, Moon, Current Dasha."),
    value: z.string().describe("The value, such as Leo, Rohini, Venus / Saturn."),
    hint: z.string().optional().describe("Optional one-line explanation."),
  }),
  component: placeholder,
});

export const StatGrid = defineComponent({
  name: "StatGrid",
  description: "A responsive grid of 2-6 StatCard items for chart facts and key numbers.",
  props: z.object({
    cards: z.array(StatCard.ref).describe("Two to six concise StatCard references."),
  }),
  component: placeholder,
});

export const ScoreGauge = defineComponent({
  name: "ScoreGauge",
  description:
    "A circular gauge for a score out of 100, such as compatibility, marriage readiness, or yoga strength.",
  props: z.object({
    title: z.string().describe("What the score measures."),
    score: z.number().min(0).max(100).describe("Score from 0 to 100."),
    caption: z.string().optional().describe("Optional one-line interpretation."),
  }),
  component: placeholder,
});

export const PlanetRow = defineComponent({
  name: "PlanetRow",
  description: "One row in a planetary positions table.",
  props: z.object({
    planet: z.string().describe("Planet name, e.g. Venus."),
    sign: z.string().describe("Zodiac sign."),
    house: z.number().int().min(1).max(12).describe("House number from 1 to 12."),
    note: z.string().optional().describe("Optional dignity, nakshatra, or retrograde note."),
  }),
  component: placeholder,
});

export const PlanetTable = defineComponent({
  name: "PlanetTable",
  description: "A table of planetary positions. Use when the answer needs 2+ planet facts.",
  props: z.object({
    rows: z.array(PlanetRow.ref).describe("PlanetRow references."),
    title: z.string().optional().describe("Optional table title."),
  }),
  component: placeholder,
});

export const TimingWindow = defineComponent({
  name: "TimingWindow",
  description: "One marriage or career timing window with a period and optional score.",
  props: z.object({
    label: z.string().describe("Short label such as 2027 - favourable."),
    period: z.string().describe("Date range or dasha period."),
    score: z.number().min(0).max(100).optional().describe("Optional confidence score 0-100."),
    note: z.string().optional().describe("Optional one-line reason."),
  }),
  component: placeholder,
});

export const TimingList = defineComponent({
  name: "TimingList",
  description: "A list of timing windows, ranked by strength.",
  props: z.object({
    windows: z.array(TimingWindow.ref).describe("Two to five TimingWindow references."),
    title: z.string().optional().describe("Optional section title."),
  }),
  component: placeholder,
});

export const InsightList = defineComponent({
  name: "InsightList",
  description: "A short bullet list of actionable insights, strengths, or cautions.",
  props: z.object({
    items: z.array(z.string()).describe("Two to five short bullet strings."),
    title: z.string().optional().describe("Optional section title."),
  }),
  component: placeholder,
});

export const FollowUpChips = defineComponent({
  name: "FollowUpChips",
  description:
    "Two to four follow-up questions the member can tap. Tapping sends that question to AI Guru.",
  props: z.object({
    prompts: z.array(z.string()).describe("Short follow-up questions, each under 90 characters."),
  }),
  component: placeholder,
});

const blockUnion = z.union([
  TextBlock.ref,
  Callout.ref,
  StatGrid.ref,
  ScoreGauge.ref,
  PlanetTable.ref,
  TimingList.ref,
  InsightList.ref,
  FollowUpChips.ref,
]);

export const Stack = defineComponent({
  name: "Stack",
  description:
    "The root layout for an AI Guru reply. Holds the narrative and any structured blocks in reading order.",
  props: z.object({
    children: z.array(blockUnion).describe("Ordered blocks that make up the reply."),
  }),
  component: placeholder,
});

export const guruComponents: DefinedComponent[] = [
  TextBlock,
  Callout,
  StatCard,
  StatGrid,
  ScoreGauge,
  PlanetRow,
  PlanetTable,
  TimingWindow,
  TimingList,
  InsightList,
  FollowUpChips,
  Stack,
];

export const guruComponentGroups: ComponentGroup[] = [
  {
    name: "Layout & Narrative",
    components: ["Stack", "TextBlock", "Callout"],
    notes: [
      "- Stack is always the root and contains the reply blocks in order.",
      "- Start with one short TextBlock summary unless the answer is only a single fact.",
      "- Use Callout only for one key takeaway, not for every sentence.",
    ],
  },
  {
    name: "Chart Facts",
    components: ["StatCard", "StatGrid", "ScoreGauge", "PlanetRow", "PlanetTable"],
    notes: [
      "- Use StatGrid for 2-4 headline facts instead of writing them as prose.",
      "- Use ScoreGauge only when you have an actual engine score out of 100.",
      "- Use PlanetTable only when 2 or more planets matter to the answer.",
    ],
  },
  {
    name: "Timing & Guidance",
    components: ["TimingWindow", "TimingList", "InsightList"],
    notes: [
      "- TimingList is for dasha windows or marriage windows returned by tools.",
      "- InsightList is for practical next steps, strengths, or gentle cautions.",
    ],
  },
  {
    name: "Actions",
    components: ["FollowUpChips"],
    notes: [
      "- Always finish with 2-4 useful FollowUpChips when a natural next question exists.",
      "- Never repeat the member's exact question as a chip.",
    ],
  },
];

export const guruUiLibraryId = "vedamilan-guru-ui";

export function createGuruPromptLibrary() {
  return createLibrary({
    id: guruUiLibraryId,
    root: "Stack",
    components: guruComponents,
    componentGroups: guruComponentGroups,
  });
}
