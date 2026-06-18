import { WALL_CONFIG } from "../config/wallConfig";

export type WallState = "normal" | "warning" | "sprint" | "recover";

export interface WallContext {
  elapsedMs: number;
  allowSprint: boolean;
  consecutivePits: boolean;
  gapToPlayer: number;
}

export function isWallCollision(wallFrontX: number, playerLeftX: number): boolean {
  return wallFrontX >= playerLeftX;
}

export class SpikeWallMachine {
  private state: WallState = "normal";
  private stateElapsedMs = 0;
  private cooldownRemainingMs = 0;

  tick(deltaMs: number, context: WallContext): WallState {
    this.stateElapsedMs += deltaMs;
    this.cooldownRemainingMs = Math.max(0, this.cooldownRemainingMs - deltaMs);

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
    switch (this.state) {
      case "warning":
        return baseAdvanceSpeed * WALL_CONFIG.chaseSpeedFactor;
      case "sprint":
        return baseAdvanceSpeed * WALL_CONFIG.sprintSpeedFactor;
      case "recover":
        return baseAdvanceSpeed * WALL_CONFIG.chaseSpeedFactor;
      case "normal":
      default:
        return baseAdvanceSpeed * WALL_CONFIG.normalSpeedFactor;
    }
  }

  private canTriggerSprint(context: WallContext): boolean {
    return (
      context.elapsedMs >= WALL_CONFIG.noSprintDurationMs &&
      context.allowSprint &&
      !context.consecutivePits &&
      context.gapToPlayer > WALL_CONFIG.dangerDistance &&
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
}
