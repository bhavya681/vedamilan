"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardHomeSkeleton } from "@/components/ui/page-skeletons";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { WORKSPACE_MODE_META } from "@/lib/workspace/mode";

/** Legacy `/dashboard` entry — routes into the active workspace mode home. */
export default function DashboardPage() {
  const router = useRouter();
  const { mode, hydrated } = useWorkspaceMode();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(WORKSPACE_MODE_META[mode].homePath);
  }, [hydrated, mode, router]);

  return <DashboardHomeSkeleton />;
}
