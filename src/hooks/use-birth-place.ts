"use client";

import { useEffect, useState } from "react";

export type BirthPlace = {
  latitude: string;
  longitude: string;
  timezone: string;
  placeName: string;
};

const DELHI: BirthPlace = {
  latitude: "28.6139",
  longitude: "77.2090",
  timezone: "Asia/Kolkata",
  placeName: "New Delhi",
};

export function useBirthPlace() {
  const [place, setPlace] = useState<BirthPlace>(DELHI);
  const [source, setSource] = useState<"birth" | "default">("default");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/birth-details")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const data = json.data as {
          latitude?: number;
          longitude?: number;
          timezone?: string;
          placeName?: string;
        } | null;
        if (json.success && data && data.latitude != null && data.longitude != null) {
          setPlace({
            latitude: String(data.latitude),
            longitude: String(data.longitude),
            timezone: data.timezone || "Asia/Kolkata",
            placeName: data.placeName || "Birth place",
          });
          setSource("birth");
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { place, source, loaded, setPlace };
}

export function toLocalDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromLocalDateInput(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}
