import * as Phaser from "phaser";
import type { HazardDefinition } from "../types/segments";

export class HazardManager {
  readonly group: Phaser.Physics.Arcade.StaticGroup;

  private readonly bySegment = new Map<string, Phaser.GameObjects.GameObject[]>();

  constructor(private readonly scene: Phaser.Scene) {
    this.group = scene.physics.add.staticGroup();
  }

  spawn(segmentId: string, segmentStartX: number, hazards: HazardDefinition[]): void {
    const sprites = hazards.map((hazard) => {
      const sprite = this.group.create(
        segmentStartX + hazard.x + hazard.width / 2,
        hazard.y + hazard.height / 2,
        "spike"
      ) as Phaser.Physics.Arcade.Sprite;

      sprite.setDepth(8);
      sprite.setDisplaySize(hazard.width, hazard.height);
      sprite.refreshBody();
      sprite.setScale(1, 1);
      sprite.setData("segmentId", segmentId);
      return sprite;
    });

    if (sprites.length > 0) {
      this.bySegment.set(segmentId, sprites);
    }
  }

  attachListener(
    player: Phaser.Physics.Arcade.Sprite,
    onHit: (reason: string) => void
  ): void {
    this.scene.physics.add.overlap(player, this.group, () => {
      onHit("Hit a cactus patch");
    });
  }

  destroySegment(segmentId: string): void {
    const hazards = this.bySegment.get(segmentId);
    if (!hazards) {
      return;
    }

    hazards.forEach((hazard) => hazard.destroy());
    this.bySegment.delete(segmentId);
  }
}
