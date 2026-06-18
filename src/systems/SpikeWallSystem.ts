import * as Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/playerConfig";
import { VIEWPORT } from "../config/gameConfig";
import { WALL_CONFIG } from "../config/wallConfig";
import {
  SpikeWallMachine,
  isWallCollision,
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
    consecutivePits: boolean
  ): WallUpdateResult {
    const state = this.machine.tick(deltaMs, {
      elapsedMs,
      allowSprint,
      consecutivePits,
      gapToPlayer: playerLeftX - this.frontX
    });

    const speed = this.machine.getSpeed(PLAYER_CONFIG.baseRunSpeed);
    this.frontX += speed * (deltaMs / 1000);
    this.wall.x = this.frontX - WALL_CONFIG.width;

    if (state === "warning") {
      this.wall.alpha = Math.floor(elapsedMs / 120) % 2 === 0 ? 0.85 : 1;
    } else {
      this.wall.alpha = 1;
    }

    this.wall.y = state === "sprint" ? Phaser.Math.Between(-2, 2) : 0;
    this.wall.tilePositionY += state === "sprint" ? 6 : 2;

    return {
      collided: isWallCollision(this.frontX, playerLeftX),
      state
    };
  }

  getState(): WallState {
    return this.machine.getState();
  }
}
