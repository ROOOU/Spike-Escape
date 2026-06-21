import * as Phaser from "phaser";
import type {
  CrusherMotionDefinition,
  HazardDefinition,
  PatrolMotionDefinition
} from "../types/segments";

interface AnimatedHazard {
  sprite: Phaser.Physics.Arcade.Sprite;
  startX: number;
  startY: number;
  hazard: HazardDefinition;
  warningZone?: Phaser.GameObjects.TileSprite;
}

interface HazardTelegraphs {
  objects: Phaser.GameObjects.GameObject[];
  warningZone?: Phaser.GameObjects.TileSprite;
}

const DEFAULT_PATROL: PatrolMotionDefinition = {
  axis: "x",
  distance: 96,
  durationMs: 1800
};

const DEFAULT_CRUSHER: CrusherMotionDefinition = {
  distance: 96,
  warningMs: 650,
  slamMs: 240,
  holdMs: 420,
  returnMs: 760
};

const TELEGRAPH_DEPTH = 7;

export class HazardManager {
  readonly staticGroup: Phaser.Physics.Arcade.StaticGroup;
  readonly dynamicGroup: Phaser.Physics.Arcade.Group;
  readonly softGroup: Phaser.Physics.Arcade.StaticGroup;

  private readonly bySegment = new Map<string, Phaser.GameObjects.GameObject[]>();
  private readonly animatedBySegment = new Map<string, AnimatedHazard[]>();

  constructor(private readonly scene: Phaser.Scene) {
    this.staticGroup = scene.physics.add.staticGroup();
    this.dynamicGroup = scene.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    this.softGroup = scene.physics.add.staticGroup();
  }

  spawn(segmentId: string, segmentStartX: number, hazards: HazardDefinition[]): void {
    const objects: Phaser.GameObjects.GameObject[] = [];
    const animated: AnimatedHazard[] = [];

    hazards.forEach((hazard) => {
      const telegraphs = this.spawnTelegraphs(segmentId, segmentStartX, hazard);
      objects.push(...telegraphs.objects);

      if (hazard.kind === "mud-pit") {
        objects.push(this.spawnSoftHazard(segmentId, segmentStartX, hazard));
        return;
      }

      if (
        hazard.kind === "spike" ||
        hazard.kind === "spike-long" ||
        hazard.kind === "crumbling-platform"
      ) {
        objects.push(this.spawnStaticHazard(segmentId, segmentStartX, hazard));
        return;
      }

      const moving = this.spawnAnimatedHazard(
        segmentId,
        segmentStartX,
        hazard,
        telegraphs.warningZone
      );
      objects.push(moving.sprite);
      animated.push(moving);
    });

    if (objects.length > 0) {
      this.bySegment.set(segmentId, objects);
    }

    if (animated.length > 0) {
      this.animatedBySegment.set(segmentId, animated);
    }
  }

  attachListener(
    player: Phaser.Physics.Arcade.Sprite,
    onHit: (reason: string) => void
  ): void {
    const hit = (_player: unknown, hazard: unknown): void => {
      const gameObject = hazard as Phaser.GameObjects.GameObject;
      onHit(String(gameObject.getData("deathReason") ?? "Hit a trap"));
    };

    this.scene.physics.add.overlap(player, this.staticGroup, hit);
    this.scene.physics.add.overlap(player, this.dynamicGroup, hit);
  }

  attachSoftListener(
    player: Phaser.Physics.Arcade.Sprite,
    onSlow: (speedFactor: number, durationMs: number) => void
  ): void {
    this.scene.physics.add.overlap(player, this.softGroup, (_player, hazard) => {
      const gameObject = hazard as Phaser.GameObjects.GameObject;
      onSlow(
        Number(gameObject.getData("speedFactor") ?? 0.65),
        Number(gameObject.getData("durationMs") ?? 280)
      );
    });
  }

  update(elapsedMs: number): void {
    this.animatedBySegment.forEach((hazards) => {
      hazards.forEach((entry) => {
        if (entry.hazard.kind === "patrol-spike") {
          this.updatePatrol(entry, elapsedMs);
        } else if (entry.hazard.kind === "crusher") {
          this.updateCrusher(entry, elapsedMs);
        } else if (
          entry.hazard.kind === "thorn-vine" ||
          entry.hazard.kind === "flame-vent" ||
          entry.hazard.kind === "falling-rock"
        ) {
          this.updateTimedHazard(entry, elapsedMs);
        }
      });
    });
  }

  destroySegment(segmentId: string): void {
    const hazards = this.bySegment.get(segmentId);
    if (!hazards) {
      return;
    }

    hazards.forEach((hazard) => hazard.destroy());
    this.bySegment.delete(segmentId);
    this.animatedBySegment.delete(segmentId);
  }

  private spawnStaticHazard(
    segmentId: string,
    segmentStartX: number,
    hazard: HazardDefinition
  ): Phaser.Physics.Arcade.Sprite {
    const sprite = this.staticGroup.create(
      segmentStartX + hazard.x + hazard.width / 2,
      hazard.y + hazard.height / 2,
      hazard.kind === "spike-long" ? "spike-long" : "spike"
    ) as Phaser.Physics.Arcade.Sprite;

    this.prepareHazardSprite(sprite, segmentId, hazard, this.deathReasonFor(hazard));
    sprite.refreshBody();
    return sprite;
  }

  private spawnSoftHazard(
    segmentId: string,
    segmentStartX: number,
    hazard: HazardDefinition
  ): Phaser.Physics.Arcade.Sprite {
    const sprite = this.softGroup.create(
      segmentStartX + hazard.x + hazard.width / 2,
      hazard.y + hazard.height / 2,
      "mud-pit"
    ) as Phaser.Physics.Arcade.Sprite;

    sprite.setDepth(8);
    sprite.setDisplaySize(hazard.width, hazard.height);
    sprite.setData("segmentId", segmentId);
    sprite.setData("speedFactor", hazard.soft?.speedFactor ?? 0.65);
    sprite.setData("durationMs", hazard.soft?.durationMs ?? 280);
    sprite.refreshBody();
    return sprite;
  }

  private spawnAnimatedHazard(
    segmentId: string,
    segmentStartX: number,
    hazard: HazardDefinition,
    warningZone?: Phaser.GameObjects.TileSprite
  ): AnimatedHazard {
    const texture = this.textureForHazard(hazard);
    const sprite = this.dynamicGroup.create(
      segmentStartX + hazard.x + hazard.width / 2,
      hazard.y + hazard.height / 2,
      texture
    ) as Phaser.Physics.Arcade.Sprite;
    const deathReason = this.deathReasonFor(hazard);

    this.prepareHazardSprite(sprite, segmentId, hazard, deathReason);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setVelocity(0, 0);

    return {
      sprite,
      startX: sprite.x,
      startY: sprite.y,
      hazard,
      warningZone
    };
  }

  private spawnTelegraphs(
    segmentId: string,
    segmentStartX: number,
    hazard: HazardDefinition
  ): HazardTelegraphs {
    if (hazard.kind === "spike" || hazard.kind === "spike-long") {
      return {
        objects: [this.spawnStaticSpikeWarning(segmentId, segmentStartX, hazard)]
      };
    }

    if (hazard.kind === "crumbling-platform") {
      return {
        objects: [this.spawnCrumbleWarning(segmentId, segmentStartX, hazard)]
      };
    }

    if (hazard.kind === "mud-pit") {
      return {
        objects: [this.spawnMudWarning(segmentId, segmentStartX, hazard)]
      };
    }

    if (hazard.kind === "patrol-spike") {
      return {
        objects: [this.spawnPatrolRail(segmentId, segmentStartX, hazard)]
      };
    }

    if (
      hazard.kind === "thorn-vine" ||
      hazard.kind === "flame-vent" ||
      hazard.kind === "falling-rock"
    ) {
      return this.spawnTimedWarning(segmentId, segmentStartX, hazard);
    }

    return this.spawnCrusherWarning(segmentId, segmentStartX, hazard);
  }

  private spawnStaticSpikeWarning(
    segmentId: string,
    segmentStartX: number,
    hazard: HazardDefinition
  ): Phaser.GameObjects.TileSprite {
    const base = this.scene.add
      .tileSprite(
        segmentStartX + hazard.x + hazard.width / 2,
        hazard.y + hazard.height - 5,
        Math.max(32, hazard.width + 12),
        10,
        "spike-warning-base"
      )
      .setDepth(TELEGRAPH_DEPTH)
      .setAlpha(0.72);

    base.setData("segmentId", segmentId);
    return base;
  }

  private spawnMudWarning(
    segmentId: string,
    segmentStartX: number,
    hazard: HazardDefinition
  ): Phaser.GameObjects.TileSprite {
    const base = this.scene.add
      .tileSprite(
        segmentStartX + hazard.x + hazard.width / 2,
        hazard.y + hazard.height / 2,
        Math.max(32, hazard.width + 10),
        Math.max(12, hazard.height),
        "mud-warning"
      )
      .setDepth(TELEGRAPH_DEPTH)
      .setAlpha(0.72);

    base.setData("segmentId", segmentId);
    return base;
  }

  private spawnCrumbleWarning(
    segmentId: string,
    segmentStartX: number,
    hazard: HazardDefinition
  ): Phaser.GameObjects.Image {
    const warning = this.scene.add
      .image(
        segmentStartX + hazard.x + hazard.width / 2,
        hazard.y - 14,
        "ui-warning"
      )
      .setDepth(TELEGRAPH_DEPTH + 1)
      .setAlpha(0.86)
      .setScale(1.1);

    warning.setData("segmentId", segmentId);
    return warning;
  }

  private spawnPatrolRail(
    segmentId: string,
    segmentStartX: number,
    hazard: HazardDefinition
  ): Phaser.GameObjects.TileSprite {
    const motion = hazard.patrol ?? DEFAULT_PATROL;
    const startX = segmentStartX + hazard.x + hazard.width / 2;
    const startY = hazard.y + hazard.height / 2;
    const endX = motion.axis === "x" ? startX + motion.distance : startX;
    const endY = motion.axis === "y" ? startY + motion.distance : startY;
    const minX = Math.min(startX - hazard.width / 2, endX - hazard.width / 2);
    const maxX = Math.max(startX + hazard.width / 2, endX + hazard.width / 2);
    const minY = Math.min(startY - hazard.height / 2, endY - hazard.height / 2);
    const maxY = Math.max(startY + hazard.height / 2, endY + hazard.height / 2);
    const isHorizontal = motion.axis === "x";
    const rail = this.scene.add
      .tileSprite(
        (minX + maxX) / 2,
        (minY + maxY) / 2,
        isHorizontal ? Math.max(32, maxX - minX + 16) : 12,
        isHorizontal ? 12 : Math.max(32, maxY - minY + 16),
        isHorizontal ? "patrol-rail-h" : "patrol-rail-v"
      )
      .setDepth(TELEGRAPH_DEPTH)
      .setAlpha(0.84);

    rail.setData("segmentId", segmentId);
    return rail;
  }

  private spawnCrusherWarning(
    segmentId: string,
    segmentStartX: number,
    hazard: HazardDefinition
  ): HazardTelegraphs {
    const motion = hazard.crusher ?? DEFAULT_CRUSHER;
    const centerX = segmentStartX + hazard.x + hazard.width / 2;
    const restCenterY = hazard.y + hazard.height / 2;
    const impactCenterY = restCenterY + motion.distance;
    const dropShadow = this.scene.add
      .rectangle(
        centerX,
        (restCenterY + impactCenterY) / 2,
        Math.max(18, hazard.width - 8),
        Math.max(hazard.height, Math.abs(motion.distance) + hazard.height),
        0x5a1b14,
        0.12
      )
      .setDepth(TELEGRAPH_DEPTH)
      .setStrokeStyle(2, 0xffcf74, 0.24);
    const warningZone = this.scene.add
      .tileSprite(
        centerX,
        impactCenterY,
        Math.max(32, hazard.width + 16),
        Math.max(28, hazard.height + 10),
        "crusher-warning-zone"
      )
      .setDepth(TELEGRAPH_DEPTH)
      .setAlpha(0.46);

    dropShadow.setData("segmentId", segmentId);
    warningZone.setData("segmentId", segmentId);

    return {
      objects: [dropShadow, warningZone],
      warningZone
    };
  }

  private spawnTimedWarning(
    segmentId: string,
    segmentStartX: number,
    hazard: HazardDefinition
  ): HazardTelegraphs {
    const centerX = segmentStartX + hazard.x + hazard.width / 2;
    const centerY = hazard.y + hazard.height / 2;
    const warningZone = this.scene.add
      .tileSprite(
        centerX,
        hazard.kind === "falling-rock" ? hazard.y + hazard.height + 6 : centerY,
        Math.max(32, hazard.width + 16),
        Math.max(18, hazard.height + 10),
        hazard.kind === "falling-rock" ? "falling-rock-shadow" : "timed-warning-zone"
      )
      .setDepth(TELEGRAPH_DEPTH)
      .setAlpha(0.42);

    warningZone.setData("segmentId", segmentId);

    return {
      objects: [warningZone],
      warningZone
    };
  }

  private prepareHazardSprite(
    sprite: Phaser.Physics.Arcade.Sprite,
    segmentId: string,
    hazard: HazardDefinition,
    deathReason: string
  ): void {
    sprite.setDepth(8);
    sprite.setDisplaySize(hazard.width, hazard.height);
    const body = sprite.body as
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | null;
    body?.setSize(hazard.width / sprite.scaleX, hazard.height / sprite.scaleY, true);
    sprite.setData("segmentId", segmentId);
    sprite.setData("deathReason", deathReason);
  }

  private updatePatrol(entry: AnimatedHazard, elapsedMs: number): void {
    const motion = entry.hazard.patrol ?? DEFAULT_PATROL;
    const duration = Math.max(1, motion.durationMs);
    const progress = ((elapsedMs + (motion.phaseMs ?? 0)) % duration) / duration;
    const wave = 1 - Math.abs(progress * 2 - 1);
    const offset = motion.distance * wave;
    const x = motion.axis === "x" ? entry.startX + offset : entry.startX;
    const y = motion.axis === "y" ? entry.startY + offset : entry.startY;

    entry.sprite.setPosition(x, y);
    (entry.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
  }

  private updateCrusher(entry: AnimatedHazard, elapsedMs: number): void {
    const motion = entry.hazard.crusher ?? DEFAULT_CRUSHER;
    const warningMs = Math.max(1, motion.warningMs);
    const slamMs = Math.max(1, motion.slamMs);
    const holdMs = Math.max(1, motion.holdMs);
    const returnMs = Math.max(1, motion.returnMs);
    const duration = warningMs + slamMs + holdMs + returnMs;
    const t = (elapsedMs + (motion.phaseMs ?? 0)) % duration;
    let offset = 0;

    if (t < warningMs) {
      offset = Math.sin((t / warningMs) * Math.PI * 8) * 3;
    } else if (t < warningMs + slamMs) {
      offset = Phaser.Math.Easing.Cubic.In((t - warningMs) / slamMs) * motion.distance;
    } else if (t < warningMs + slamMs + holdMs) {
      offset = motion.distance;
    } else {
      const returnProgress = (t - warningMs - slamMs - holdMs) / returnMs;
      offset = (1 - Phaser.Math.Easing.Quadratic.Out(returnProgress)) * motion.distance;
    }

    if (entry.warningZone) {
      if (t < warningMs) {
        const warningProgress = t / warningMs;
        entry.warningZone.setAlpha(
          0.48 + Math.sin(warningProgress * Math.PI * 8) * 0.18
        );
      } else if (t < warningMs + slamMs + holdMs) {
        entry.warningZone.setAlpha(0.82);
      } else {
        const returnProgress = (t - warningMs - slamMs - holdMs) / returnMs;
        entry.warningZone.setAlpha(0.42 - returnProgress * 0.12);
      }
    }

    entry.sprite.setPosition(entry.startX, entry.startY + offset);
    (entry.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
  }

  private updateTimedHazard(entry: AnimatedHazard, elapsedMs: number): void {
    const timing = entry.hazard.timing ?? {
      warningMs: 650,
      activeMs: 700,
      inactiveMs: 900
    };
    const warningMs = Math.max(1, timing.warningMs);
    const activeMs = Math.max(1, timing.activeMs);
    const inactiveMs = Math.max(1, timing.inactiveMs);
    const duration = warningMs + activeMs + inactiveMs;
    const t = (elapsedMs + (timing.phaseMs ?? 0)) % duration;
    const inWarning = t < warningMs;
    const inActive = t >= warningMs && t < warningMs + activeMs;
    const body = entry.sprite.body as Phaser.Physics.Arcade.Body;

    if (entry.hazard.kind === "falling-rock") {
      const activeProgress = Phaser.Math.Clamp((t - warningMs) / activeMs, 0, 1);
      const fallDistance = entry.hazard.crusher?.distance ?? 96;
      const y = inActive
        ? entry.startY -
          fallDistance +
          Phaser.Math.Easing.Cubic.In(activeProgress) * fallDistance
        : entry.startY - fallDistance;
      entry.sprite.setPosition(entry.startX, y);
    }

    body.enable = inActive;
    entry.sprite.setAlpha(inWarning ? 0.36 : inActive ? 1 : 0.18);
    entry.sprite.setVisible(inWarning || inActive);

    if (entry.warningZone) {
      if (inWarning) {
        const warningProgress = t / warningMs;
        entry.warningZone.setAlpha(
          0.38 + Math.sin(warningProgress * Math.PI * 8) * 0.2
        );
      } else if (inActive) {
        entry.warningZone.setAlpha(0.76);
      } else {
        entry.warningZone.setAlpha(0.22);
      }
    }

    body.updateFromGameObject();
  }

  private textureForHazard(hazard: HazardDefinition): string {
    switch (hazard.kind) {
      case "crusher":
        return "crusher";
      case "thorn-vine":
        return "thorn-vine";
      case "flame-vent":
        return "flame-vent";
      case "falling-rock":
        return "falling-rock";
      case "crumbling-platform":
        return "crumbling-platform";
      case "patrol-spike":
      default:
        return "patrol-spike";
    }
  }

  private deathReasonFor(hazard: HazardDefinition): string {
    switch (hazard.kind) {
      case "spike":
      case "spike-long":
        return "Hit a cactus patch";
      case "crusher":
        return "Crushed by a thorn press";
      case "thorn-vine":
        return "Caught by thorn vines";
      case "flame-vent":
        return "Burned by a flame vent";
      case "falling-rock":
        return "Flattened by falling rocks";
      case "crumbling-platform":
        return "Stepped onto crumbling ground";
      case "patrol-spike":
      default:
        return "Hit moving thorns";
    }
  }
}
