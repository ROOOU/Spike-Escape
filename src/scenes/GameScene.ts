import * as Phaser from "phaser";
import { VIEWPORT, WORLD_CONFIG } from "../config/gameConfig";
import { PLAYER_CONFIG } from "../config/playerConfig";
import { SCORE_CONFIG } from "../config/scoreConfig";
import { InputController } from "../systems/InputController";
import { PlayerController } from "../systems/PlayerController";
import { ScoreTracker, type ScoreSnapshot } from "../systems/scoreTracker";
import { SegmentManager } from "../systems/SegmentManager";
import { SpikeWallSystem } from "../systems/SpikeWallSystem";
import { HUD } from "../ui/HUD";
import { loadBestScore, saveBestScore } from "../utils/storage";
import type { WallState } from "../systems/wallMachine";

const READY_START_CODES = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "KeyA",
  "KeyD",
  "KeyW",
  "Space"
]);
const READY_START_KEYS = new Set([" ", "Spacebar"]);

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
  private lastSegmentId = "";
  private lastChapterBannerAtMs = Number.NEGATIVE_INFINITY;
  private lastWallState: WallState = "normal";
  private lastProgressBand = -1;
  private lastScoreTotal = 0;
  private lastDistanceUnits = 0;
  private lastBeatLabel = "SETUP";
  private lastChapterLabel = "RUN 01";
  private waitingToStart = true;
  private readyPrompt?: Phaser.GameObjects.Container;
  private readonly handleReadyKeyDown = (event: KeyboardEvent): void => {
    if (
      this.waitingToStart &&
      !this.ended &&
      (READY_START_CODES.has(event.code) || READY_START_KEYS.has(event.key))
    ) {
      event.preventDefault();
      this.startRun();
    }
  };

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.ended = false;
    this.waitingToStart = true;
    this.runStartMs = this.time.now;
    this.cameraAnchorX = PLAYER_CONFIG.startX;
    this.lastSegmentId = "";
    this.lastChapterBannerAtMs = Number.NEGATIVE_INFINITY;
    this.lastWallState = "normal";
    this.lastProgressBand = -1;
    this.lastScoreTotal = 0;
    this.lastDistanceUnits = 0;
    this.lastBeatLabel = "SETUP";
    this.lastChapterLabel = "RUN 01";
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
    this.hud.setChapterProgress("RUN 01", "SETUP · START RUNWAY");
    this.hud.showPulse("RUN 01", "Start clean. Build rhythm.", 0x54d55c, 1800);
    this.inputController = new InputController(
      this,
      document.getElementById("touch-controls")
    );

    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setScroll(0, 0);

    const initialSnapshot = this.scoreTracker.getSnapshot();
    this.hud.update(initialSnapshot, this.bestScore, this.wallSystem.getState());
    this.lastScoreTotal = initialSnapshot.totalScore;
    this.lastDistanceUnits = initialSnapshot.distanceUnits;
    this.showReadyPrompt();
    this.input.once("pointerdown", () => this.startRun());
    window.addEventListener("keydown", this.handleReadyKeyDown, { passive: false });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("keydown", this.handleReadyKeyDown);
      this.readyPrompt?.destroy();
      this.readyPrompt = undefined;
      this.inputController.destroy();
    });
  }

  update(_time: number, deltaMs: number): void {
    if (this.ended) {
      return;
    }

    const input = this.inputController.poll();
    if (this.waitingToStart) {
      if (input.left || input.right || input.jumpPressed) {
        this.startRun();
      } else {
        return;
      }
    }

    const elapsedMs = this.time.now - this.runStartMs;
    this.player.update(input, elapsedMs, deltaMs);

    const scoreSnapshot = this.scoreTracker.updateProgress(this.player.sprite.x);
    this.cameraAnchorX = Math.max(this.cameraAnchorX, this.player.sprite.x);
    this.segmentManager.update(this.cameraAnchorX, elapsedMs);

    this.updateScoreFeedback(scoreSnapshot);

    const activeSegment = this.segmentManager.getActiveSegment(this.player.sprite.x);
    this.updateChapterState(activeSegment.id, activeSegment.length, activeSegment.metadata.notes?.[0], activeSegment.metadata.pacingBeat ?? "build", elapsedMs);
    const wallResult = this.wallSystem.update(
      deltaMs,
      elapsedMs,
      this.player.getLeftX(),
      activeSegment.allowWallSprint,
      Boolean(activeSegment.metadata.consecutivePits)
    );

    this.updateWallFeedback(wallResult.state);

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
      bestScore: this.bestScore,
      beatLabel: this.lastBeatLabel,
      chapterLabel: this.lastChapterLabel
    });
  }

  private startRun(): void {
    if (!this.waitingToStart || this.ended) {
      return;
    }

    this.waitingToStart = false;
    this.runStartMs = this.time.now;
    window.removeEventListener("keydown", this.handleReadyKeyDown);
    this.readyPrompt?.destroy();
    this.readyPrompt = undefined;
    this.hud.showPulse("RUN 01", "Start clean. Build rhythm.", 0x54d55c, 1200);
  }

  private updateScoreFeedback(snapshot: ScoreSnapshot): void {
    if (snapshot.totalScore > this.lastScoreTotal) {
      const gained = snapshot.totalScore - this.lastScoreTotal;
      if (snapshot.distanceUnits > this.lastDistanceUnits) {
        this.hud.showPulse("RHYTHM", `Distance +${snapshot.distanceUnits - this.lastDistanceUnits}`, 0x54d55c, 900);
      } else if (gained >= SCORE_CONFIG.riskCoinValue) {
        this.hud.showPulse("RISK COIN", `+${gained} bonus`, 0xffcf74, 1000);
      } else {
        this.hud.showPulse("COIN", `+${gained}`, 0x8ed8ff, 800);
      }
    }

    const band = Math.floor(snapshot.distanceUnits / 12);
    if (band > this.lastProgressBand) {
      this.lastProgressBand = band;
      if (band > 0) {
        this.hud.showPulse(`CHECKPOINT ${band + 1}`, "New stretch ahead", 0xffd76c, 1100);
      }
    }

    this.lastScoreTotal = snapshot.totalScore;
    this.lastDistanceUnits = snapshot.distanceUnits;
  }

  private updateChapterState(
    segmentId: string,
    segmentLength: number,
    note: string | undefined,
    pacingBeat: string,
    elapsedMs: number
  ): void {
    if (segmentId === this.lastSegmentId) {
      return;
    }

    this.lastSegmentId = segmentId;
    const chapterIndex = this.lastProgressBand + 2;
    const title = `RUN ${String(chapterIndex).padStart(2, "0")}`;
    this.lastChapterLabel = title;
    this.lastBeatLabel = pacingBeat.toUpperCase();
    const detailParts = [this.lastBeatLabel, this.friendlySegmentName(segmentId), note].filter(Boolean);
    this.hud.setChapterProgress(title, detailParts.join(" · "));
    if (elapsedMs - this.lastChapterBannerAtMs > 1200) {
      this.lastChapterBannerAtMs = elapsedMs;
      this.hud.showPulse(
        title,
        `${this.lastBeatLabel} · ${this.friendlySegmentName(segmentId)} · ${Math.ceil(segmentLength / 32)} tiles`,
        0x8ed8ff,
        1300
      );
    }
  }

  private updateWallFeedback(state: WallState): void {
    if (state === this.lastWallState) {
      return;
    }

    this.lastWallState = state;
    if (state === "warning") {
      this.hud.showPulse("WALL WARNING", "Keep moving. The chase is waking up.", 0xffbe55, 1200);
    } else if (state === "sprint") {
      this.hud.showPulse("WALL SPRINT", "No hesitation.", 0xff6d53, 1200);
    } else if (state === "recover") {
      this.hud.showPulse("WALL RECOVER", "Short breathing room.", 0x8ecbff, 1000);
    }
  }

  private friendlySegmentName(segmentId: string): string {
    return segmentId
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private createBackdrop(): void {
    const worldWidth = WORLD_CONFIG.worldBounds.width;

    this.add
      .image(0, 0, "backdrop-sky")
      .setOrigin(0, 0)
      .setDisplaySize(VIEWPORT.width, VIEWPORT.height)
      .setScrollFactor(0)
      .setAlpha(0.42)
      .setDepth(0);

    this.add
      .image(0, 0, "backdrop-hills")
      .setOrigin(0, 0)
      .setDisplaySize(VIEWPORT.width, VIEWPORT.height)
      .setScrollFactor(0)
      .setAlpha(0.3)
      .setDepth(0);

    this.add.rectangle(
      0,
      0,
      worldWidth,
      VIEWPORT.height,
      0x8ed8ff
    ).setOrigin(0, 0);

    this.add
      .ellipse(770, 88, 126, 126, 0xfff2a8, 1)
      .setScrollFactor(0.04)
      .setDepth(1);
    this.add
      .ellipse(770, 88, 160, 160, 0xfff8d8, 0.26)
      .setScrollFactor(0.02)
      .setDepth(1);

    this.add
      .ellipse(190, 92, 120, 34, 0xffffff, 0.88)
      .setScrollFactor(0.03)
      .setDepth(1);
    this.add
      .ellipse(210, 80, 64, 28, 0xffffff, 0.9)
      .setScrollFactor(0.03)
      .setDepth(1);
    this.add
      .ellipse(616, 74, 106, 32, 0xffffff, 0.84)
      .setScrollFactor(0.03)
      .setDepth(1);

    this.add
      .rectangle(0, 372, worldWidth, 116, 0x82be87, 0.48)
      .setOrigin(0, 0)
      .setDepth(2);
    this.add
      .rectangle(0, 404, worldWidth, 96, 0x6fab72, 0.44)
      .setOrigin(0, 0)
      .setDepth(2);

    this.add
      .rectangle(0, 470, worldWidth, 82, 0x8a4f24, 1)
      .setOrigin(0, 0)
      .setDepth(3);
    this.add
      .rectangle(0, 462, worldWidth, 18, 0x36c94d, 1)
      .setOrigin(0, 0)
      .setDepth(4);
    this.add
      .rectangle(0, 458, worldWidth, 4, 0x8ef18a, 1)
      .setOrigin(0, 0)
      .setDepth(2);

    [
      { x: 122, y: 454, key: "coin-normal", scale: 0.56, depth: 5 },
      { x: 182, y: 460, key: "coin-risk", scale: 0.72, depth: 5 },
      { x: 388, y: 455, key: "coin-normal", scale: 0.52, depth: 5 },
      { x: 758, y: 458, key: "coin-risk", scale: 0.7, depth: 5 },
      { x: 1098, y: 454, key: "coin-normal", scale: 0.54, depth: 5 },
      { x: 1468, y: 459, key: "coin-risk", scale: 0.68, depth: 5 }
    ].forEach(({ x, y, key, scale, depth }) => {
      this.add.image(x, y, key).setScale(scale).setDepth(depth);
    });

    const compact = this.scale.width < 500;
    if (compact) {
      this.addTutorialCard(16, VIEWPORT.height - 94, 192, "tutorial-left-right", "MOVE", "LEFT / RIGHT", 0xffd76c);
      this.addTutorialCard(240, VIEWPORT.height - 94, 192, "tutorial-jump", "JUMP", "SPACE", 0x9de7ff);
      this.addTutorialCard(464, VIEWPORT.height - 94, 192, "tutorial-hazard", "DANGER", "SPIKES / WALL", 0xff9d82);
    } else {
      this.addTutorialCard(20, VIEWPORT.height - 68, 296, "tutorial-left-right", "MOVE", "LEFT / RIGHT", 0xffd76c);
      this.addTutorialCard(332, VIEWPORT.height - 68, 296, "tutorial-jump", "JUMP", "SPACE", 0x9de7ff);
      this.addTutorialCard(644, VIEWPORT.height - 68, 296, "tutorial-hazard", "DANGER", "SPIKES / WALL", 0xff9d82);
    }
  }

  private showReadyPrompt(): void {
    const panel = this.add.container(VIEWPORT.width / 2, VIEWPORT.height / 2);

    const background = this.add
      .rectangle(0, 0, 430, 170, 0xf7efc8, 0.94)
      .setStrokeStyle(4, 0x22361f, 1);
    const accent = this.add.rectangle(0, -74, 402, 8, 0x54d55c, 1);
    const title = this.add
      .text(0, -42, "Ready?", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "40px",
        color: "#17331f"
      })
      .setOrigin(0.5);
    const detail = this.add
      .text(0, 8, "Move, jump, or tap to start the chase.", {
        align: "center",
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "18px",
        color: "#49603d"
      })
      .setOrigin(0.5);
    const controls = this.add
      .text(0, 48, "A/D or arrows · Space/W/Up · touch buttons", {
        align: "center",
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "14px",
        color: "#2f6c33"
      })
      .setOrigin(0.5);

    panel
      .add([background, accent, title, detail, controls])
      .setScrollFactor(0)
      .setDepth(80);
    this.readyPrompt = panel;
  }

  private addTutorialCard(
    x: number,
    y: number,
    width: number,
    textureKey: string,
    label: string,
    hint: string,
    accentColor: number
  ): void {
    this.add
      .rectangle(x, y, width, 52, 0xf8f0cf, 0.96)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(30)
      .setStrokeStyle(3, 0x1f311f, 1);
    this.add
      .rectangle(x + 4, y + 4, width - 8, 6, accentColor, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(31);
    this.add
      .image(x + 26, y + 26, textureKey)
      .setScale(0.82)
      .setScrollFactor(0)
      .setDepth(31);
    this.add
      .text(x + 52, y + 11, label, {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "16px",
        color: "#17331f"
      })
      .setScrollFactor(0)
      .setDepth(31);
    this.add
      .text(x + 52, y + 28, hint, {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "12px",
        color: "#466043"
      })
      .setScrollFactor(0)
      .setDepth(31);
  }
}
