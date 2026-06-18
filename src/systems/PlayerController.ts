import * as Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/playerConfig";
import type { InputSnapshot } from "./inputModel";

export class PlayerController {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  private lastGroundedAtMs = Number.NEGATIVE_INFINITY;
  private jumpBufferedUntilMs = Number.NEGATIVE_INFINITY;

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.physics.add.sprite(
      PLAYER_CONFIG.startX,
      PLAYER_CONFIG.startY,
      "reference-player"
    );
    this.sprite.setDisplaySize(PLAYER_CONFIG.visualWidth, PLAYER_CONFIG.visualHeight);
    this.sprite.setDepth(12);
    this.sprite.setCollideWorldBounds(false);

    const body = this.body;
    const hitboxSourceWidth = PLAYER_CONFIG.hitboxWidth / this.sprite.scaleX;
    const hitboxSourceHeight = PLAYER_CONFIG.hitboxHeight / this.sprite.scaleY;
    const hitboxSourceOffsetX =
      (this.sprite.frame.width - hitboxSourceWidth) / 2;
    const hitboxSourceOffsetY = PLAYER_CONFIG.hitboxOffsetY / this.sprite.scaleY;

    body.setGravityY(PLAYER_CONFIG.gravity);
    body.setMaxVelocity(
      Math.abs(PLAYER_CONFIG.boostRunSpeed),
      PLAYER_CONFIG.maxFallSpeed
    );
    body.setSize(hitboxSourceWidth, hitboxSourceHeight);
    body.setOffset(hitboxSourceOffsetX, hitboxSourceOffsetY);
  }

  update(input: InputSnapshot, timeMs: number, deltaMs: number): void {
    const grounded = this.isGrounded();
    if (grounded) {
      this.lastGroundedAtMs = timeMs;
    }

    if (input.jumpPressed) {
      this.jumpBufferedUntilMs = timeMs + PLAYER_CONFIG.jumpBufferMs;
    }

    const targetVelocityX = this.resolveTargetVelocityX(input);
    const controlFactor = grounded ? 1 : 0.82;
    const lerpFactor = Math.min(
      1,
      PLAYER_CONFIG.horizontalResponsiveness * controlFactor * (deltaMs / 1000)
    );

    this.body.setVelocityX(
      Phaser.Math.Linear(this.body.velocity.x, targetVelocityX, lerpFactor)
    );

    const canUseBufferedJump =
      this.jumpBufferedUntilMs >= timeMs &&
      (grounded || timeMs - this.lastGroundedAtMs <= PLAYER_CONFIG.coyoteTimeMs);

    if (canUseBufferedJump) {
      this.body.setVelocityY(-PLAYER_CONFIG.jumpVelocity);
      this.jumpBufferedUntilMs = Number.NEGATIVE_INFINITY;
      this.lastGroundedAtMs = Number.NEGATIVE_INFINITY;
    }

    if (!grounded && this.body.velocity.y > PLAYER_CONFIG.maxFallSpeed) {
      this.body.setVelocityY(PLAYER_CONFIG.maxFallSpeed);
    }

    this.updatePresentation();
  }

  getLeftX(): number {
    return this.body.x;
  }

  private resolveTargetVelocityX(input: InputSnapshot): number {
    if (input.left && !input.right) {
      return PLAYER_CONFIG.reverseRunSpeed;
    }

    if (input.right && !input.left) {
      return PLAYER_CONFIG.boostRunSpeed;
    }

    return PLAYER_CONFIG.baseRunSpeed;
  }

  private updatePresentation(): void {
    if (this.body.velocity.x < PLAYER_CONFIG.baseRunSpeed - 10) {
      this.sprite.setFlipX(true);
    } else if (this.body.velocity.x > PLAYER_CONFIG.baseRunSpeed + 10) {
      this.sprite.setFlipX(false);
    }
  }

  private isGrounded(): boolean {
    return this.body.blocked.down || this.body.touching.down;
  }

  private get body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }
}
