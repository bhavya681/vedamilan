"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { GrahaProgressDto } from "@/application/graha-katha/progress.service";

const empty: GrahaProgressDto = {
  exploredGrahaIds: [],
  completedChapters: {},
  bookmarks: [],
  savedInsights: [],
  lastGrahaId: null,
};

function scheduleIdle(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const ric = window.requestIdleCallback?.bind(window);
  const cic = window.cancelIdleCallback?.bind(window);
  if (ric && cic) {
    const id = ric(fn, { timeout: 2000 });
    return () => cic(id);
  }

  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}

export function useGrahaProgress(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  const [progress, setProgress] = useState<GrahaProgressDto>(empty);
  const [loading, setLoading] = useState(enabled);
  const chapterTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/graha-katha/progress");
      if (!res.ok) return;
      const json = (await res.json()) as { data?: { progress?: GrahaProgressDto } };
      if (json.data?.progress) setProgress(json.data.progress);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    // Defer progress fetch so first paint of library/detail isn't blocked.
    return scheduleIdle(() => {
      void refresh();
    });
  }, [enabled, refresh]);

  useEffect(() => {
    const timers = chapterTimers.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const patch = useCallback(async (body: Record<string, unknown>) => {
    const res = await fetch("/api/graha-katha/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;
    const json = (await res.json()) as { data?: { progress?: GrahaProgressDto } };
    if (json.data?.progress) setProgress(json.data.progress);
  }, []);

  const markExplored = useCallback(
    (grahaId: string) => {
      // Optimistic local update; network on idle.
      setProgress((prev) => {
        if (prev.exploredGrahaIds.includes(grahaId) && prev.lastGrahaId === grahaId) {
          return prev;
        }
        const explored = prev.exploredGrahaIds.includes(grahaId)
          ? prev.exploredGrahaIds
          : [...prev.exploredGrahaIds, grahaId];
        return { ...prev, exploredGrahaIds: explored, lastGrahaId: grahaId };
      });
      scheduleIdle(() => {
        void patch({ exploreGrahaId: grahaId });
      });
    },
    [patch],
  );

  const completeChapter = useCallback(
    (grahaId: string, chapterId: string) => {
      const key = `${grahaId}:${chapterId}`;
      const existing = chapterTimers.current.get(key);
      if (existing) clearTimeout(existing);

      // Debounce intersection-observer spam — one write per chapter after settle.
      const timer = setTimeout(() => {
        chapterTimers.current.delete(key);
        setProgress((prev) => {
          const list = prev.completedChapters[grahaId] ?? [];
          if (list.includes(chapterId)) return prev;
          return {
            ...prev,
            exploredGrahaIds: prev.exploredGrahaIds.includes(grahaId)
              ? prev.exploredGrahaIds
              : [...prev.exploredGrahaIds, grahaId],
            completedChapters: {
              ...prev.completedChapters,
              [grahaId]: [...list, chapterId],
            },
            lastGrahaId: grahaId,
          };
        });
        void patch({ completeChapter: { grahaId, chapterId } });
      }, 600);
      chapterTimers.current.set(key, timer);
    },
    [patch],
  );

  const toggleBookmark = useCallback(
    (grahaId: string) => {
      setProgress((prev) => {
        const has = prev.bookmarks.includes(grahaId);
        return {
          ...prev,
          bookmarks: has
            ? prev.bookmarks.filter((id) => id !== grahaId)
            : [...prev.bookmarks, grahaId],
        };
      });
      void patch({ toggleBookmark: grahaId });
    },
    [patch],
  );

  return {
    progress,
    loading,
    refresh,
    markExplored,
    completeChapter,
    toggleBookmark,
  };
}
