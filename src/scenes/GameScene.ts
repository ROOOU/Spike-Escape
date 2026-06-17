import Phaser from "phaser";
import { VIEWPORT, WORLD_CONFIG } from "../config/gameConfig";
import { PLAYER_CONFIG } from "../config/playerConfig";
import { SCORE_CONFIG } from "../config/scoreConfig";
import { InputController } from "../systems/InputController";
import { PlayerController } from "../systems/PlayerController";
import { ScoreTracker } from "../systems/scoreTracker";
import { SegmentManager } from "../systems/SegmentManager";
import { SpikeWallSystem } from "../systems/SpikeWallSystem";
import { HUD } from "../ui/HUD";
import { loadBestScore, saveBestScore } from "../utils/storage";

export class GameScene extends Phaser.Scene {
  private inputController!: InputController;
  private player!: PlayerController;
  private scoreTracker!: ScoreTracker;
  private segmentManager!: SegmentManager;
  private wallSystem!: SpikeWallSystem;
  private hud!: HUD;
  private bestScore = 0;
  private cameraAnchorX: number = PLAYER_CONFIG.startX;
  private runStartMs = 0;
  private ended = false;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.ended = false;
    this.runStartMs = this.time.now;
    this.cameraAnchorX = PLAYER_CONFIG.startX;
    this.bestScore = loadBestScore(SCORE_CONFIG.bestScoreStorageKey, window.localStorage);

    this.physics.world.setBounds(
      WORLD_CONFIG.worldBounds.x,
      WORLD_CONFIG.worldBounds.y,
      WORLD_CONFIG.worldBounds.width,
      WORLD_CONFIG.worldBounds.height
    );

    this.createBackdrop();

    this.player = new PlayerController(this);
    this.scoreTracker = new ScoreTracker(PLAYER_CONFIG.startX);
    this.segmentManager = new SegmentManager(this);
    this.segmentManager.initialize();
    this.segmentManager.attachRuntimeColliders(
      this.player.sprite,
      (type) => {
        const snapshot = this.scoreTracker.collectCoin(type);
        this.hud.update(snapshot, this.bestScore, this.wallSystem.getState());
      },
      (reason) => this.finishRun(reason)
    );

    this.wallSystem = new SpikeWallSystem(this);
    this.hud = new HUD(this);
    this.inputController = new InputController(
      this,
      document.getElementById("touch-controls")
    );

    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setScroll(0, 0);

    const initialSnapshot = this.scoreTracker.getSnapshot();
    this.hud.update(initialSnapshot, this.bestScore, this.wallSystem.getState());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.inputController.destroy();
    });
  }

  update(_time: number, deltaMs: number): void {
    if (this.ended) {
      return;
    }

    const elapsedMs = this.time.now - this.runStartMs;
    const input = this.inputController.poll();
    this.player.update(input, elapsedMs, deltaMs);

    const scoreSnapshot = this.scoreTracker.updateProgress(this.player.sprite.x);
    this.cameraAnchorX = Math.max(this.cameraAnchorX, this.player.sprite.x);
    this.segmentManager.update(this.cameraAnchorX, elapsedMs);

    const activeSegment = this.segmentManager.getActiveSegment(this.player.sprite.x);
    const wallResult = this.wallSystem.update(
      deltaMs,
      elapsedMs,
      this.player.getLeftX(),
      activeSegment.allowWallSprint,
      Boolean(activeSegment.metadata.consecutivePits)
    );

    if (wallResult.collided) {
      this.finishRun("The spike wall caught up");
      return;
    }

    if (this.player.sprite.y > WORLD_CONFIG.floorKillY) {
      this.finishRun("Fell into a pit");
      return;
    }

    this.cameras.main.scrollX = Math.max(
      0,
      this.cameraAnchorX - WORLD_CONFIG.cameraLead
    );
    this.hud.update(scoreSnapshot, this.bestScore, wallResult.state);
  }

  private finishRun(reason: string): void {
    if (this.ended) {
      return;
    }

    this.ended = true;
    const snapshot = this.scoreTracker.getSnapshot();
    this.bestScore = saveBestScore(
      snapshot.totalScore,
      SCORE_CONFIG.bestScoreStorageKey,
      window.localStorage
    );

    this.scene.pause();
    this.scene.launch("ResultScene", {
      score: snapshot.totalScore,
      distance: snapshot.distanceUnits,
      normalCoins: snapshot.normalCoins,
      riskCoins: snapshot.riskCoins,
      deathReason: reason,
      bestScore: this.bestScore
    });
  }

  private createBackdrop(): void {
    this.add.rectangle(
      0,
      0,
      WORLD_CONFIG.worldBounds.width,
      VIEWPORT.height,
      0x87d5ff
    ).setOrigin(0, 0);

    this.add
      .ellipse(760, 86, 180, 180, 0xfff4b8, 0.9)
      .setScrollFactor(0.05)
      .setDepth(1);

    this.add
      .rectangle(140, 470, 640, 180, 0x7aa0b5, 0.45)
      .setOrigin(0, 0)
      .setScrollFactor(0.15)
      .setDepth(2);
    this.add
      .rectangle(520, 430, 760, 210, 0x4f6f85, 0.35)
      .setOrigin(0, 0)
      .setScrollFactor(0.25)
      .setDepth(2);

    this.add
      .rectangle(0, 472, WORLD_CONFIG.worldBounds.width, 140, 0x44763d, 1)
      .setOrigin(0, 0)
      .setDepth(3);

    this.add
      .text(24, VIEWPORT.height - 34, "Risk coins pay more, but the wall never waits.", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "16px",
        color: "#13344d"
      })
      .setScrollFactor(0)
      .setDepth(5);
  }
}
