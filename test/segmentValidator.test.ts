import { describe, expect, it } from "vitest";
import { SEGMENT_CATALOG, START_SEGMENT } from "../src/config/segments";
import type { SegmentDefinition } from "../src/types/segments";
import {
  assertValidSegments,
  validateSegment,
  validateSegmentTransition
} from "../src/utils/segmentValidator";

const validSegment: SegmentDefinition = {
  id: "valid",
  length: 640,
  difficulty: 1,
  weight: 1,
  pressure: "low",
  role: "gap",
  paceTier: "early",
  allowWallSprint: false,
  metadata: {},
  platforms: [
    { x: 0, y: 420, width: 220, height: 32, mainPath: true },
    { x: 340, y: 420, width: 300, height: 32, mainPath: true }
  ],
  hazards: [],
  coins: []
};

describe("validateSegment", () => {
  it("accepts the shipped segment catalog", () => {
    expect(() => assertValidSegments([START_SEGMENT, ...SEGMENT_CATALOG])).not.toThrow();
  });

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

  it("rejects a gap that only works with unsafe edge-perfect landings", () => {
    const invalid = {
      ...validSegment,
      id: "edge-perfect-gap",
      platforms: [
        { x: 0, y: 420, width: 200, height: 32, mainPath: true },
        { x: 395, y: 420, width: 220, height: 32, mainPath: true }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/practical reach/);
  });

  it("rejects upward gaps that only pass at theoretical full speed", () => {
    const invalid = {
      ...validSegment,
      id: "theoretical-upward-gap",
      platforms: [
        { x: 0, y: 420, width: 208, height: 32, mainPath: true },
        { x: 336, y: 372, width: 128, height: 32, mainPath: true },
        { x: 464, y: 420, width: 176, height: 32, mainPath: true }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/practical reach/);
  });

  it("rejects jumps with too little landing window after the gap", () => {
    const invalid = {
      ...validSegment,
      id: "short-landing-window",
      platforms: [
        { x: 0, y: 420, width: 220, height: 32, mainPath: true },
        { x: 340, y: 420, width: 96, height: 32, mainPath: true },
        { x: 436, y: 420, width: 204, height: 32, mainPath: true }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/Landing window/);
  });

  it("rejects adjacent upward steps that can block Arcade movement", () => {
    const invalid = {
      ...validSegment,
      id: "blocked-step",
      platforms: [
        { x: 0, y: 420, width: 220, height: 32, mainPath: true },
        { x: 220, y: 404, width: 220, height: 32, mainPath: true }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/Adjacent upward step/);
  });

  it("rejects platforms above the safe jump rise envelope", () => {
    const invalid = {
      ...validSegment,
      id: "too-high",
      platforms: [
        { x: 0, y: 420, width: 220, height: 32, mainPath: true },
        { x: 300, y: 320, width: 220, height: 32, mainPath: true }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/above safe rise/);
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

  it("rejects unsafe vertical steps between segment boundaries", () => {
    const first = {
      ...validSegment,
      id: "boundary-low",
      platforms: [
        { x: 0, y: 420, width: 640, height: 32, mainPath: true }
      ]
    };
    const second = {
      ...validSegment,
      id: "boundary-high",
      platforms: [
        { x: 0, y: 372, width: 640, height: 32, mainPath: true }
      ]
    };

    expect(validateSegmentTransition(first, second).errors.join(" ")).toMatch(
      /Adjacent upward step/
    );
    expect(() => assertValidSegments([first, second])).toThrow(/boundary-low->boundary-high/);
  });

  it("rejects intro segments with hazards or risk coins", () => {
    const invalid = {
      ...validSegment,
      id: "bad-intro",
      metadata: {
        introOrder: 0
      },
      hazards: [{ x: 240, y: 396, width: 48, height: 24, kind: "spike" as const }],
      coins: [{ x: 320, y: 336, type: "risk" as const }]
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).toMatch(/Intro segments cannot contain hazards/);
    expect(errors).toMatch(/Intro segments cannot require risk-coin routing/);
  });

  it("rejects recovery segments with fake or unsafe risk rewards", () => {
    const invalid = {
      ...validSegment,
      id: "bad-risk-line",
      coins: [{ x: 20, y: 360, type: "risk" as const }]
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).toMatch(/too close to the segment edge/);
    expect(errors).toMatch(/not anchored to a real risk line/);
  });
});
