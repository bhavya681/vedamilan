"use client";

import { useCallback, useEffect, useState } from "react";

export type BirthDetailsBundle = {
  birthDate?: string | Date | null;
  birthTime?: string | null;
  birthTimeUnknown?: boolean;
  placeName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  updatedAt?: string | null;
};

export function useBirthDetails() {
  const [data, setData] = useState<BirthDetailsBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/birth-details");
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Failed to load birth details");
        setData(null);
      } else {
        setData((json.data || {}) as BirthDetailsBundle);
        setError(null);
      }
    } catch {
      setError("Failed to load birth details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload, setError };
}
