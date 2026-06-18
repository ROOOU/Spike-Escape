import * as Phaser from "phaser";
import type { CoinDefinition, CoinType } from "../types/segments";

export class CoinManager {
  readonly group: Phaser.Physics.Arcade.Group;

  private readonly bySegment = new Map<string, Phaser.Physics.Arcade.Image[]>();

  constructor(private readonly scene: Phaser.Scene) {
    this.group = scene.physics.add.group({
      allowGravity: false,
      immovable: true
    });
  }

  spawn(segmentId: string, segmentStartX: number, coins: CoinDefinition[]): void {
    const sprites = coins.map((coin) => {
      const texture = coin.type === "risk" ? "coin-risk" : "coin-normal";
      const sprite = this.scene.physics.add.image(
        segmentStartX + coin.x,
        coin.y,
        texture
      );

      sprite.setDepth(10);
      sprite.setScale(coin.type === "risk" ? 0.95 : 1);
      sprite.setImmovable(true);
      sprite.body.setAllowGravity(false);
      sprite.setData("coinType", coin.type);
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
    onCollect: (type: CoinType) => void
  ): void {
    this.scene.physics.add.overlap(player, this.group, (_, coinObject) => {
      const coin = coinObject as Phaser.Physics.Arcade.Image;
      if (!coin.active) {
        return;
      }

      const coinType = coin.getData("coinType") as CoinType;
      coin.disableBody(true, true);
      onCollect(coinType);
    });
  }

  destroySegment(segmentId: string): void {
    const coins = this.bySegment.get(segmentId);
    if (!coins) {
      return;
    }

    coins.forEach((coin) => coin.destroy());
    this.bySegment.delete(segmentId);
  }
}
