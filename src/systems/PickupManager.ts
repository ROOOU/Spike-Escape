import * as Phaser from "phaser";
import type { PickupDefinition, PickupKind } from "../types/segments";
import { spawnCollectBurst, spawnFloatingLabel } from "./FeedbackEffects";

const PICKUP_TEXTURES: Record<PickupKind, string> = {
  seed: "coin-normal",
  "risk-seed": "coin-risk",
  magnet: "magnet-star",
  "bubble-shield": "bubble-shield-pickup",
  "clock-spore": "stopwatch",
  "fire-crown": "flame-vent",
  "white-flower": "flower",
  "red-flower": "flower"
};

const PICKUP_LABELS: Record<PickupKind, string> = {
  seed: "SEED",
  "risk-seed": "RISK",
  magnet: "MAGNET",
  "bubble-shield": "SHIELD",
  "clock-spore": "SLOW TIME",
  "fire-crown": "FIRE",
  "white-flower": "WHITE FLOWER",
  "red-flower": "RED FLOWER"
};

export class PickupManager {
  readonly group: Phaser.Physics.Arcade.Group;

  private readonly bySegment = new Map<string, Phaser.Physics.Arcade.Image[]>();

  constructor(private readonly scene: Phaser.Scene) {
    this.group = scene.physics.add.group({
      allowGravity: false,
      immovable: true
    });
  }

  spawn(segmentId: string, segmentStartX: number, pickups: PickupDefinition[]): void {
    const sprites = pickups.map((pickup) => {
      const sprite = this.scene.physics.add.image(
        segmentStartX + pickup.x,
        pickup.y,
        PICKUP_TEXTURES[pickup.kind]
      );

      sprite.setDepth(10);
      sprite.setScale(scaleForPickup(pickup.kind));
      sprite.setImmovable(true);
      sprite.body.setAllowGravity(false);
      sprite.setData("pickupKind", pickup.kind);
      sprite.setData("segmentId", segmentId);
      return sprite;
    });

    if (sprites.length > 0) {
      this.group.addMultiple(sprites);
      this.bySegment.set(segmentId, sprites);
    }
  }

  attachCollector(
    player: Phaser.Physics.Arcade.Sprite,
    onCollect: (kind: PickupKind) => void
  ): void {
    this.scene.physics.add.overlap(player, this.group, (_player, pickupObject) => {
      const pickup = pickupObject as Phaser.Physics.Arcade.Image;
      if (!pickup.active) {
        return;
      }

      const kind = pickup.getData("pickupKind") as PickupKind;
      spawnCollectBurst(this.scene, pickup.x, pickup.y, true);
      spawnFloatingLabel(
        this.scene,
        pickup.x,
        pickup.y - 30,
        PICKUP_LABELS[kind],
        "#2fb9eb",
        18,
        900
      );
      pickup.disableBody(true, true);
      onCollect(kind);
    });
  }

  destroySegment(segmentId: string): void {
    const pickups = this.bySegment.get(segmentId);
    if (!pickups) {
      return;
    }

    pickups.forEach((pickup) => pickup.destroy());
    this.bySegment.delete(segmentId);
  }
}

function scaleForPickup(kind: PickupKind): number {
  switch (kind) {
    case "bubble-shield":
      return 0.82;
    case "magnet":
    case "clock-spore":
      return 0.9;
    default:
      return 0.72;
  }
}
