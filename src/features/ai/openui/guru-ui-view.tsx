"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { Renderer } from "@openuidev/react-lang";

import { guruUiLibrary } from "./library";

export function GuruUiView({
  code,
  animate = false,
  onAsk,
  className,
}: {
  code: string;
  animate?: boolean;
  onAsk?: (prompt: string) => void;
  className?: string;
}) {
  const [visibleChars, setVisibleChars] = useState(animate ? 0 : code.length);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!animate || !code) {
      setVisibleChars(code.length);
      return;
    }

    setVisibleChars(0);
    const started = performance.now();
    const duration = Math.min(1400, Math.max(520, code.length * 3));

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 2);
      setVisibleChars(Math.floor(code.length * eased));
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [code, animate]);

  const streaming = widthSafe(visibleChars) < code.length;

  return (
    <div
      className={cn(
        "w-full min-w-0 [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden",
        className,
      )}
      data-guru-openui
    >
      <Renderer
        response={code.slice(0, widthSafe(visibleChars))}
        library={guruUiLibrary}
        isStreaming={streaming}
        onAction={(event) => {
          if (!onAsk) return;
          if (event.type === "continue_conversation" || event.type === "custom") {
            const prompt = event.humanFriendlyMessage?.trim();
            if (prompt) onAsk(prompt);
          }
        }}
      />
    </div>
  );
}

function widthSafe(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}
