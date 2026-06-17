import Phaser from "phaser";
import { SEGMENT_CATALOG, START_SEGMENT } from "../config/segments";
import { WORLD_CONFIG } from "../config/gameConfig";
import { assertValidSegments } from "../utils/segmentValidator";
import type { PressureLevel, SegmentDefinition } from "../types/segments";
import { CoinManager } from "./CoinManager";
import { HazardManager } from "./HazardManager";

interface SpawnedSegment {
  definition: SegmentDefinition;
  startX: number;
  endX: number;
  platforms: Phaser.Physics.Arcade.Sprite[];
}

export class SegmentManager {
  readonly platformGroup: Phaser.Physics.Arcade.StaticGroup;

  private readonly segments: SpawnedSegment[] = [];
  private readonly coinManager: CoinManager;
  private readonly hazardManager: HazardManager;
  private spawnCursorX = 0;

  constructor(private readonly scene: Phaser.Scene) {
    assertValidSegments(SEGMENT_CATALOG);
    this.platformGroup = scene.physics.add.staticGroup();
    this.coinManager = new CoinManager(scene);
    this.hazardManager = new HazardManager(scene);
  }

  initialize(): void {
    this.spawnSegment(0, START_SEGMENT);
    this.spawnCursorX = START_SEGMENT.length;

    while (this.spawnCursorX < WORLD_CONFIG.spawnAheadDistance) {
      this.spawnNext(0, 0);
    }
  }

  attachRuntimeColliders(
    player: Phaser.Physics.Arcade.Sprite,
    onCoin: (type: "normal" | "risk") => void,
    onHazard: (reason: string) => void
  ): void {
    this.scene.physics.add.collider(player, this.platformGroup);
    this.coinManager.attachCollector(player, onCoin);
    this.hazardManager.attachListener(player, onHazard);
  }

  update(progressAnchorX: number, elapsedMs: number): void {
    while (this.spawnCursorX < progressAnchorX + WORLD_CONFIG.spawnAheadDistance) {
      this.spawnNext(progressAnchorX, elapsedMs);
    }

    while (
      this.segments.length > 0 &&
      this.segments[0].endX < progressAnchorX - WORLD_CONFIG.recycleBehindDistance
    ) {
      const segment = this.segments.shift();
      if (segment) {
        segment.platforms.forEach((platform) => platform.destroy());
        this.coinManager.destroySegment(segment.definition.id + ":" + segment.startX);
        this.hazardManager.destroySegment(segment.definition.id + ":" + segment.startX);
      }
    }
  }

  getActiveSegment(playerX: number): SegmentDefinition {
    for (const segment of this.segments) {
      if (playerX >= segment.startX && playerX < segment.endX) {
        return segment.definition;
      }
    }

    return this.segments[this.segments.length - 1]?.definition ?? START_SEGMENT;
  }

  private spawnNext(progressAnchorX: number, elapsedMs: number): void {
    const definition = this.pickNextSegment(progressAnchorX, elapsedMs);
    this.spawnSegment(this.spawnCursorX, definition);
    this.spawnCursorX += definition.length;
  }

  private spawnSegment(startX: number, definition: SegmentDefinition): void {
    const segmentId = `${definition.id}:${startX}`;
    const platforms = definition.platforms.map((platform) => {
      const sprite = this.platformGroup.create(
        startX + platform.x + platform.width / 2,
        platform.y + platform.height / 2,
        "platform"
      ) as Phaser.Physics.Arcade.Sprite;

      sprite.setDepth(6);
      sprite.setDisplaySize(platform.width, platform.height);
      sprite.refreshBody();
      sprite.setData("segmentId", segmentId);
      return sprite;
    });

    this.coinManager.spawn(segmentId, startX, definition.coins);
    this.hazardManager.spawn(segmentId, startX, definition.hazards);

    this.segments.push({
      definition,
      startX,
      endX: startX + definition.length,
      platforms
    });
  }

  private pickNextSegment(progressAnchorX: number, elapsedMs: number): SegmentDefinition {
    const difficultyCap = Math.min(
      3,
      Math.max(1, 1 + Math.floor(progressAnchorX / 2400), 1 + Math.floor(elapsedMs / 20000))
    );
    const recent = this.segments.slice(-2).map((segment) => segment.definition);
    const last = recent[recent.length - 1];
    const lastTwoHighPressure = recent.length === 2 && recent.every((segment) => segment.pressure === "high");

    let candidates = SEGMENT_CATALOG.filter((segment) => segment.difficulty <= difficultyCap);

    if (lastTwoHighPressure) {
      candidates = candidates.filter((segment) => segment.pressure === "recovery");
    } else if (last) {
      candidates = candidates.filter((segment) => segment.id !== last.id);
      if (last.pressure === "high") {
        const coolerSegments = candidates.filter((segment) =>
          this.isCoolingPressure(segment.pressure)
        );
        if (coolerSegments.length > 0) {
          candidates = coolerSegments;
        }
      }
    }

    if (candidates.length === 0) {
      candidates = SEGMENT_CATALOG.filter((segment) => segment.difficulty <= difficultyCap);
    }

    const totalWeight = candidates.reduce((sum, segment) => sum + segment.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const candidate of candidates) {
      roll -= candidate.weight;
      if (roll <= 0) {
        return candidate;
      }
    }

    return candidates[candidates.length - 1];
  }

  private isCoolingPressure(pressure: PressureLevel): boolean {
    return pressure === "low" || pressure === "recovery";
  }
}
