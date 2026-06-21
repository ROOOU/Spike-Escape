import * as Phaser from "phaser";
import { SEGMENT_CATALOG, START_SEGMENT } from "../config/segments";
import { WORLD_CONFIG } from "../config/gameConfig";
import { PLAYER_CONFIG } from "../config/playerConfig";
import { pickPlannedSegment } from "../utils/segmentPlanner";
import { assertValidSegments } from "../utils/segmentValidator";
import type { SegmentDefinition } from "../types/segments";
import { CoinManager } from "./CoinManager";
import { EnemyManager } from "./EnemyManager";
import { HazardManager } from "./HazardManager";
import { PickupManager } from "./PickupManager";
import type { PickupKind } from "../types/segments";

interface SpawnedSegment {
  definition: SegmentDefinition;
  startX: number;
  endX: number;
  platforms: Phaser.Physics.Arcade.Sprite[];
  decor: Phaser.GameObjects.Image[];
}

export class SegmentManager {
  readonly platformGroup: Phaser.Physics.Arcade.StaticGroup;

  private readonly segments: SpawnedSegment[] = [];
  private readonly coinManager: CoinManager;
  private readonly pickupManager: PickupManager;
  private readonly enemyManager: EnemyManager;
  private readonly hazardManager: HazardManager;
  private spawnCursorX = 0;
  private generatedCount = 0;

  constructor(private readonly scene: Phaser.Scene) {
    assertValidSegments([START_SEGMENT, ...SEGMENT_CATALOG]);
    this.platformGroup = scene.physics.add.staticGroup();
    this.coinManager = new CoinManager(scene);
    this.pickupManager = new PickupManager(scene);
    this.enemyManager = new EnemyManager(scene);
    this.hazardManager = new HazardManager(scene);
  }

  initialize(): void {
    this.spawnSegment(0, START_SEGMENT);
    this.spawnCursorX = START_SEGMENT.length;

    while (this.spawnCursorX < WORLD_CONFIG.spawnAheadDistance) {
      this.spawnNext();
    }
  }

  attachRuntimeColliders(
    player: Phaser.Physics.Arcade.Sprite,
    onCoin: (type: "normal" | "risk") => void,
    onPickup: (kind: PickupKind) => void,
    onHazard: (reason: string) => void,
    onStomp?: () => void,
    onSlow?: (speedFactor: number, durationMs: number) => void
  ): void {
    this.scene.physics.add.collider(player, this.platformGroup);
    this.coinManager.attachCollector(player, onCoin);
    this.pickupManager.attachCollector(player, onPickup);
    this.enemyManager.attachListener(player, onHazard, onStomp);
    this.hazardManager.attachListener(player, onHazard);
    if (onSlow) {
      this.hazardManager.attachSoftListener(player, onSlow);
    }
  }

  update(progressAnchorX: number, elapsedMs: number): void {
    this.enemyManager.update(elapsedMs);
    this.hazardManager.update(elapsedMs);

    while (this.spawnCursorX < progressAnchorX + WORLD_CONFIG.spawnAheadDistance) {
      this.spawnNext();
    }

    while (
      this.segments.length > 0 &&
      this.segments[0].endX < progressAnchorX - WORLD_CONFIG.recycleBehindDistance
    ) {
      const segment = this.segments.shift();
      if (segment) {
        segment.platforms.forEach((platform) => platform.destroy());
        segment.decor.forEach((item) => item.destroy());
        this.coinManager.destroySegment(segment.definition.id + ":" + segment.startX);
        this.pickupManager.destroySegment(segment.definition.id + ":" + segment.startX);
        this.enemyManager.destroySegment(segment.definition.id + ":" + segment.startX);
        this.hazardManager.destroySegment(segment.definition.id + ":" + segment.startX);
      }
    }
  }

  updateMagnet(
    player: Phaser.Physics.Arcade.Sprite,
    deltaMs: number,
    active: boolean
  ): void {
    this.coinManager.updateMagnet(player, deltaMs, active);
  }

  getActiveSegment(playerX: number): SegmentDefinition {
    for (const segment of this.segments) {
      if (playerX >= segment.startX && playerX < segment.endX) {
        return segment.definition;
      }
    }

    return this.segments[this.segments.length - 1]?.definition ?? START_SEGMENT;
  }

  private spawnNext(): void {
    const definition = this.pickNextSegment();
    this.spawnSegment(this.spawnCursorX, definition);
    this.spawnCursorX += definition.length;
    this.generatedCount += 1;
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
    const decor = this.spawnDecor(startX, definition);

    this.coinManager.spawn(segmentId, startX, definition.coins);
    this.pickupManager.spawn(segmentId, startX, definition.pickups ?? []);
    this.enemyManager.spawn(segmentId, startX, definition.enemies ?? []);
    this.hazardManager.spawn(segmentId, startX, definition.hazards);

    this.segments.push({
      definition,
      startX,
      endX: startX + definition.length,
      platforms,
      decor
    });
  }

  private pickNextSegment(): SegmentDefinition {
    return pickPlannedSegment({
      generatedCount: this.generatedCount,
      mapDistancePx: Math.max(0, this.spawnCursorX - PLAYER_CONFIG.startX),
      recent: this.segments.slice(-2).map((segment) => segment.definition)
    });
  }

  private spawnDecor(startX: number, definition: SegmentDefinition): Phaser.GameObjects.Image[] {
    const density = definition.metadata.decorDensity ?? 0.45;
    const decor: Phaser.GameObjects.Image[] = [];
    const mainPlatforms = definition.platforms.filter((platform) => platform.mainPath);

    for (const [index, platform] of mainPlatforms.entries()) {
      if (platform.width < 72) {
        continue;
      }

      const shouldPlace =
        index === 0 ||
        platform.width >= 180 ||
        density >= 0.65 ||
        ((startX + platform.x + index * 17) % 3 === 0);

      if (!shouldPlace) {
        continue;
      }

      const localX = Phaser.Math.Clamp(
        platform.x + Math.max(24, Math.floor(platform.width * 0.28)),
        platform.x + 18,
        platform.x + platform.width - 18
      );

      const texture = this.decorTexture(startX, platform.x, index);
      const sprite = this.scene.add
        .image(startX + localX, platform.y - 2, texture)
        .setOrigin(0.5, 1)
        .setDepth(9);

      const scaleBase = texture === "flower" ? 0.9 : 0.8;
      const variation = ((startX + platform.width + index * 29) % 5) * 0.04;
      sprite.setScale(scaleBase + variation);
      decor.push(sprite);
    }

    return decor;
  }

  private decorTexture(startX: number, platformX: number, index: number): string {
    const textures = ["flower-red", "flower-blue", "shrub", "grass-tuft", "flower"];
    const decorIndex =
      Math.abs(Math.floor(startX / 32) + Math.floor(platformX / 16) + index * 3) %
      textures.length;

    return textures[decorIndex];
  }
}
