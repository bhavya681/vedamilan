"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import { WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";
import { cn } from "@/lib/utils/cn";

function splitDisclaimer(content: string): { body: string; hasDisclaimer: boolean; text?: string } {
  const trimmed = content.trim();
  for (const line of [VEDIC_AI_DISCLAIMER, WISDOM_AI_DISCLAIMER]) {
    if (trimmed.includes(line)) {
      return { body: trimmed.replace(line, "").trim(), hasDisclaimer: true, text: line };
    }
  }
  return { body: trimmed, hasDisclaimer: false };
}

export function GuruMarkdown({
  content,
  className,
  tone = "assistant",
}: {
  content: string;
  className?: string;
  tone?: "assistant" | "user";
}) {
  const { body, hasDisclaimer, text: disclaimerText } = splitDisclaimer(content);
  const isUser = tone === "user";

  return (
    <div className={cn("guru-md", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="font-display mt-4 mb-2 text-lg font-semibold tracking-tight first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="font-display text-gold mt-4 mb-2 text-base font-semibold tracking-tight first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-3 mb-1.5 text-sm font-semibold tracking-wide first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p
              className={cn(
                "mb-2.5 text-[13.5px] leading-relaxed last:mb-0 sm:text-sm",
                isUser ? "text-primary-foreground/95" : "text-foreground/90",
              )}
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul
              className={cn(
                "mb-3 list-disc space-y-1.5 pl-4 text-[13.5px] leading-relaxed sm:text-sm",
                isUser && "marker:text-primary-foreground/70",
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={cn(
                "mb-3 list-decimal space-y-1.5 pl-4 text-[13.5px] leading-relaxed sm:text-sm",
                isUser && "marker:text-primary-foreground/70",
              )}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={cn("pl-0.5", !isUser && "marker:text-gold/80")}>{children}</li>
          ),
          strong: ({ children }) => (
            <strong
              className={cn(
                "font-semibold",
                isUser ? "text-primary-foreground" : "text-foreground",
              )}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic opacity-90">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-gold underline-offset-2 hover:underline"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-gold/40 text-muted-foreground my-3 border-l-2 pl-3 text-sm italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-border/50 my-4" />,
          code: ({ children, className: codeClass }) => {
            const isBlock = Boolean(codeClass);
            if (isBlock) {
              return (
                <code className="bg-muted/60 block overflow-x-auto rounded-xl p-3 text-xs">
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-muted/70 rounded-md px-1.5 py-0.5 text-[12px] font-medium">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[280px] text-left text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-muted/50 border-b px-2.5 py-2 font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-border/40 border-b px-2.5 py-2">{children}</td>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
      {hasDisclaimer ? (
        <p
          className={cn(
            "mt-3 border-t pt-3 text-[11px] leading-relaxed",
            isUser
              ? "border-primary-foreground/20 text-primary-foreground/70"
              : "border-border/40 text-muted-foreground",
          )}
        >
          {disclaimerText || VEDIC_AI_DISCLAIMER}
        </p>
      ) : null}
    </div>
  );
}
