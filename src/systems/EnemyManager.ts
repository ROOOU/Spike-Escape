import * as Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/playerConfig";
import type {
  EnemyDefinition,
  EnemyKind,
  EnemyPatrolDefinition
} from "../types/segments";
import { spawnStompBurst } from "./FeedbackEffects";

interface SpawnedEnemy {
  sprite: Phaser.Physics.Arcade.Sprite;
  startX: number;
  startY: number;
  enemy: EnemyDefinition;
}

export interface EnemyBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface EnemyContactState {
  player: EnemyBounds;
  enemy: EnemyBounds;
  playerVelocityY: number;
  previousPlayerBottom: number;
}

export type EnemyContactResolution = "stomp" | "deadly";

const DEFAULT_BOUNCE_VELOCITY = Math.max(320, PLAYER_CONFIG.jumpVelocity * 0.72);
const MIN_STOMP_VELOCITY_Y = 48;
const STOMP_ENTRY_TOLERANCE_PX = 12;
const STOMP_MAX_OVERLAP_PX = 26;

export function resolveEnemyPatrolOffset(
  elapsedMs: number,
  patrol: EnemyPatrolDefinition
): number {
  const duration = Math.max(1, patrol.durationMs);
  const progress = ((elapsedMs + (patrol.phaseMs ?? 0)) % duration) / duration;
  const wave = 1 - Math.abs(progress * 2 - 1);

  return patrol.distance * wave;
}

export function resolveEnemyContact(
  state: EnemyContactState
): EnemyContactResolution {
  const descending = state.playerVelocityY >= MIN_STOMP_VELOCITY_Y;
  const enteredFromAbove =
    state.previousPlayerBottom <= state.enemy.top + STOMP_ENTRY_TOLERANCE_PX;
  const shallowTopOverlap =
    state.player.bottom >= state.enemy.top &&
    state.player.bottom <= state.enemy.top + STOMP_MAX_OVERLAP_PX;
  const horizontallyOverlapping =
    state.player.right > state.enemy.left && state.player.left < state.enemy.right;

  return descending && enteredFromAbove && shallowTopOverlap && horizontallyOverlapping
    ? "stomp"
    : "deadly";
}

export class EnemyManager {
  readonly group: Phaser.Physics.Arcade.Group;

  private readonly bySegment = new Map<string, Phaser.GameObjects.GameObject[]>();
  private readonly activeBySegment = new Map<string, SpawnedEnemy[]>();

  constructor(private readonly scene: Phaser.Scene) {
    this.group = scene.physics.add.group({
      allowGravity: false,
      immovable: true
    });
  }

  spawn(segmentId: string, segmentStartX: number, enemies: EnemyDefinition[]): void {
    if (enemies.length === 0) {
      return;
    }

    const objects: Phaser.GameObjects.GameObject[] = [];
    const active: SpawnedEnemy[] = [];

    enemies.forEach((enemy) => {
      const sprite = this.group.create(
        segmentStartX + enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2,
        textureForEnemy(enemy)
      ) as Phaser.Physics.Arcade.Sprite;

      sprite.setDepth(8);
      sprite.setDisplaySize(enemy.width, enemy.height);
      sprite.setData("segmentId", segmentId);
      sprite.setData("defeated", false);
      sprite.setData("enemyKind", enemy.kind);
      sprite.setData("bounceVelocity", enemy.bounceVelocity ?? DEFAULT_BOUNCE_VELOCITY);

      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.setSize(enemy.width / sprite.scaleX, enemy.height / sprite.scaleY);
      body.setVelocity(0, 0);

      objects.push(sprite);
      active.push({
        sprite,
        startX: sprite.x,
        startY: sprite.y,
        enemy
      });
    });

    this.bySegment.set(segmentId, objects);
    this.activeBySegment.set(segmentId, active);
  }

  attachListener(
    player: Phaser.Physics.Arcade.Sprite,
    onPlayerKilled: (reason: string) => void,
    onStomp?: () => void
  ): void {
    this.scene.physics.add.overlap(player, this.group, (_player, enemyObject) => {
      const enemy = enemyObject as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active || enemy.getData("defeated") === true) {
        return;
      }

      const playerBody = player.body as Phaser.Physics.Arcade.Body;
      const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
      const enemyKind = enemy.getData("enemyKind") as EnemyKind;

      if (!canStompEnemy(enemyKind)) {
        onPlayerKilled(deathReasonForEnemy(enemyKind));
        return;
      }

      const resolution = resolveEnemyContact({
        player: boundsFromBody(playerBody),
        enemy: boundsFromBody(enemyBody),
        playerVelocityY: playerBody.velocity.y,
        previousPlayerBottom: playerBody.prev.y + playerBody.height
      });

      if (resolution === "stomp") {
        spawnStompBurst(this.scene, enemy.x, enemy.y - enemy.displayHeight / 2);
        this.defeatEnemy(enemy);
        playerBody.setVelocityY(-this.bounceVelocityFor(enemy));
        onStomp?.();
        return;
      }

      onPlayerKilled(deathReasonForEnemy(enemyKind));
    });
  }

  update(elapsedMs: number): void {
    this.activeBySegment.forEach((enemies) => {
      enemies.forEach((entry) => {
        if (!entry.sprite.active || entry.sprite.getData("defeated") === true) {
          return;
        }

        if (!entry.enemy.patrol) {
          return;
        }

        const offset = resolveEnemyPatrolOffset(elapsedMs, entry.enemy.patrol);
        entry.sprite.setPosition(entry.startX + offset, entry.startY);
        (entry.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
      });
    });
  }

  destroySegment(segmentId: string): void {
    const objects = this.bySegment.get(segmentId);
    if (!objects) {
      return;
    }

    objects.forEach((object) => object.destroy());
    this.bySegment.delete(segmentId);
    this.activeBySegment.delete(segmentId);
  }

  private defeatEnemy(enemy: Phaser.Physics.Arcade.Sprite): void {
    enemy.setData("defeated", true);
    enemy.disableBody(true, true);
  }

  private bounceVelocityFor(enemy: Phaser.Physics.Arcade.Sprite): number {
    const value = enemy.getData("bounceVelocity");

    return typeof value === "number" && Number.isFinite(value) && value > 0
      ? value
      : DEFAULT_BOUNCE_VELOCITY;
  }
}

function boundsFromBody(body: Phaser.Physics.Arcade.Body): EnemyBounds {
  return {
    left: body.x,
    right: body.x + body.width,
    top: body.y,
    bottom: body.y + body.height
  };
}

function textureForEnemy(enemy: EnemyDefinition): string {
  switch (enemy.kind) {
    case "stomp-slime":
      return "stomp-slime";
    case "bat":
      return "bat";
    case "mole":
      return "mole";
    case "flower-turret":
      return "flower-turret";
    case "beetle":
      return "beetle";
    case "stompable-ground":
    default:
      return "stompable-enemy";
  }
}

function canStompEnemy(enemyKind: EnemyKind): boolean {
  return (
    enemyKind === "stompable-ground" ||
    enemyKind === "stomp-slime" ||
    enemyKind === "beetle"
  );
}

function deathReasonForEnemy(enemyKind: EnemyKind): string {
  switch (enemyKind) {
    case "bat":
      return "Hit a low-flying bat";
    case "mole":
      return "Caught by a mole ambush";
    case "flower-turret":
      return "Ran into a seed turret";
    case "beetle":
      return "Hit a beetle from the side";
    case "stomp-slime":
    case "stompable-ground":
    default:
      return "Ran into a stomper";
  }
}
