import { describe, expect, it } from "vitest";
import {
  resolveEnemyContact,
  resolveEnemyPatrolOffset,
  type EnemyBounds
} from "../src/systems/EnemyManager";

const enemy: EnemyBounds = {
  left: 100,
  right: 132,
  top: 388,
  bottom: 420
};

describe("resolveEnemyContact", () => {
  it("stomps when the player descends onto the enemy top", () => {
    expect(
      resolveEnemyContact({
        player: {
          left: 106,
          right: 126,
          top: 356,
          bottom: 398
        },
        enemy,
        playerVelocityY: 260,
        previousPlayerBottom: 384
      })
    ).toBe("stomp");
  });

  it("still stomps with a slightly deeper low-frame overlap from above", () => {
    expect(
      resolveEnemyContact({
        player: {
          left: 106,
          right: 126,
          top: 370,
          bottom: 412
        },
        enemy,
        playerVelocityY: 320,
        previousPlayerBottom: 399
      })
    ).toBe("stomp");
  });

  it("kills the player on side contact while falling", () => {
    expect(
      resolveEnemyContact({
        player: {
          left: 72,
          right: 110,
          top: 376,
          bottom: 416
        },
        enemy,
        playerVelocityY: 260,
        previousPlayerBottom: 408
      })
    ).toBe("deadly");
  });

  it("kills the player when hitting an enemy from below", () => {
    expect(
      resolveEnemyContact({
        player: {
          left: 106,
          right: 126,
          top: 406,
          bottom: 446
        },
        enemy,
        playerVelocityY: -220,
        previousPlayerBottom: 452
      })
    ).toBe("deadly");
  });
});

describe("resolveEnemyPatrolOffset", () => {
  it("uses a back-and-forth lane wave", () => {
    const patrol = { distance: 80, durationMs: 2000 };

    expect(resolveEnemyPatrolOffset(0, patrol)).toBe(0);
    expect(resolveEnemyPatrolOffset(500, patrol)).toBe(40);
    expect(resolveEnemyPatrolOffset(1000, patrol)).toBe(80);
    expect(resolveEnemyPatrolOffset(2000, patrol)).toBe(0);
  });

  it("applies patrol phase offsets", () => {
    expect(
      resolveEnemyPatrolOffset(0, {
        distance: 80,
        durationMs: 2000,
        phaseMs: 1000
      })
    ).toBe(80);
  });
});
