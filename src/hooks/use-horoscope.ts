"use client";

import { useCallback, useEffect, useState } from "react";

export type HoroscopeBundle = {
  horoscope?: {
    lagnaSign?: string;
    lagnaNakshatra?: string | null;
    lagnaNakshatraPada?: number | null;
    moonSign?: string;
    sunSign?: string;
    manglikStatus?: string;
    planets?: Array<{
      planet: string;
      sign: string;
      house: number;
      nakshatra: string;
      nakshatraPada?: number;
      longitude?: number;
      dignity?: string | null;
      isRetrograde?: boolean;
    }>;
    yogas?: Array<{ name: string; category: string }>;
    doshas?: Array<{ code: string; present: boolean; severity?: string }>;
    chartNorth?: unknown;
    chartSouth?: unknown;
    chartEast?: unknown;
    calculatedAt?: string;
  } | null;
  dasha?: {
    currentMaha?: string | null;
    currentAntar?: string | null;
    periods?: Array<{
      lord: string;
      level: string;
      startDate: string;
      endDate: string;
      parentLord?: string | null;
    }>;
  } | null;
  manglikNote?: string;
};

export function useHoroscope() {
  const [data, setData] = useState<HoroscopeBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/horoscope");
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Failed to load kundli");
        setData(null);
      } else {
        setData(json.data);
        setError(null);
      }
    } catch {
      setError("Failed to load kundli");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload, setError };
}
