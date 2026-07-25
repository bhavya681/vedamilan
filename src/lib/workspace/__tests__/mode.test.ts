import { describe, expect, it } from "vitest";

import { inferModeFromPath, isWorkspaceMode, WORKSPACE_MODE_META } from "@/lib/workspace/mode";

describe("workspace mode", () => {
  it("validates mode values", () => {
    expect(isWorkspaceMode("astrology")).toBe(true);
    expect(isWorkspaceMode("matrimony")).toBe(true);
    expect(isWorkspaceMode("wisdom")).toBe(true);
    expect(isWorkspaceMode("dating")).toBe(false);
  });

  it("exposes mode home paths", () => {
    expect(WORKSPACE_MODE_META.astrology.homePath).toBe("/dashboard/astrology");
    expect(WORKSPACE_MODE_META.matrimony.homePath).toBe("/dashboard/matrimony");
    expect(WORKSPACE_MODE_META.wisdom.homePath).toBe("/dashboard/vedic-wisdom");
  });

  it("infers mode from dashboard paths", () => {
    expect(inferModeFromPath("/dashboard/kundli/dasha")).toBe("astrology");
    expect(inferModeFromPath("/dashboard/matches")).toBe("matrimony");
    expect(inferModeFromPath("/dashboard/compatibility")).toBe("matrimony");
    expect(inferModeFromPath("/dashboard/vedic-wisdom")).toBe("wisdom");
    expect(inferModeFromPath("/en/dashboard/vedic-wisdom/vasistha/chat")).toBe("wisdom");
    expect(inferModeFromPath("/dashboard/settings")).toBeNull();
    expect(inferModeFromPath("/pricing")).toBeNull();
  });
});
