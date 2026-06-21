import { describe, expect, it } from "vitest";
import { PLAYER_CONFIG } from "../src/config/playerConfig";
import { resolveVariableJumpVelocityY } from "../src/systems/playerJump";

describe("resolveVariableJumpVelocityY", () => {
  it("cuts upward velocity when jump is released early", () => {
    expect(
      resolveVariableJumpVelocityY({
        velocityY: -PLAYER_CONFIG.jumpVelocity,
        jumpHeld: false,
        wasJumpHeld: true,
        shortHopVelocity: PLAYER_CONFIG.shortHopVelocity
      })
    ).toBeCloseTo(-PLAYER_CONFIG.shortHopVelocity, 5);
  });

  it("keeps full jump velocity while jump is held", () => {
    expect(
      resolveVariableJumpVelocityY({
        velocityY: -PLAYER_CONFIG.jumpVelocity,
        jumpHeld: true,
        wasJumpHeld: true,
        shortHopVelocity: PLAYER_CONFIG.shortHopVelocity
      })
    ).toBeCloseTo(-PLAYER_CONFIG.jumpVelocity, 5);
  });

  it("does not push the player downward near apex or while falling", () => {
    expect(
      resolveVariableJumpVelocityY({
        velocityY: -120,
        jumpHeld: false,
        wasJumpHeld: true,
        shortHopVelocity: PLAYER_CONFIG.shortHopVelocity
      })
    ).toBe(-120);

    expect(
      resolveVariableJumpVelocityY({
        velocityY: 180,
        jumpHeld: false,
        wasJumpHeld: true,
        shortHopVelocity: PLAYER_CONFIG.shortHopVelocity
      })
    ).toBe(180);
  });
});
