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

export class HazardManager {
  readonly staticGroup: Phaser.Physics.Arcade.StaticGroup;
  readonly dynamicGroup: Phaser.Physics.Arcade.Group;

  private readonly bySegment = new Map<string, Phaser.GameObjects.GameObject[]>();
  private readonly animatedBySegment = new Map<string, AnimatedHazard[]>();

  constructor(private readonly scene: Phaser.Scene) {
    this.staticGroup = scene.physics.add.staticGroup();
    this.dynamicGroup = scene.physics.add.group({
      allowGravity: false,
      immovable: true
    });
  }

  spawn(segmentId: string, segmentStartX: number, hazards: HazardDefinition[]): void {
    const sprites: Phaser.GameObjects.GameObject[] = [];
    const animated: AnimatedHazard[] = [];

    hazards.forEach((hazard) => {
      if (hazard.kind === "spike") {
        sprites.push(this.spawnStaticHazard(segmentId, segmentStartX, hazard));
        return;
      }

      const moving = this.spawnAnimatedHazard(segmentId, segmentStartX, hazard);
      sprites.push(moving.sprite);
      animated.push(moving);
    });

    if (sprites.length > 0) {
      this.bySegment.set(segmentId, sprites);
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

  update(elapsedMs: number): void {
    this.animatedBySegment.forEach((hazards) => {
      hazards.forEach((entry) => {
        if (entry.hazard.kind === "patrol-spike") {
          this.updatePatrol(entry, elapsedMs);
        } else if (entry.hazard.kind === "crusher") {
          this.updateCrusher(entry, elapsedMs);
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
      "spike"
    ) as Phaser.Physics.Arcade.Sprite;

    this.prepareHazardSprite(sprite, segmentId, hazard, "Hit a cactus patch");
    sprite.refreshBody();
    return sprite;
  }

  private spawnAnimatedHazard(
    segmentId: string,
    segmentStartX: number,
    hazard: HazardDefinition
  ): AnimatedHazard {
    const texture = hazard.kind === "crusher" ? "crusher" : "patrol-spike";
    const sprite = this.dynamicGroup.create(
      segmentStartX + hazard.x + hazard.width / 2,
      hazard.y + hazard.height / 2,
      texture
    ) as Phaser.Physics.Arcade.Sprite;
    const deathReason =
      hazard.kind === "crusher" ? "Crushed by a thorn press" : "Hit moving thorns";

    this.prepareHazardSprite(sprite, segmentId, hazard, deathReason);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setVelocity(0, 0);

    return {
      sprite,
      startX: sprite.x,
      startY: sprite.y,
      hazard
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
    sprite.setScale(1, 1);
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

    entry.sprite.setPosition(entry.startX, entry.startY + offset);
    (entry.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
  }
}
