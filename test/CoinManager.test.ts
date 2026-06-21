import { describe, expect, it } from "vitest";
import { resolveMagnetStep } from "../src/systems/CoinManager";

describe("resolveMagnetStep", () => {
  it("pulls coins toward the player inside the magnet radius", () => {
    const next = resolveMagnetStep({
      coinX: 0,
      coinY: 0,
      targetX: 100,
      targetY: 0,
      deltaMs: 100,
      radiusPx: 170,
      speedPxPerSecond: 430
    });

    expect(next.pulled).toBe(true);
    expect(next.x).toBeCloseTo(43);
    expect(next.y).toBe(0);
  });

  it("does not pull coins outside the magnet radius", () => {
    const next = resolveMagnetStep({
      coinX: 0,
      coinY: 0,
      targetX: 220,
      targetY: 0,
      deltaMs: 100,
      radiusPx: 170,
      speedPxPerSecond: 430
    });

    expect(next).toEqual({
      x: 0,
      y: 0,
      pulled: false
    });
  });

  it("snaps to the player without overshooting", () => {
    const next = resolveMagnetStep({
      coinX: 0,
      coinY: 0,
      targetX: 20,
      targetY: 0,
      deltaMs: 100,
      radiusPx: 170,
      speedPxPerSecond: 430
    });

    expect(next).toEqual({
      x: 20,
      y: 0,
      pulled: true
    });
  });
});
