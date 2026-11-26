"use client";

import { useReducedMotion } from "framer-motion";

import { useMounted } from "@/hooks/use-mounted";

export function useSafeReducedMotion(): boolean {
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();

  return mounted && Boolean(reduceMotion);
}
