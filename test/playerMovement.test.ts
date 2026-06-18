import { describe, expect, it } from "vitest";
import { PLAYER_CONFIG } from "../src/config/playerConfig";
import { resolvePlayerTargetVelocityX } from "../src/systems/playerMovement";

describe("resolvePlayerTargetVelocityX", () => {
  it("does not move the player when no horizontal input is active", () => {
    expect(resolvePlayerTargetVelocityX({ left: false, right: false })).toBe(0);
    expect(resolvePlayerTargetVelocityX({ left: false, right: false })).toBe(
      PLAYER_CONFIG.idleSpeed
    );
  });

  it("moves only from explicit left or right input", () => {
    expect(resolvePlayerTargetVelocityX({ left: true, right: false })).toBe(
      PLAYER_CONFIG.reverseRunSpeed
    );
    expect(resolvePlayerTargetVelocityX({ left: false, right: true })).toBe(
      PLAYER_CONFIG.boostRunSpeed
    );
  });

  it("cancels horizontal intent when opposite directions are held together", () => {
    expect(resolvePlayerTargetVelocityX({ left: true, right: true })).toBe(
      PLAYER_CONFIG.idleSpeed
    );
  });
});
