import { describe, expect, it } from "vitest";
import {
  SpikeWallMachine,
  isWallCollision,
  resolveWallAdvance,
  type WallContext
} from "../src/systems/wallMachine";
import { WALL_CONFIG } from "../src/config/wallConfig";

describe("SpikeWallMachine", () => {
  function wallContext(overrides: Partial<WallContext> = {}): WallContext {
    return {
      elapsedMs: 6_000,
      allowSprint: false,
      consecutivePits: false,
      gapToPlayer: WALL_CONFIG.targetDistance,
      playerProgressDeltaPx: 0,
      ...overrides
    };
  }

  it("transitions through warning, sprint, recover, and cooldown", () => {
    const machine = new SpikeWallMachine();

    expect(
      machine.tick(16, wallContext({
        elapsedMs: 20_000,
        allowSprint: true,
        gapToPlayer: WALL_CONFIG.sprintLeadDistance
      }))
    ).toBe("normal");

    expect(
      machine.tick(16, wallContext({
        elapsedMs: 31_000,
        allowSprint: true,
        gapToPlayer: WALL_CONFIG.sprintLeadDistance
      }))
    ).toBe("warning");

    expect(
      machine.tick(1_000, wallContext({
        elapsedMs: 32_000,
        allowSprint: true,
        gapToPlayer: WALL_CONFIG.sprintLeadDistance
      }))
    ).toBe("sprint");

    expect(
      machine.tick(800, wallContext({
        elapsedMs: 32_800,
        allowSprint: true,
        gapToPlayer: WALL_CONFIG.sprintLeadDistance
      }))
    ).toBe("recover");

    expect(
      machine.tick(1_000, wallContext({
        elapsedMs: 33_800,
        allowSprint: true,
        gapToPlayer: WALL_CONFIG.sprintLeadDistance
      }))
    ).toBe("normal");

    expect(
      machine.tick(16, wallContext({
        elapsedMs: 40_000,
        allowSprint: true,
        gapToPlayer: WALL_CONFIG.sprintLeadDistance
      }))
    ).toBe("normal");
  });

  it("starts gently during opening grace", () => {
    const machine = new SpikeWallMachine();

    machine.tick(16, wallContext({ elapsedMs: 1_000 }));

    expect(machine.getSpeed(WALL_CONFIG.baseAdvanceSpeed)).toBe(
      WALL_CONFIG.baseAdvanceSpeed * WALL_CONFIG.openingGraceSpeedFactor
    );
  });

  it("builds pressure on stalls and backtracking, then recovers on forward progress", () => {
    const machine = new SpikeWallMachine();

    machine.tick(1_000, wallContext({ playerProgressDeltaPx: 0 }));
    const stalledSpeed = machine.getSpeed(WALL_CONFIG.baseAdvanceSpeed);

    machine.tick(1_000, wallContext({ playerProgressDeltaPx: -90 }));
    const backtrackingSpeed = machine.getSpeed(WALL_CONFIG.baseAdvanceSpeed);

    machine.tick(1_000, wallContext({ playerProgressDeltaPx: 260 }));
    const recoveredSpeed = machine.getSpeed(WALL_CONFIG.baseAdvanceSpeed);

    expect(stalledSpeed).toBeGreaterThan(
      WALL_CONFIG.baseAdvanceSpeed * WALL_CONFIG.normalSpeedFactor
    );
    expect(backtrackingSpeed).toBe(
      WALL_CONFIG.baseAdvanceSpeed * WALL_CONFIG.backtrackSpeedFactor
    );
    expect(recoveredSpeed).toBeLessThan(stalledSpeed);
    expect(recoveredSpeed).toBe(
      WALL_CONFIG.baseAdvanceSpeed * WALL_CONFIG.recoverSpeedFactor
    );
  });

  it("slows near danger distance and does not start a sprint there", () => {
    const machine = new SpikeWallMachine();

    expect(
      machine.tick(16, wallContext({
        elapsedMs: 31_000,
        allowSprint: true,
        gapToPlayer: WALL_CONFIG.dangerDistance
      }))
    ).toBe("normal");

    expect(machine.getSpeed(WALL_CONFIG.baseAdvanceSpeed)).toBe(
      WALL_CONFIG.baseAdvanceSpeed * WALL_CONFIG.nearDangerSpeedFactor
    );
  });

  it("caps opening movement so the wall cannot erase the starting buffer", () => {
    const advance = resolveWallAdvance(400, 1_000, {
      elapsedMs: 1_000,
      gapToPlayer: WALL_CONFIG.openingGraceMinGap + 5
    });

    expect(advance).toBe(5);
  });

  it("detects wall collision when the front edge reaches the player", () => {
    expect(isWallCollision(220, 220)).toBe(true);
    expect(isWallCollision(221, 220)).toBe(true);
    expect(isWallCollision(180, 220)).toBe(false);
  });
});
