import * as Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/playerConfig";
import type { InputSnapshot } from "./inputModel";
import { spawnJumpDust } from "./FeedbackEffects";
import { resolveVariableJumpVelocityY } from "./playerJump";
import { resolvePlayerTargetVelocityX } from "./playerMovement";

export class PlayerController {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly visual: Phaser.GameObjects.Image;
  private readonly shieldAura: Phaser.GameObjects.Image;
  private readonly headAccessory: Phaser.GameObjects.Image;

  private lastGroundedAtMs = Number.NEGATIVE_INFINITY;
  private jumpBufferedUntilMs = Number.NEGATIVE_INFINITY;
  private wasJumpHeld = false;
  private wasGrounded = false;
  private readonly visualBaseScaleX: number;
  private readonly visualBaseScaleY: number;
  private readonly shieldBaseScaleX: number;
  private readonly shieldBaseScaleY: number;
  private readonly headBaseScaleX: number;
  private readonly headBaseScaleY: number;
  private headClearEvent?: Phaser.Time.TimerEvent;
  private currentHeadKey = "head-plain";

  constructor(private readonly scene: Phaser.Scene) {
    this.sprite = scene.physics.add.sprite(
      PLAYER_CONFIG.startX,
      PLAYER_CONFIG.startY,
      "reference-player"
    );
    this.sprite.setDisplaySize(PLAYER_CONFIG.visualWidth, PLAYER_CONFIG.visualHeight);
    this.sprite.setVisible(false);
    this.sprite.setDepth(12);
    this.visual = scene.add
      .image(PLAYER_CONFIG.startX, PLAYER_CONFIG.startY, "reference-player")
      .setDisplaySize(PLAYER_CONFIG.visualWidth, PLAYER_CONFIG.visualHeight)
      .setDepth(12);
    this.shieldAura = scene.add
      .image(PLAYER_CONFIG.startX, PLAYER_CONFIG.startY, "bubble-shield")
      .setDisplaySize(PLAYER_CONFIG.visualWidth + 24, PLAYER_CONFIG.visualHeight + 22)
      .setDepth(13)
      .setAlpha(0)
      .setVisible(false);
    this.headAccessory = scene.add
      .image(PLAYER_CONFIG.startX, PLAYER_CONFIG.startY - 24, "head-plain")
      .setDisplaySize(28, 32)
      .setDepth(14)
      .setAlpha(0.95);
    this.visualBaseScaleX = this.visual.scaleX;
    this.visualBaseScaleY = this.visual.scaleY;
    this.shieldBaseScaleX = this.shieldAura.scaleX;
    this.shieldBaseScaleY = this.shieldAura.scaleY;
    this.headBaseScaleX = this.headAccessory.scaleX;
    this.headBaseScaleY = this.headAccessory.scaleY;
    this.sprite.setCollideWorldBounds(false);

    const body = this.body;
    const hitboxSourceWidth = PLAYER_CONFIG.hitboxWidth / this.sprite.scaleX;
    const hitboxSourceHeight = PLAYER_CONFIG.hitboxHeight / this.sprite.scaleY;
    const hitboxSourceOffsetX =
      (this.sprite.frame.width - hitboxSourceWidth) / 2;
    const hitboxSourceOffsetY = PLAYER_CONFIG.hitboxOffsetY / this.sprite.scaleY;

    body.setGravityY(PLAYER_CONFIG.gravity);
    body.setMaxVelocity(
      Math.max(
        Math.abs(PLAYER_CONFIG.boostRunSpeed),
        Math.abs(PLAYER_CONFIG.reverseRunSpeed)
      ),
      PLAYER_CONFIG.maxFallSpeed
    );
    body.setSize(hitboxSourceWidth, hitboxSourceHeight);
    body.setOffset(hitboxSourceOffsetX, hitboxSourceOffsetY);
  }

  update(input: InputSnapshot, timeMs: number, deltaMs: number, movementScale = 1): void {
    const grounded = this.isGrounded();
    if (grounded && !this.wasGrounded) {
      this.playLandingFeedback();
    }

    if (grounded) {
      this.lastGroundedAtMs = timeMs;
    }

    if (input.jumpPressed) {
      this.jumpBufferedUntilMs = timeMs + PLAYER_CONFIG.jumpBufferMs;
    }

    const targetVelocityX = resolvePlayerTargetVelocityX(input, movementScale);
    const controlFactor = grounded ? 1 : PLAYER_CONFIG.airControlFactor;
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
      this.playJumpFeedback();
    }

    const velocityBeforeJumpCut = this.body.velocity.y;
    const velocityAfterJumpCut = resolveVariableJumpVelocityY({
      velocityY: velocityBeforeJumpCut,
      jumpHeld: input.jump,
      wasJumpHeld: this.wasJumpHeld,
      shortHopVelocity: PLAYER_CONFIG.shortHopVelocity
    });
    if (velocityAfterJumpCut !== velocityBeforeJumpCut) {
      this.playShortHopFeedback();
    }
    this.body.setVelocityY(velocityAfterJumpCut);

    if (!grounded && this.body.velocity.y > PLAYER_CONFIG.maxFallSpeed) {
      this.body.setVelocityY(PLAYER_CONFIG.maxFallSpeed);
    }

    this.wasJumpHeld = input.jump;
    this.wasGrounded = grounded;
    this.updatePresentation();
  }

  getLeftX(): number {
    return this.body.x;
  }

  setShielded(active: boolean): void {
    this.shieldAura.setVisible(active);
    this.shieldAura.setAlpha(active ? 0.64 : 0);
    this.shieldAura.setScale(this.shieldBaseScaleX, this.shieldBaseScaleY);
    this.setHeadAccessory(active ? "head-bubble" : "head-plain");
    if (active) {
      this.scene.tweens.add({
        targets: this.shieldAura,
        alpha: { from: 0.36, to: 0.7 },
        scaleX: { from: this.shieldBaseScaleX * 0.92, to: this.shieldBaseScaleX },
        scaleY: { from: this.shieldBaseScaleY * 0.92, to: this.shieldBaseScaleY },
        duration: 280,
        ease: "Sine.easeOut"
      });
    }
  }

  breakShield(): void {
    this.body.setVelocityY(Math.min(this.body.velocity.y, -220));
    this.setHeadAccessory("head-broken", 860);
    this.scene.tweens.killTweensOf(this.shieldAura);
    this.shieldAura
      .setVisible(true)
      .setAlpha(0.72)
      .setScale(this.shieldBaseScaleX, this.shieldBaseScaleY);
    spawnJumpDust(this.scene, this.sprite.x, this.sprite.y - 10, 0x8ed8ff, "POP");

    this.scene.tweens.add({
      targets: this.shieldAura,
      alpha: 0,
      scaleX: this.shieldBaseScaleX * 1.28,
      scaleY: this.shieldBaseScaleY * 1.28,
      duration: 260,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.shieldAura
          .setVisible(false)
          .setScale(this.shieldBaseScaleX, this.shieldBaseScaleY);
      }
    });
  }

  flashCollectHead(): void {
    this.setHeadAccessory("head-redflower", 640);
  }

  getHeadKey(): string {
    return this.currentHeadKey;
  }

  private updatePresentation(): void {
    if (this.body.velocity.x < -PLAYER_CONFIG.facingDeadZone) {
      this.sprite.setFlipX(true);
      this.visual.setFlipX(true);
    } else if (this.body.velocity.x > PLAYER_CONFIG.facingDeadZone) {
      this.sprite.setFlipX(false);
      this.visual.setFlipX(false);
    }

    this.visual.setPosition(this.sprite.x, this.sprite.y);
    this.shieldAura.setPosition(this.sprite.x, this.sprite.y);
    this.headAccessory.setPosition(this.sprite.x, this.sprite.y - 24);
    this.headAccessory.setFlipX(this.visual.flipX);
  }

  private setHeadAccessory(textureKey: string, durationMs?: number): void {
    this.headClearEvent?.remove(false);
    this.scene.tweens.killTweensOf(this.headAccessory);
    this.currentHeadKey = textureKey;
    this.headAccessory
      .setTexture(textureKey)
      .setAlpha(0.95)
      .setScale(this.headBaseScaleX, this.headBaseScaleY)
      .setVisible(true);

    if (durationMs === undefined) {
      return;
    }

    this.headClearEvent = this.scene.time.delayedCall(durationMs, () => {
      this.currentHeadKey = "head-plain";
      this.headAccessory.setTexture("head-plain");
    });
  }

  private playJumpFeedback(): void {
    this.scene.tweens.killTweensOf(this.visual);
    this.visual.setScale(this.visualBaseScaleX * 0.76, this.visualBaseScaleY * 1.2);
    spawnJumpDust(
      this.scene,
      this.sprite.x,
      this.sprite.y + PLAYER_CONFIG.visualHeight / 2 - 4,
      0xf7efc8,
      "JUMP"
    );

    this.scene.tweens.add({
      targets: this.visual,
      scaleX: this.visualBaseScaleX,
      scaleY: this.visualBaseScaleY,
      duration: 240,
      ease: "Back.easeOut"
    });
  }

  private playShortHopFeedback(): void {
    this.scene.tweens.killTweensOf(this.visual);
    this.visual.setScale(this.visualBaseScaleX * 1.12, this.visualBaseScaleY * 0.88);
    spawnJumpDust(
      this.scene,
      this.sprite.x,
      this.sprite.y + PLAYER_CONFIG.visualHeight / 2 - 6,
      0x8ed8ff,
      "LOW HOP"
    );

    this.scene.tweens.add({
      targets: this.visual,
      scaleX: this.visualBaseScaleX,
      scaleY: this.visualBaseScaleY,
      duration: 180,
      ease: "Quad.easeOut"
    });
  }

  private playLandingFeedback(): void {
    this.scene.tweens.killTweensOf(this.visual);
    this.visual.setScale(this.visualBaseScaleX * 1.14, this.visualBaseScaleY * 0.86);
    spawnJumpDust(
      this.scene,
      this.sprite.x,
      this.sprite.y + PLAYER_CONFIG.visualHeight / 2 - 3,
      0xd8f2a5
    );

    this.scene.tweens.add({
      targets: this.visual,
      scaleX: this.visualBaseScaleX,
      scaleY: this.visualBaseScaleY,
      duration: 150,
      ease: "Back.easeOut"
    });
  }

  private isGrounded(): boolean {
    return this.body.blocked.down || this.body.touching.down;
  }

  private get body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }
}
