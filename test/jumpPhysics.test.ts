import { describe, expect, it } from "vitest";
import {
  PLAYER_CONFIG,
  PLAYER_JUMP_PHYSICS,
  PLAYER_PHYSICS_DESIGN
} from "../src/config/playerConfig";
import {
  deriveJumpPhysics,
  flightTimeForVerticalDelta,
  horizontalReach
} from "../src/utils/jumpPhysics";

describe("locked jump physics", () => {
  it("derives runtime gravity and jump velocity from designer-facing targets", () => {
    const derived = deriveJumpPhysics(PLAYER_PHYSICS_DESIGN);

    expect(PLAYER_JUMP_PHYSICS).toEqual(derived);
    expect(PLAYER_CONFIG.jumpHeightPx).toBe(120);
    expect(PLAYER_CONFIG.shortHopHeightPx).toBe(48);
    expect(PLAYER_CONFIG.timeToApexSec).toBe(0.5);
    expect(PLAYER_CONFIG.gravity).toBeCloseTo(960, 2);
    expect(PLAYER_CONFIG.jumpVelocity).toBeCloseTo(480, 2);
    expect(PLAYER_CONFIG.shortHopVelocity).toBeCloseTo(303.58, 2);
    expect(PLAYER_CONFIG.sameHeightAirTimeSec).toBeCloseTo(1, 5);
    expect(PLAYER_CONFIG.shortHopSameHeightAirTimeSec).toBeCloseTo(0.632, 3);
  });

  it("keeps Phaser Arcade gravity single-sourced instead of double-applied", () => {
    expect(PLAYER_CONFIG.worldGravityY).toBe(0);
    expect(PLAYER_CONFIG.worldGravityY + PLAYER_CONFIG.gravity).toBeCloseTo(
      PLAYER_CONFIG.gravity,
      5
    );
  });

  it("computes vertical flight windows from the same values used at runtime", () => {
    expect(
      flightTimeForVerticalDelta(
        0,
        PLAYER_CONFIG.gravity,
        PLAYER_CONFIG.jumpVelocity
      )
    ).toBeCloseTo(PLAYER_CONFIG.sameHeightAirTimeSec, 5);

    expect(
      flightTimeForVerticalDelta(
        -PLAYER_CONFIG.jumpHeightPx,
        PLAYER_CONFIG.gravity,
        PLAYER_CONFIG.jumpVelocity
      )
    ).toBeCloseTo(PLAYER_CONFIG.timeToApexSec, 5);

    expect(
      flightTimeForVerticalDelta(
        -(PLAYER_CONFIG.jumpHeightPx + 1),
        PLAYER_CONFIG.gravity,
        PLAYER_CONFIG.jumpVelocity
      )
    ).toBeNull();
  });

  it("locks practical horizontal reach below theoretical full-speed reach", () => {
    const fullReach = horizontalReach(
      PLAYER_CONFIG.boostRunSpeed,
      PLAYER_CONFIG.sameHeightAirTimeSec
    );
    const practicalReach = horizontalReach(
      PLAYER_CONFIG.boostRunSpeed,
      PLAYER_CONFIG.sameHeightAirTimeSec,
      PLAYER_CONFIG.practicalJumpSpeedFactor
    );

    expect(fullReach).toBeCloseTo(300, 5);
    expect(practicalReach).toBeCloseTo(
      PLAYER_CONFIG.sameHeightPracticalReachPx,
      5
    );
    expect(practicalReach).toBeLessThan(fullReach);
  });

  it("keeps tap jumps visibly shorter than held jumps", () => {
    expect(
      PLAYER_CONFIG.jumpHeightPx - PLAYER_CONFIG.shortHopHeightPx
    ).toBeGreaterThanOrEqual(60);
  });
});
