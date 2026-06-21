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
import {
  feedbackForCoin,
  feedbackForShieldBreak,
  feedbackForSlow,
  feedbackForStomp
} from "../ui/eventFeedbackConfig";
import {
  progressionStageForDistance,
  type ProgressionStage
} from "../utils/progressionStage";
import { loadBestScore, saveBestScore } from "../utils/storage";
import type { WallState } from "../systems/wallMachine";
import type { PickupKind } from "../types/segments";

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
const SHIELD_DAMAGE_GRACE_MS = 720;
const MAGNET_DURATION_MS = 4_200;
const WALL_FOCUS_DURATION_MS = 3_600;
const WALL_FOCUS_TIME_SCALE = 0.45;

interface SpikeEscapeQaState {
  scene: "GameScene";
  waitingToStart: boolean;
  ended: boolean;
  playerX: number;
  playerY: number;
  score: number;
  distanceUnits: number;
  activeSegmentId: string;
  wallState: WallState;
  shieldCharges: number;
  magnetActive: boolean;
  wallFocusActive: boolean;
  stompCount: number;
  playerHeadKey: string;
  movementScale: number;
  deathReason?: string;
}

declare global {
  interface Window {
    __SPIKE_ESCAPE_QA__?: SpikeEscapeQaState;
  }
}

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
  private lastStageKey = "";
  private lastScoreTotal = 0;
  private lastDistanceUnits = 0;
  private lastBeatLabel = "SETUP";
  private lastChapterLabel = "RUN 01";
  private waitingToStart = true;
  private slowUntilMs = Number.NEGATIVE_INFINITY;
  private movementScale = 1;
  private lastSlowFeedbackAtMs = Number.NEGATIVE_INFINITY;
  private shieldCharges = 0;
  private magnetUntilMs = Number.NEGATIVE_INFINITY;
  private wallFocusUntilMs = Number.NEGATIVE_INFINITY;
  private stompCount = 0;
  private damageImmuneUntilMs = Number.NEGATIVE_INFINITY;
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
    this.lastStageKey = "";
    this.lastScoreTotal = 0;
    this.lastDistanceUnits = 0;
    this.lastBeatLabel = "SETUP";
    this.lastChapterLabel = "RUN 01";
    this.slowUntilMs = Number.NEGATIVE_INFINITY;
    this.movementScale = 1;
    this.lastSlowFeedbackAtMs = Number.NEGATIVE_INFINITY;
    this.shieldCharges = 0;
    this.magnetUntilMs = Number.NEGATIVE_INFINITY;
    this.wallFocusUntilMs = Number.NEGATIVE_INFINITY;
    this.stompCount = 0;
    this.damageImmuneUntilMs = Number.NEGATIVE_INFINITY;
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
        this.hud.update(
          snapshot,
          this.bestScore,
          this.wallSystem.getState(),
          this.shieldCharges
        );
        this.showCoinFeedback(type);
      },
      (kind) => this.collectPickup(kind),
      (reason) => this.handleHazardHit(reason),
      () => this.showStompFeedback(),
      (speedFactor, durationMs) => this.applySlow(speedFactor, durationMs)
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
    this.hud.update(
      initialSnapshot,
      this.bestScore,
      this.wallSystem.getState(),
      this.shieldCharges
    );
    this.lastScoreTotal = initialSnapshot.totalScore;
    this.lastDistanceUnits = initialSnapshot.distanceUnits;
    this.showReadyPrompt();
    this.publishQaState();
    this.input.once("pointerdown", () => this.startRun());
    window.addEventListener("keydown", this.handleReadyKeyDown, { passive: false });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("keydown", this.handleReadyKeyDown);
      this.readyPrompt?.destroy();
      this.readyPrompt = undefined;
      delete window.__SPIKE_ESCAPE_QA__;
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
        this.publishQaState();
        return;
      }
    }

    const elapsedMs = this.time.now - this.runStartMs;
    if (elapsedMs > this.slowUntilMs) {
      this.movementScale = 1;
    }

    this.player.update(input, elapsedMs, deltaMs, this.movementScale);

    const scoreSnapshot = this.scoreTracker.updateProgress(this.player.sprite.x);
    this.cameraAnchorX = Math.max(this.cameraAnchorX, this.player.sprite.x);
    this.segmentManager.update(this.cameraAnchorX, elapsedMs);
    this.segmentManager.updateMagnet(
      this.player.sprite,
      deltaMs,
      elapsedMs <= this.magnetUntilMs
    );

    this.updateScoreFeedback(scoreSnapshot);

    const activeSegment = this.segmentManager.getActiveSegment(this.player.sprite.x);
    this.updateChapterState(
      activeSegment.id,
      activeSegment.length,
      activeSegment.metadata.notes?.[0],
      activeSegment.metadata.pacingBeat ?? "build",
      Math.max(0, scoreSnapshot.furthestX - PLAYER_CONFIG.startX),
      elapsedMs
    );
    const wallResult = this.wallSystem.update(
      deltaMs,
      elapsedMs,
      this.player.getLeftX(),
      activeSegment.allowWallSprint,
      Boolean(activeSegment.metadata.consecutivePits),
      elapsedMs <= this.wallFocusUntilMs ? WALL_FOCUS_TIME_SCALE : 1
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
    this.hud.update(scoreSnapshot, this.bestScore, wallResult.state, this.shieldCharges);
    this.publishQaState();
  }

  private finishRun(reason: string): void {
    if (this.ended) {
      return;
    }

    this.ended = true;
    const snapshot = this.scoreTracker.getSnapshot();
    this.publishQaState(reason);
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

  private handleHazardHit(reason: string): void {
    const elapsedMs = this.time.now - this.runStartMs;
    if (elapsedMs < this.damageImmuneUntilMs) {
      return;
    }

    if (this.shieldCharges > 0) {
      this.shieldCharges = 0;
      this.damageImmuneUntilMs = elapsedMs + SHIELD_DAMAGE_GRACE_MS;
      this.player.breakShield();
      this.hud.update(
        this.scoreTracker.getSnapshot(),
        this.bestScore,
        this.wallSystem.getState(),
        this.shieldCharges
      );
      this.hud.showEventFeedback(feedbackForShieldBreak());
      this.hud.showPulse("SHIELD POP", reason, 0x2fb9eb, 1000);
      return;
    }

    this.finishRun(reason);
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
    this.publishQaState();
  }

  private publishQaState(deathReason?: string): void {
    const snapshot = this.scoreTracker.getSnapshot();
    const activeSegmentId = this.segmentManager.getActiveSegment(this.player.sprite.x).id;

    window.__SPIKE_ESCAPE_QA__ = {
      scene: "GameScene",
      waitingToStart: this.waitingToStart,
      ended: this.ended,
      playerX: Math.round(this.player.sprite.x),
      playerY: Math.round(this.player.sprite.y),
      score: snapshot.totalScore,
      distanceUnits: snapshot.distanceUnits,
      activeSegmentId,
      wallState: this.wallSystem.getState(),
      shieldCharges: this.shieldCharges,
      magnetActive: this.time.now - this.runStartMs <= this.magnetUntilMs,
      wallFocusActive: this.time.now - this.runStartMs <= this.wallFocusUntilMs,
      stompCount: this.stompCount,
      playerHeadKey: this.player.getHeadKey(),
      movementScale: this.movementScale,
      deathReason
    };
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

  private showCoinFeedback(type: "normal" | "risk"): void {
    this.player.flashCollectHead();
    this.hud.showEventFeedback(feedbackForCoin(type));
  }

  private collectPickup(kind: PickupKind): void {
    if (kind === "bubble-shield") {
      this.shieldCharges = 1;
      this.player.setShielded(true);
      this.hud.update(
        this.scoreTracker.getSnapshot(),
        this.bestScore,
        this.wallSystem.getState(),
        this.shieldCharges
      );
      this.hud.showEventFeedback({
        title: "BUBBLE HAT",
        detail: "Blocks one trap or enemy hit",
        accent: 0x2fb9eb,
        iconKey: "bubble-shield",
        durationMs: 1400
      });
      return;
    }

    if (kind === "magnet") {
      const elapsedMs = this.time.now - this.runStartMs;
      this.magnetUntilMs = Math.max(this.magnetUntilMs, elapsedMs + MAGNET_DURATION_MS);
      this.hud.showEventFeedback({
        title: "MAGNET STAR",
        detail: "Nearby seeds drift toward you",
        accent: 0xffcf74,
        iconKey: "magnet-star",
        durationMs: 1400
      });
      this.hud.showPulse("MAGNET", "Seeds bend toward your path.", 0xffcf74, 1200);
      return;
    }

    if (kind === "clock-spore") {
      const elapsedMs = this.time.now - this.runStartMs;
      this.wallFocusUntilMs = Math.max(
        this.wallFocusUntilMs,
        elapsedMs + WALL_FOCUS_DURATION_MS
      );
      this.hud.showEventFeedback({
        title: "CLOCK SPORE",
        detail: "Spike wall pressure slows briefly",
        accent: 0x8ed8ff,
        iconKey: "stopwatch",
        durationMs: 1400
      });
      this.hud.showPulse("CLOCK SPORE", "The wall loses tempo.", 0x8ed8ff, 1200);
      return;
    }

    this.hud.showPulse("PICKUP", kind.replace(/-/g, " ").toUpperCase(), 0xffcf74, 1100);
  }

  private showStompFeedback(): void {
    this.stompCount += 1;
    this.hud.showEventFeedback(feedbackForStomp());
  }

  private applySlow(speedFactor: number, durationMs: number): void {
    const safeSpeedFactor = Phaser.Math.Clamp(speedFactor, 0.25, 1);
    const safeDurationMs = Math.max(120, durationMs);
    const elapsedMs = this.time.now - this.runStartMs;

    this.movementScale = Math.min(this.movementScale, safeSpeedFactor);
    this.slowUntilMs = Math.max(this.slowUntilMs, elapsedMs + safeDurationMs);
    if (elapsedMs - this.lastSlowFeedbackAtMs > 650) {
      this.lastSlowFeedbackAtMs = elapsedMs;
      this.hud.showEventFeedback(feedbackForSlow());
    }
  }

  private updateChapterState(
    segmentId: string,
    segmentLength: number,
    note: string | undefined,
    pacingBeat: string,
    mapDistancePx: number,
    elapsedMs: number
  ): void {
    const stage = progressionStageForDistance(mapDistancePx);
    const stageChanged = stage.key !== this.lastStageKey;

    if (segmentId === this.lastSegmentId && !stageChanged) {
      return;
    }

    this.lastSegmentId = segmentId;
    this.lastStageKey = stage.key;
    const title = stage.chapterLabel;
    this.lastChapterLabel = stage.chapterLabel;
    this.lastBeatLabel = pacingBeat.toUpperCase();
    const detailParts = [
      stage.title,
      this.lastBeatLabel,
      this.friendlySegmentName(segmentId),
      note
    ].filter(Boolean);
    this.hud.setChapterProgress(title, detailParts.join(" · "));
    if (stageChanged || elapsedMs - this.lastChapterBannerAtMs > 1200) {
      this.lastChapterBannerAtMs = elapsedMs;
      this.showChapterPulse(stage, segmentId, segmentLength);
    }
  }

  private showChapterPulse(
    stage: ProgressionStage,
    segmentId: string,
    segmentLength: number
  ): void {
    this.hud.showPulse(
      `${stage.chapterLabel} · ${stage.title}`,
      `${stage.detail} · ${this.friendlySegmentName(segmentId)} · ${Math.ceil(segmentLength / 32)} tiles`,
      stage.accent,
      1300
    );
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
      .setTint(0x0b140b)
      .setAlpha(0.22)
      .setDepth(0);

    this.add
      .image(0, 0, "backdrop-hills")
      .setOrigin(0, 0)
      .setDisplaySize(VIEWPORT.width, VIEWPORT.height)
      .setScrollFactor(0)
      .setTint(0x164016)
      .setAlpha(0.24)
      .setDepth(0);

    this.add.rectangle(
      0,
      0,
      worldWidth,
      VIEWPORT.height,
      0x050906
    ).setOrigin(0, 0);

    this.add
      .ellipse(770, 88, 126, 126, 0xfff2a8, 1)
      .setScrollFactor(0.04)
      .setDepth(1);
    this.add
      .ellipse(770, 88, 160, 160, 0xa4cd00, 0.16)
      .setScrollFactor(0.02)
      .setDepth(1);

    this.add
      .ellipse(190, 92, 120, 34, 0xf7efc8, 0.28)
      .setScrollFactor(0.03)
      .setDepth(1);
    this.add
      .ellipse(210, 80, 64, 28, 0xf7efc8, 0.24)
      .setScrollFactor(0.03)
      .setDepth(1);
    this.add
      .ellipse(616, 74, 106, 32, 0xf7efc8, 0.22)
      .setScrollFactor(0.03)
      .setDepth(1);

    this.add
      .rectangle(0, 372, worldWidth, 116, 0x063d12, 0.54)
      .setOrigin(0, 0)
      .setDepth(2);
    this.add
      .rectangle(0, 404, worldWidth, 96, 0x08280f, 0.62)
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
      this.addTutorialCard(240, VIEWPORT.height - 94, 192, "tutorial-jump", "JUMP", "TAP / HOLD", 0x9de7ff);
      this.addTutorialCard(464, VIEWPORT.height - 94, 192, "tutorial-hazard", "DANGER", "SPIKES / WALL", 0xff9d82);
    } else {
      this.addTutorialCard(20, VIEWPORT.height - 68, 296, "tutorial-left-right", "MOVE", "LEFT / RIGHT", 0xffd76c);
      this.addTutorialCard(332, VIEWPORT.height - 68, 296, "tutorial-jump", "JUMP", "TAP LOW / HOLD HIGH", 0x9de7ff);
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
      .text(0, 48, "Tap jump for low hops. Hold jump for full height.", {
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
