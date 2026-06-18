import { describe, expect, it } from "vitest";
import { SpikeWallMachine, isWallCollision } from "../src/systems/wallMachine";
import { WALL_CONFIG } from "../src/config/wallConfig";

describe("SpikeWallMachine", () => {
  it("transitions through warning, sprint, recover, and cooldown", () => {
    const machine = new SpikeWallMachine();

    expect(
      machine.tick(16, {
        elapsedMs: 20_000,
        allowSprint: true,
        consecutivePits: false,
        gapToPlayer: 400
      })
    ).toBe("normal");

    expect(
      machine.tick(16, {
        elapsedMs: 31_000,
        allowSprint: true,
        consecutivePits: false,
        gapToPlayer: 400
      })
    ).toBe("warning");

    expect(
      machine.tick(1_000, {
        elapsedMs: 32_000,
        allowSprint: true,
        consecutivePits: false,
        gapToPlayer: 400
      })
    ).toBe("sprint");

    expect(
      machine.tick(800, {
        elapsedMs: 32_800,
        allowSprint: true,
        consecutivePits: false,
        gapToPlayer: 400
      })
    ).toBe("recover");

    expect(
      machine.tick(1_000, {
        elapsedMs: 33_800,
        allowSprint: true,
        consecutivePits: false,
        gapToPlayer: 400
      })
    ).toBe("normal");

    expect(
      machine.tick(16, {
        elapsedMs: 40_000,
        allowSprint: true,
        consecutivePits: false,
        gapToPlayer: 400
      })
    ).toBe("normal");
  });

  it("uses the expected speed factors", () => {
    const machine = new SpikeWallMachine();

    const initialSpeed = machine.getSpeed(WALL_CONFIG.baseAdvanceSpeed);
    expect(initialSpeed).toBe(
      WALL_CONFIG.baseAdvanceSpeed * WALL_CONFIG.normalSpeedFactor
    );
  });

  it("detects wall collision when the front edge reaches the player", () => {
    expect(isWallCollision(220, 220)).toBe(true);
    expect(isWallCollision(221, 220)).toBe(true);
    expect(isWallCollision(180, 220)).toBe(false);
  });
});
