import { describe, expect, it } from "vitest";
import type { SegmentDefinition } from "../src/types/segments";
import { validateSegment } from "../src/utils/segmentValidator";

const validSegment: SegmentDefinition = {
  id: "valid",
  length: 640,
  difficulty: 1,
  weight: 1,
  pressure: "low",
  allowWallSprint: false,
  metadata: {},
  platforms: [
    { x: 0, y: 420, width: 220, height: 32, mainPath: true },
    { x: 340, y: 420, width: 220, height: 32, mainPath: true }
  ],
  hazards: [],
  coins: []
};

describe("validateSegment", () => {
  it("accepts a segment inside the movement envelope", () => {
    expect(validateSegment(validSegment).errors).toEqual([]);
  });

  it("rejects an oversized gap", () => {
    const invalid = {
      ...validSegment,
      id: "too-wide",
      platforms: [
        { x: 0, y: 420, width: 200, height: 32, mainPath: true },
        { x: 520, y: 420, width: 220, height: 32, mainPath: true }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/Gap/);
  });

  it("rejects a main-path landing that is too narrow", () => {
    const invalid = {
      ...validSegment,
      id: "narrow-landing",
      platforms: [
        { x: 0, y: 420, width: 220, height: 32, mainPath: true },
        { x: 340, y: 420, width: 48, height: 32, mainPath: true }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/Landing width/);
  });

  it("rejects wall sprint on consecutive pits", () => {
    const invalid = {
      ...validSegment,
      id: "bad-sprint",
      allowWallSprint: true,
      metadata: {
        consecutivePits: true
      }
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/Wall sprint/);
  });
});
