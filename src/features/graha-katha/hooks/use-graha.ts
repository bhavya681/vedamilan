"use client";

import { useEffect, useState } from "react";

import { isGrahaId, loadGraha } from "@/domain/graha-katha";
import type { GrahaEntity } from "@/domain/graha-katha/types";

export function useGraha(grahaId: string) {
  const valid = isGrahaId(grahaId);
  const [graha, setGraha] = useState<GrahaEntity | null>(null);
  const [loading, setLoading] = useState(valid);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!valid) {
      setGraha(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void loadGraha(grahaId)
      .then((entity) => {
        if (cancelled) return;
        setGraha(entity);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setGraha(null);
        setError("Failed to load Graha content");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [grahaId, valid]);

  return { graha, loading, error, valid };
}
