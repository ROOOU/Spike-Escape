import { describe, expect, it } from "vitest";
import { progressionStageForDistance } from "../src/utils/progressionStage";

describe("progressionStageForDistance", () => {
  it("uses map distance thresholds for mechanic stage labels", () => {
    expect(progressionStageForDistance(0).key).toBe("warmup");
    expect(progressionStageForDistance(959).key).toBe("warmup");
    expect(progressionStageForDistance(960).key).toBe("early-traps");
    expect(progressionStageForDistance(1600).key).toBe("long-thorns");
    expect(progressionStageForDistance(3199).key).toBe("long-thorns");
    expect(progressionStageForDistance(3200).key).toBe("elevation");
    expect(progressionStageForDistance(5200).key).toBe("risk-routes");
    expect(progressionStageForDistance(6400).key).toBe("patrols");
    expect(progressionStageForDistance(7200).key).toBe("mud-vines");
    expect(progressionStageForDistance(9000).key).toBe("vertical-patrols");
    expect(progressionStageForDistance(10400).key).toBe("flame-rocks");
    expect(progressionStageForDistance(11000).key).toBe("crushers");
    expect(progressionStageForDistance(13000).key).toBe("climax-traps");
    expect(progressionStageForDistance(15000).key).toBe("gauntlet");
  });

  it("falls back to warmup for invalid or negative distances", () => {
    expect(progressionStageForDistance(-100).key).toBe("warmup");
    expect(progressionStageForDistance(Number.NaN).key).toBe("warmup");
  });
});
