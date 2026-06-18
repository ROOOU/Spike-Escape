import { describe, expect, it } from "vitest";
import { SEGMENT_CATALOG } from "../src/config/segments";
import { describePlannedBeat, pickPlannedSegment } from "../src/utils/segmentPlanner";

function byId(id: string) {
  const segment = SEGMENT_CATALOG.find((entry) => entry.id === id);
  if (!segment) {
    throw new Error(`Missing segment ${id}`);
  }

  return segment;
}

describe("pickPlannedSegment", () => {
  it("uses the authored onboarding sequence before freeform generation", () => {
    const picks = Array.from({ length: 6 }, (_, generatedCount) =>
      pickPlannedSegment({
        generatedCount,
        progressAnchorX: 0,
        elapsedMs: 0,
        recent: []
      }).id
    );

    expect(picks).toEqual([
      "safe-runway",
      "single-gap",
      "coin-arc",
      "recovery-lane",
      "stair-step",
      "wall-sprint-window"
    ]);
  });

  it("publishes a readable beat pattern after onboarding", () => {
    expect(describePlannedBeat(6)).toBe("build");
    expect(describePlannedBeat(7)).toBe("reward");
    expect(describePlannedBeat(8)).toBe("pressure");
    expect(describePlannedBeat(9)).toBe("recovery");
    expect(describePlannedBeat(10)).toBe("build");
    expect(describePlannedBeat(11)).toBe("climax");
  });

  it("prefers reward routes when the act beat asks for a reward segment", () => {
    const picked = pickPlannedSegment(
      {
        generatedCount: 7,
        progressAnchorX: 3600,
        elapsedMs: 26000,
        recent: [byId("wall-sprint-window"), byId("safe-runway")]
      },
      () => 0
    );

    expect(["coin-arc", "narrow-landing"]).toContain(picked.id);
  });

  it("uses recovery beats after a pressure target when intensity chained", () => {
    const picked = pickPlannedSegment(
      {
        generatedCount: 9,
        progressAnchorX: 7200,
        elapsedMs: 48000,
        recent: [byId("spike-bridge"), byId("mixed-pressure")]
      },
      () => 0
    );

    expect(["recovery-lane", "safe-runway", "wall-sprint-window"]).toContain(picked.id);
  });

  it("forces a cooldown segment after two intense segments", () => {
    const picked = pickPlannedSegment(
      {
        generatedCount: 8,
        progressAnchorX: 7000,
        elapsedMs: 45000,
        recent: [byId("narrow-landing"), byId("mixed-pressure")]
      },
      () => 0
    );

    expect(["recovery-lane", "safe-runway", "wall-sprint-window"]).toContain(picked.id);
  });

  it("avoids chaining another risk segment immediately after a risk reward", () => {
    const picked = pickPlannedSegment(
      {
        generatedCount: 8,
        progressAnchorX: 7000,
        elapsedMs: 45000,
        recent: [byId("safe-runway"), byId("risk-ribbon")]
      },
      () => 0
    );

    expect(picked.id).not.toBe("risk-ribbon");
  });
});
