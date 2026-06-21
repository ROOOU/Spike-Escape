import * as Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/playerConfig";
import { VIEWPORT } from "../config/gameConfig";
import { WALL_CONFIG } from "../config/wallConfig";
import {
  SpikeWallMachine,
  isWallCollision,
  resolveWallAdvance,
  type WallState
} from "./wallMachine";

export interface WallUpdateResult {
  collided: boolean;
  state: WallState;
}

export class SpikeWallSystem {
  private readonly machine = new SpikeWallMachine();
  private readonly wall: Phaser.GameObjects.TileSprite;
  private frontX = PLAYER_CONFIG.startX - WALL_CONFIG.initialOffset;
  private lastPlayerLeftX?: number;

  constructor(scene: Phaser.Scene) {
    this.wall = scene.add
      .tileSprite(
        this.frontX - WALL_CONFIG.width,
        0,
        WALL_CONFIG.width,
        VIEWPORT.height,
        "wall"
      )
      .setOrigin(0, 0)
      .setDepth(18);
  }

  update(
    deltaMs: number,
    elapsedMs: number,
    playerLeftX: number,
    allowSprint: boolean,
    consecutivePits: boolean,
    timeScale = 1
  ): WallUpdateResult {
    const safeTimeScale = Phaser.Math.Clamp(timeScale, 0.25, 1);
    const scaledDeltaMs = deltaMs * safeTimeScale;
    const gapToPlayer = playerLeftX - this.frontX;
    const playerProgressDeltaPx =
      this.lastPlayerLeftX === undefined
        ? 0
        : playerLeftX - this.lastPlayerLeftX;
    this.lastPlayerLeftX = playerLeftX;

    const state = this.machine.tick(scaledDeltaMs, {
      elapsedMs,
      allowSprint,
      consecutivePits,
      gapToPlayer,
      playerProgressDeltaPx
    });

    const speed = this.machine.getSpeed(WALL_CONFIG.baseAdvanceSpeed);
    this.frontX += resolveWallAdvance(speed, scaledDeltaMs, {
      elapsedMs,
      gapToPlayer
    });
    this.wall.x = this.frontX - WALL_CONFIG.width;

    if (state === "warning") {
      this.wall.alpha = Math.floor(elapsedMs / 120) % 2 === 0 ? 0.85 : 1;
    } else {
      this.wall.alpha = 1;
    }

    this.wall.y = state === "sprint" ? Phaser.Math.Between(-2, 2) : 0;
    this.wall.tilePositionY += (state === "sprint" ? 6 : 2) * safeTimeScale;

    return {
      collided: isWallCollision(this.frontX, playerLeftX),
      state
    };
  }

  getState(): WallState {
    return this.machine.getState();
  }
}
