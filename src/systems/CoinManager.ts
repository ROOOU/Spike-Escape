import * as Phaser from "phaser";
import { SCORE_CONFIG } from "../config/scoreConfig";
import type { CoinDefinition, CoinType } from "../types/segments";
import { spawnCollectBurst, spawnFloatingLabel } from "./FeedbackEffects";

const MAGNET_RADIUS_PX = 170;
const MAGNET_PULL_SPEED_PX_PER_SECOND = 430;

export interface MagnetStepResult {
  x: number;
  y: number;
  pulled: boolean;
}

export function resolveMagnetStep({
  coinX,
  coinY,
  targetX,
  targetY,
  deltaMs,
  radiusPx = MAGNET_RADIUS_PX,
  speedPxPerSecond = MAGNET_PULL_SPEED_PX_PER_SECOND
}: {
  coinX: number;
  coinY: number;
  targetX: number;
  targetY: number;
  deltaMs: number;
  radiusPx?: number;
  speedPxPerSecond?: number;
}): MagnetStepResult {
  const dx = targetX - coinX;
  const dy = targetY - coinY;
  const distance = Math.hypot(dx, dy);

  if (
    distance <= 0 ||
    distance > radiusPx ||
    deltaMs <= 0 ||
    speedPxPerSecond <= 0
  ) {
    return { x: coinX, y: coinY, pulled: false };
  }

  const travel = Math.min(distance, speedPxPerSecond * (deltaMs / 1000));
  const ratio = travel / distance;

  return {
    x: coinX + dx * ratio,
    y: coinY + dy * ratio,
    pulled: true
  };
}

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
      const value =
        coinType === "risk" ? SCORE_CONFIG.riskCoinValue : SCORE_CONFIG.normalCoinValue;
      spawnCollectBurst(this.scene, coin.x, coin.y, coinType === "risk");
      spawnFloatingLabel(
        this.scene,
        coin.x,
        coin.y - 28,
        `+${value}`,
        coinType === "risk" ? "#ffcf74" : "#8ed8ff",
        coinType === "risk" ? 24 : 20,
        coinType === "risk" ? 900 : 760
      );
      coin.disableBody(true, true);
      onCollect(coinType);
    });
  }

  updateMagnet(
    player: Phaser.Physics.Arcade.Sprite,
    deltaMs: number,
    active: boolean
  ): void {
    if (!active) {
      return;
    }

    this.group.getChildren().forEach((child) => {
      const coin = child as Phaser.Physics.Arcade.Image;
      if (!coin.active) {
        return;
      }

      const next = resolveMagnetStep({
        coinX: coin.x,
        coinY: coin.y,
        targetX: player.x,
        targetY: player.y,
        deltaMs
      });

      if (!next.pulled) {
        return;
      }

      coin.setPosition(next.x, next.y);
      (coin.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
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
