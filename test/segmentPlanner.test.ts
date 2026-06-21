import { describe, expect, it } from "vitest";
import { PLAYER_CONFIG } from "../src/config/playerConfig";
import { SEGMENT_CATALOG, START_SEGMENT } from "../src/config/segments";
import { ScoreTracker } from "../src/systems/scoreTracker";
import {
  describePlannedBeat,
  isSegmentUnlockedByDistance,
  pickPlannedSegment
} from "../src/utils/segmentPlanner";

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
        mapDistancePx: 9999,
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
        mapDistancePx: 7200,
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
        mapDistancePx: 22000,
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
        mapDistancePx: 22000,
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
        mapDistancePx: 22000,
        recent: [byId("safe-runway"), byId("risk-ribbon")]
      },
      () => 0
    );

    expect(picked.id).not.toBe("risk-ribbon");
  });

  it("unlocks hazard families only from map distance thresholds", () => {
    expect(isSegmentUnlockedByDistance(byId("safe-runway"), 799)).toBe(false);
    expect(isSegmentUnlockedByDistance(byId("safe-runway"), 800)).toBe(true);
    expect(isSegmentUnlockedByDistance(byId("spike-garden-intro"), 3199)).toBe(false);
    expect(isSegmentUnlockedByDistance(byId("spike-garden-intro"), 3200)).toBe(true);
    expect(isSegmentUnlockedByDistance(byId("spike-bridge"), 6399)).toBe(false);
    expect(isSegmentUnlockedByDistance(byId("spike-bridge"), 6400)).toBe(true);
    expect(isSegmentUnlockedByDistance(byId("vertical-patrol-intro"), 8999)).toBe(false);
    expect(isSegmentUnlockedByDistance(byId("vertical-patrol-intro"), 9000)).toBe(true);
    expect(isSegmentUnlockedByDistance(byId("crusher-intro"), 10999)).toBe(false);
    expect(isSegmentUnlockedByDistance(byId("crusher-intro"), 11000)).toBe(true);
  });

  it("does not use score or elapsed time to unlock hazard segments", () => {
    const scoreTracker = new ScoreTracker(PLAYER_CONFIG.startX);
    for (let index = 0; index < 20; index += 1) {
      scoreTracker.collectCoin("risk");
    }

    expect(scoreTracker.getSnapshot().totalScore).toBeGreaterThan(5000);

    const picked = pickPlannedSegment(
      {
        generatedCount: 12,
        mapDistancePx: 2000,
        recent: []
      },
      () => 0.99
    );

    expect(picked.hazards.every((hazard) => hazard.kind === "spike")).toBe(true);
    expect(picked.coins.every((coin) => coin.type === "normal")).toBe(true);
  });

  it("places the first static trap around DIST 30-40", () => {
    const firstTrapSegment = pickPlannedSegment(
      {
        generatedCount: 0,
        mapDistancePx: START_SEGMENT.length - PLAYER_CONFIG.startX,
        recent: []
      },
      () => 0.99
    );
    const firstTrap = firstTrapSegment.hazards[0];
    const trapDistancePx = START_SEGMENT.length + firstTrap.x - PLAYER_CONFIG.startX;

    expect(firstTrapSegment.id).toBe("safe-runway");
    expect(firstTrap.kind).toBe("spike");
    expect(firstTrapSegment.hazards).toHaveLength(1);
    expect(firstTrapSegment.enemies ?? []).toHaveLength(0);
    expect(Math.floor(trapDistancePx / 32)).toBeGreaterThanOrEqual(30);
    expect(Math.floor(trapDistancePx / 32)).toBeLessThanOrEqual(40);
  });
});
