import { WALL_CONFIG } from "../config/wallConfig";

export type WallState = "normal" | "warning" | "sprint" | "recover";

export interface WallContext {
  elapsedMs: number;
  allowSprint: boolean;
  consecutivePits: boolean;
  gapToPlayer: number;
  playerProgressDeltaPx?: number;
}

export interface WallAdvanceContext {
  elapsedMs: number;
  gapToPlayer: number;
}

export function isWallCollision(wallFrontX: number, playerLeftX: number): boolean {
  return wallFrontX >= playerLeftX;
}

export function resolveWallAdvance(
  speedPxPerSecond: number,
  deltaMs: number,
  context: WallAdvanceContext
): number {
  const movementDeltaMs = Math.min(
    Math.max(0, deltaMs),
    WALL_CONFIG.maxAdvanceStepMs
  );
  const desiredAdvance = speedPxPerSecond * (movementDeltaMs / 1000);

  if (context.elapsedMs < WALL_CONFIG.openingGraceDurationMs) {
    return Math.min(
      desiredAdvance,
      Math.max(0, context.gapToPlayer - WALL_CONFIG.openingGraceMinGap)
    );
  }

  return desiredAdvance;
}

export class SpikeWallMachine {
  private state: WallState = "normal";
  private stateElapsedMs = 0;
  private cooldownRemainingMs = 0;
  private pressure: number = 0;
  private speedFactor: number = WALL_CONFIG.openingGraceSpeedFactor;
  private lastProgressSpeedPxPerSecond: number = 0;

  tick(deltaMs: number, context: WallContext): WallState {
    const safeDeltaMs = Math.max(0, deltaMs);
    this.stateElapsedMs += safeDeltaMs;
    this.cooldownRemainingMs = Math.max(
      0,
      this.cooldownRemainingMs - safeDeltaMs
    );

    this.updatePressure(safeDeltaMs, context);
    this.speedFactor = this.resolveSpeedFactor(context);

    if (
      (this.state === "warning" || this.state === "sprint") &&
      context.gapToPlayer <= WALL_CONFIG.dangerDistance
    ) {
      this.transition("recover");
    }

    switch (this.state) {
      case "normal":
        if (this.canTriggerSprint(context)) {
          this.transition("warning");
        }
        break;
      case "warning":
        if (this.stateElapsedMs >= WALL_CONFIG.warningDurationMs) {
          this.transition("sprint");
        }
        break;
      case "sprint":
        if (this.stateElapsedMs >= WALL_CONFIG.sprintDurationMs) {
          this.transition("recover");
        }
        break;
      case "recover":
        if (this.stateElapsedMs >= WALL_CONFIG.recoverDurationMs) {
          this.transition("normal");
        }
        break;
    }

    return this.state;
  }

  getState(): WallState {
    return this.state;
  }

  getSpeed(baseAdvanceSpeed: number): number {
    let factor = this.speedFactor;

    switch (this.state) {
      case "warning":
        factor = Math.max(factor, WALL_CONFIG.chaseSpeedFactor);
        break;
      case "sprint":
        factor = Math.max(factor, WALL_CONFIG.sprintSpeedFactor);
        break;
      case "recover":
        factor = Math.min(factor, WALL_CONFIG.recoverSpeedFactor);
        break;
      case "normal":
      default:
        break;
    }

    return baseAdvanceSpeed * factor;
  }

  private canTriggerSprint(context: WallContext): boolean {
    return (
      context.elapsedMs >= WALL_CONFIG.noSprintDurationMs &&
      context.allowSprint &&
      !context.consecutivePits &&
      context.gapToPlayer >= WALL_CONFIG.sprintStartDistance &&
      (this.pressure >= WALL_CONFIG.sprintPressureThreshold ||
        context.gapToPlayer >= WALL_CONFIG.sprintLeadDistance) &&
      this.cooldownRemainingMs === 0
    );
  }

  private transition(nextState: WallState): void {
    this.state = nextState;
    this.stateElapsedMs = 0;

    if (nextState === "normal") {
      this.cooldownRemainingMs = WALL_CONFIG.cooldownMs;
    }
  }

  private updatePressure(deltaMs: number, context: WallContext): void {
    const deltaSeconds = deltaMs / 1000;
    if (deltaSeconds <= 0) {
      return;
    }

    this.lastProgressSpeedPxPerSecond =
      (context.playerProgressDeltaPx ?? 0) / deltaSeconds;

    if (
      context.elapsedMs < WALL_CONFIG.openingGraceDurationMs ||
      context.gapToPlayer <= WALL_CONFIG.dangerDistance
    ) {
      this.pressure = clamp01(
        this.pressure -
          WALL_CONFIG.dangerRecoveryPerSecond * deltaSeconds
      );
      return;
    }

    if (
      this.lastProgressSpeedPxPerSecond <= WALL_CONFIG.backtrackSpeedThreshold
    ) {
      this.pressure = clamp01(
        this.pressure +
          WALL_CONFIG.backtrackPressurePerSecond * deltaSeconds
      );
    } else if (
      this.lastProgressSpeedPxPerSecond < WALL_CONFIG.forwardProgressSpeed
    ) {
      const stallWeight =
        1 -
        Math.max(0, this.lastProgressSpeedPxPerSecond) /
          WALL_CONFIG.forwardProgressSpeed;
      this.pressure = clamp01(
        this.pressure +
          WALL_CONFIG.stallPressurePerSecond * stallWeight * deltaSeconds
      );
    } else {
      const recoveryWeight = clamp01(
        (this.lastProgressSpeedPxPerSecond -
          WALL_CONFIG.forwardProgressSpeed) /
          (WALL_CONFIG.strongForwardProgressSpeed -
            WALL_CONFIG.forwardProgressSpeed)
      );
      this.pressure = clamp01(
        this.pressure -
          WALL_CONFIG.progressRecoveryPerSecond *
            Math.max(0.35, recoveryWeight) *
            deltaSeconds
      );
    }

    if (context.gapToPlayer > WALL_CONFIG.targetDistance) {
      const longGapWeight = clamp01(
        (context.gapToPlayer - WALL_CONFIG.targetDistance) /
          (WALL_CONFIG.longGapDistance - WALL_CONFIG.targetDistance)
      );
      this.pressure = clamp01(
        this.pressure +
          WALL_CONFIG.longGapPressurePerSecond * longGapWeight * deltaSeconds
      );
    }
  }

  private resolveSpeedFactor(context: WallContext): number {
    if (context.elapsedMs < WALL_CONFIG.openingGraceDurationMs) {
      return WALL_CONFIG.openingGraceSpeedFactor;
    }

    if (context.gapToPlayer <= WALL_CONFIG.dangerDistance) {
      return WALL_CONFIG.nearDangerSpeedFactor;
    }

    let factor = lerp(
      WALL_CONFIG.normalSpeedFactor,
      WALL_CONFIG.stallSpeedFactor,
      this.pressure
    );

    if (
      this.lastProgressSpeedPxPerSecond <= WALL_CONFIG.backtrackSpeedThreshold
    ) {
      factor = Math.max(factor, WALL_CONFIG.backtrackSpeedFactor);
    }

    if (context.gapToPlayer > WALL_CONFIG.targetDistance) {
      const longGapWeight = clamp01(
        (context.gapToPlayer - WALL_CONFIG.targetDistance) /
          (WALL_CONFIG.longGapDistance - WALL_CONFIG.targetDistance)
      );
      factor = Math.max(
        factor,
        lerp(
          WALL_CONFIG.normalSpeedFactor,
          WALL_CONFIG.longGapSpeedFactor,
          longGapWeight
        )
      );
    }

    const forwardRecoveryWeight = clamp01(
      (this.lastProgressSpeedPxPerSecond -
        WALL_CONFIG.forwardProgressSpeed) /
        (WALL_CONFIG.strongForwardProgressSpeed -
          WALL_CONFIG.forwardProgressSpeed)
    );
    if (forwardRecoveryWeight > 0) {
      factor = lerp(
        factor,
        WALL_CONFIG.recoverSpeedFactor,
        forwardRecoveryWeight
      );
    }

    if (context.gapToPlayer > WALL_CONFIG.longGapDistance) {
      factor = Math.max(factor, WALL_CONFIG.longGapSpeedFactor);
    }

    if (context.gapToPlayer < WALL_CONFIG.safeDistance) {
      const safeGapWeight = clamp01(
        (context.gapToPlayer - WALL_CONFIG.dangerDistance) /
          (WALL_CONFIG.safeDistance - WALL_CONFIG.dangerDistance)
      );
      factor = lerp(
        WALL_CONFIG.nearDangerSpeedFactor,
        factor,
        safeGapWeight
      );
    }

    return clamp(
      factor,
      WALL_CONFIG.nearDangerSpeedFactor,
      WALL_CONFIG.backtrackSpeedFactor
    );
  }
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}
