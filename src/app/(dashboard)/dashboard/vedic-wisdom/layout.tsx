"use client";

import { useEffect } from "react";

import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";

export default function VedicWisdomLayout({ children }: { children: React.ReactNode }) {
  const { setMode } = useWorkspaceMode();

  useEffect(() => {
    setMode("wisdom", { navigate: false });
  }, [setMode]);

  return children;
}
