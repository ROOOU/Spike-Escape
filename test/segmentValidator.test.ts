import { describe, expect, it } from "vitest";
import { PLAYER_CONFIG } from "../src/config/playerConfig";
import { SEGMENT_CATALOG, START_SEGMENT } from "../src/config/segments";
import type { SegmentDefinition } from "../src/types/segments";
import {
  assertValidSegments,
  validateSegment,
  validateSegmentTransition
} from "../src/utils/segmentValidator";

const baseMetadata: SegmentDefinition["metadata"] = {
  themeTag: "meadow",
  hazardBudget: 1,
  enemyBudget: 0,
  reactionDistancePx: 160,
  routeType: "main"
};

function segmentMetadata(
  overrides: Partial<SegmentDefinition["metadata"]> = {}
): SegmentDefinition["metadata"] {
  return {
    ...baseMetadata,
    ...overrides
  };
}

const validSegment: SegmentDefinition = {
  id: "valid",
  length: 640,
  difficulty: 1,
  weight: 1,
  pressure: "low",
  role: "gap",
  paceTier: "early",
  allowWallSprint: false,
  metadata: segmentMetadata(),
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

  it("rejects segments missing required difficulty metadata", () => {
    const invalid = {
      ...validSegment,
      id: "missing-difficulty-metadata",
      metadata: {} as SegmentDefinition["metadata"]
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).toMatch(/theme tag/);
    expect(errors).toMatch(/route type/);
    expect(errors).toMatch(/Hazard budget/);
    expect(errors).toMatch(/Enemy budget/);
    expect(errors).toMatch(/Reaction distance/);
  });

  it("rejects duplicate segment ids in catalog batches", () => {
    const first = {
      ...validSegment,
      id: "duplicate-id"
    };
    const second = {
      ...validSegment,
      id: "duplicate-id"
    };

    expect(() => assertValidSegments([first, second])).toThrow(
      /Duplicate segment id "duplicate-id"/
    );
  });

  it("rejects non-positive segment weights and geometry dimensions", () => {
    const invalid = {
      ...validSegment,
      id: "bad-dimensions",
      weight: 0,
      metadata: segmentMetadata({
        unlockDistancePx: 7200
      }),
      platforms: [
        { x: 0, y: 420, width: 640, height: 0, mainPath: true }
      ],
      hazards: [{ x: 240, y: 396, width: 0, height: 24, kind: "spike" as const }]
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).toMatch(/Segment weight/);
    expect(errors).toMatch(/Platform 0 must have positive finite size/);
    expect(errors).toMatch(/Hazard at 240 must have positive finite size/);
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
        { x: 360, y: 372, width: 128, height: 32, mainPath: true },
        { x: 488, y: 420, width: 152, height: 32, mainPath: true }
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
        { x: 300, y: 300, width: 340, height: 32, mainPath: true }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/above safe rise/);
  });

  it("keeps shipped upward jumps inside the locked safe-rise envelope", () => {
    const safeRise = PLAYER_CONFIG.jumpHeightPx * 0.9;
    const allSegments = [START_SEGMENT, ...SEGMENT_CATALOG];

    for (const segment of allSegments) {
      const mainPath = segment.platforms
        .filter((platform) => platform.mainPath)
        .sort((a, b) => a.x - b.x);

      for (let index = 0; index < mainPath.length - 1; index += 1) {
        const rise = Math.max(0, mainPath[index].y - mainPath[index + 1].y);
        expect(
          rise,
          `${segment.id} transition ${index} rises ${rise}px above safe ${safeRise}px.`
        ).toBeLessThanOrEqual(safeRise);
      }
    }
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
      metadata: segmentMetadata({
        consecutivePits: true
      })
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/Wall sprint/);
  });

  it("rejects wall sprint before its map-distance unlock", () => {
    const invalid = {
      ...validSegment,
      id: "early-sprint",
      allowWallSprint: true,
      metadata: segmentMetadata({
        unlockDistancePx: 3200
      })
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/Wall sprint segments/);
  });

  it("rejects advanced and high-pressure segments before progression floors", () => {
    const invalid = {
      ...validSegment,
      id: "early-advanced",
      difficulty: 3,
      pressure: "high" as const,
      paceTier: "late" as const,
      metadata: segmentMetadata({
        unlockDistancePx: 4800
      })
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).toMatch(/Difficulty 3 segments/);
    expect(errors).toMatch(/Late-tier segments/);
    expect(errors).toMatch(/High-pressure segments/);
  });

  it("rejects hazard families before their map-distance unlocks", () => {
    const invalid = {
      ...validSegment,
      id: "early-hazards",
      metadata: segmentMetadata({
        unlockDistancePx: 6000
      }),
      hazards: [
        {
          x: 360,
          y: 388,
          width: 32,
          height: 32,
          kind: "patrol-spike" as const,
          patrol: { axis: "x" as const, distance: 96, durationMs: 1400 }
        },
        {
          x: 500,
          y: 288,
          width: 64,
          height: 38,
          kind: "crusher" as const,
          crusher: {
            distance: 96,
            warningMs: 700,
            slamMs: 220,
            holdMs: 360,
            returnMs: 720
          }
        }
      ]
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).toMatch(/Patrol hazard/);
    expect(errors).toMatch(/Crusher/);
  });

  it("allows early static spike teaching but not early moving trap teaching", () => {
    const staticIntro = {
      ...validSegment,
      id: "early-static-spike",
      metadata: segmentMetadata({
        introOrder: 0,
        unlockDistancePx: 800
      }),
      hazards: [{ x: 300, y: 396, width: 48, height: 24, kind: "spike" as const }]
    };
    const movingIntro = {
      ...staticIntro,
      id: "early-moving-trap",
      hazards: [
        {
          x: 300,
          y: 388,
          width: 32,
          height: 32,
          kind: "patrol-spike" as const,
          patrol: { axis: "x" as const, distance: 80, durationMs: 1600 }
        }
      ]
    };

    expect(validateSegment(staticIntro).errors).toEqual([]);
    expect(validateSegment(movingIntro).errors.join(" ")).toMatch(
      /Intro segments can only teach static spike hazards/
    );
  });

  it("rejects risk coins before risk-route distance unlock", () => {
    const invalid = {
      ...validSegment,
      id: "early-risk-coin",
      metadata: segmentMetadata({
        unlockDistancePx: 4800
      }),
      coins: [{ x: 320, y: 360, type: "risk" as const }]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/Risk coin/);
  });

  it("rejects stompable enemies before their map-distance unlock", () => {
    const invalid = {
      ...validSegment,
      id: "early-enemy",
      metadata: segmentMetadata({
        unlockDistancePx: 2400
      }),
      enemies: [
        {
          x: 320,
          y: 390,
          width: 34,
          height: 30,
          kind: "stompable-ground" as const
        }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/Stompable enemies/);
  });

  it("rejects unreadable or out-of-bounds stompable enemies", () => {
    const invalid = {
      ...validSegment,
      id: "bad-enemy",
      metadata: segmentMetadata({
        unlockDistancePx: 3200
      }),
      enemies: [
        {
          x: 620,
          y: 390,
          width: 0,
          height: 30,
          kind: "stompable-ground" as const,
          patrol: { distance: 80, durationMs: 500, phaseMs: -1 },
          bounceVelocity: 0
        }
      ]
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).toMatch(/extends beyond segment length/);
    expect(errors).toMatch(/positive finite size/);
    expect(errors).toMatch(/patrols too fast/);
    expect(errors).toMatch(/non-negative finite phase/);
    expect(errors).toMatch(/positive finite bounce velocity/);
  });

  it("rejects unreadable or out-of-bounds mechanical traps", () => {
    const invalid = {
      ...validSegment,
      id: "bad-traps",
      hazards: [
        {
          x: 580,
          y: 388,
          width: 32,
          height: 32,
          kind: "patrol-spike" as const,
          patrol: { axis: "x" as const, distance: 96, durationMs: 500, phaseMs: -1 }
        },
        {
          x: 320,
          y: 288,
          width: 64,
          height: 38,
          kind: "crusher" as const,
          crusher: {
            distance: 0,
            warningMs: 300,
            slamMs: 220,
            holdMs: 360,
            returnMs: 720,
            phaseMs: -1
          }
        }
      ]
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).toMatch(/extends beyond segment length/);
    expect(errors).toMatch(/moves too fast/);
    expect(errors).toMatch(/positive finite movement and timing/);
    expect(errors).toMatch(/warning time/);
    expect(errors).toMatch(/non-negative finite phase/);
  });

  it("rejects segments that exceed authored danger budgets", () => {
    const invalid = {
      ...validSegment,
      id: "over-budget",
      metadata: segmentMetadata({
        unlockDistancePx: 15000,
        hazardBudget: 1,
        enemyBudget: 0,
        reactionDistancePx: 160
      }),
      hazards: [
        { x: 240, y: 396, width: 72, height: 24, kind: "spike-long" as const },
        {
          x: 420,
          y: 356,
          width: 64,
          height: 40,
          kind: "flame-vent" as const,
          timing: { warningMs: 700, activeMs: 600, inactiveMs: 1000 }
        }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/Hazard budget/);
  });

  it("rejects segments that exceed authored enemy budgets", () => {
    const invalid = {
      ...validSegment,
      id: "over-enemy-budget",
      metadata: segmentMetadata({
        unlockDistancePx: 15000,
        hazardBudget: 1,
        enemyBudget: 1,
        reactionDistancePx: 160
      }),
      enemies: [
        {
          x: 240,
          y: 390,
          width: 34,
          height: 30,
          kind: "stompable-ground" as const
        },
        {
          x: 420,
          y: 390,
          width: 34,
          height: 30,
          kind: "stomp-slime" as const
        }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/Enemy budget/);
  });

  it("rejects high-pressure main routes with too many primary dangers", () => {
    const invalid = {
      ...validSegment,
      id: "overloaded-high-pressure",
      pressure: "high" as const,
      metadata: segmentMetadata({
        unlockDistancePx: 15000,
        hazardBudget: 4,
        enemyBudget: 0,
        reactionDistancePx: 160
      }),
      hazards: [
        { x: 220, y: 396, width: 40, height: 24, kind: "spike" as const },
        { x: 320, y: 396, width: 40, height: 24, kind: "spike" as const },
        { x: 420, y: 396, width: 40, height: 24, kind: "spike" as const }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(
      /High-pressure main route/
    );
  });

  it("rejects dangers before the configured reaction distance", () => {
    const invalid = {
      ...validSegment,
      id: "too-soon-danger",
      metadata: segmentMetadata({
        unlockDistancePx: 7200,
        hazardBudget: 2,
        enemyBudget: 0,
        reactionDistancePx: 220
      }),
      hazards: [
        {
          x: 160,
          y: 356,
          width: 32,
          height: 64,
          kind: "thorn-vine" as const,
          timing: { warningMs: 700, activeMs: 600, inactiveMs: 1000 }
        }
      ]
    };

    expect(validateSegment(invalid).errors.join(" ")).toMatch(/reaction distance/);
  });

  it("uses map-distance gates for v1.5 soft and timed traps", () => {
    const invalid = {
      ...validSegment,
      id: "early-v15-traps",
      metadata: segmentMetadata({
        unlockDistancePx: 6000,
        hazardBudget: 6,
        enemyBudget: 0,
        reactionDistancePx: 160
      }),
      hazards: [
        {
          x: 240,
          y: 406,
          width: 96,
          height: 18,
          kind: "mud-pit" as const,
          soft: { speedFactor: 0.62, durationMs: 360 }
        },
        {
          x: 420,
          y: 356,
          width: 32,
          height: 64,
          kind: "thorn-vine" as const,
          timing: { warningMs: 700, activeMs: 600, inactiveMs: 1000 }
        },
        {
          x: 520,
          y: 400,
          width: 80,
          height: 20,
          kind: "crumbling-platform" as const
        }
      ]
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).toMatch(/Mud pit/);
    expect(errors).toMatch(/thorn-vine/);
    expect(errors).toMatch(/Crumbling platform/);
  });

  it("rejects powerup requirements on the main route", () => {
    const invalid = {
      ...validSegment,
      id: "main-route-powerup",
      platforms: [
        {
          x: 0,
          y: 420,
          width: 220,
          height: 32,
          mainPath: true,
          routeType: "requiresPowerup" as const,
          requiredCapability: "bubble-shield" as const
        },
        { x: 340, y: 420, width: 300, height: 32, mainPath: true }
      ],
      coins: [
        {
          x: 380,
          y: 360,
          type: "normal" as const,
          requiredCapability: "magnet" as const
        }
      ]
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).toMatch(/main path behind a powerup/);
    expect(errors).toMatch(/main path cannot require a powerup/);
    expect(errors).toMatch(/Coin at 380 cannot require a powerup on the main route/);
  });

  it("requires powerup reward routes to declare capabilities", () => {
    const invalid = {
      ...validSegment,
      id: "missing-capability",
      metadata: segmentMetadata({
        unlockDistancePx: 7200,
        hazardBudget: 2,
        enemyBudget: 0
      }),
      platforms: [
        ...validSegment.platforms,
        {
          x: 276,
          y: 388,
          width: 96,
          height: 24,
          routeType: "requiresPowerup" as const
        }
      ],
      hazards: [
        {
          x: 300,
          y: 396,
          width: 48,
          height: 24,
          kind: "spike" as const,
          routeType: "requiresPowerup" as const
        }
      ],
      pickups: [
        {
          x: 316,
          y: 350,
          kind: "bubble-shield" as const,
          routeType: "requiresPowerup" as const
        }
      ]
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).toMatch(/Platform 2 requiresPowerup route/);
    expect(errors).toMatch(/Hazard at 300 requiresPowerup route/);
    expect(errors).toMatch(/Pickup at 316 requiresPowerup route/);
  });

  it("accepts declared powerup reward routes that can rejoin the main path", () => {
    const segment = {
      ...validSegment,
      id: "declared-powerup-reward",
      metadata: segmentMetadata({
        unlockDistancePx: 7200,
        hazardBudget: 1,
        enemyBudget: 0
      }),
      platforms: [
        ...validSegment.platforms,
        {
          x: 276,
          y: 388,
          width: 96,
          height: 24,
          routeType: "requiresPowerup" as const,
          requiredCapability: "bubble-shield" as const
        }
      ],
      coins: [
        {
          x: 320,
          y: 360,
          type: "normal" as const,
          routeType: "requiresPowerup" as const,
          requiredCapability: "bubble-shield" as const
        }
      ]
    };

    expect(validateSegment(segment).errors).toEqual([]);
  });

  it("allows risk rewards to be anchored to enemy pressure", () => {
    const segment = {
      ...validSegment,
      id: "enemy-risk-anchor",
      metadata: segmentMetadata({
        unlockDistancePx: 13600,
        hazardBudget: 1,
        enemyBudget: 2,
        reactionDistancePx: 220
      }),
      enemies: [
        {
          x: 430,
          y: 378,
          width: 38,
          height: 42,
          kind: "flower-turret" as const
        }
      ],
      coins: [{ x: 454, y: 326, type: "risk" as const, routeType: "optional" as const }]
    };

    expect(validateSegment(segment).errors.filter((error) => error.startsWith("Risk coin"))).toEqual([]);
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
      metadata: segmentMetadata({
        introOrder: 0
      }),
      hazards: [{ x: 240, y: 396, width: 48, height: 24, kind: "spike" as const }],
      coins: [{ x: 320, y: 336, type: "risk" as const }]
    };

    const errors = validateSegment(invalid).errors.join(" ");
    expect(errors).not.toMatch(/Intro segments can only teach static spike hazards/);
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

  it("keeps shipped risk coins anchored to readable branches", () => {
    const riskSegments = [START_SEGMENT, ...SEGMENT_CATALOG].filter((segment) =>
      segment.coins.some((coin) => coin.type === "risk")
    );

    expect(riskSegments.length).toBeGreaterThan(0);

    for (const segment of riskSegments) {
      const riskErrors = validateSegment(segment).errors.filter((error) =>
        error.startsWith("Risk coin")
      );

      expect(riskErrors, `${segment.id} has unreadable risk routing.`).toEqual([]);
    }
  });
});
