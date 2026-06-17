import { describe, expect, it } from "vitest";
import { ScoreTracker } from "../src/systems/scoreTracker";

describe("ScoreTracker", () => {
  it("uses furthest progress only", () => {
    const tracker = new ScoreTracker(100);

    tracker.updateProgress(196);
    const beforeBacktrack = tracker.getSnapshot();
    tracker.updateProgress(140);
    const afterBacktrack = tracker.getSnapshot();

    expect(beforeBacktrack.distanceUnits).toBe(3);
    expect(afterBacktrack.distanceUnits).toBe(3);
    expect(afterBacktrack.totalScore).toBe(beforeBacktrack.totalScore);
  });

  it("adds normal and risk coin values independently", () => {
    const tracker = new ScoreTracker(0);

    tracker.updateProgress(320);
    tracker.collectCoin("normal");
    tracker.collectCoin("risk");

    const snapshot = tracker.getSnapshot();
    expect(snapshot.distanceScore).toBe(100);
    expect(snapshot.coinScore).toBe(400);
    expect(snapshot.totalScore).toBe(500);
  });
});
