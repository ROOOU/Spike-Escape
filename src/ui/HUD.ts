import * as Phaser from "phaser";
import type { ScoreSnapshot } from "../systems/scoreTracker";
import type { WallState } from "../systems/wallMachine";

export class HUD {
  private readonly banner: Phaser.GameObjects.Rectangle;
  private readonly badge: Phaser.GameObjects.Rectangle;
  private readonly badgeText: Phaser.GameObjects.Text;
  private readonly wallChip: Phaser.GameObjects.Rectangle;
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly shieldText: Phaser.GameObjects.Text;
  private readonly detailText: Phaser.GameObjects.Text;
  private readonly chapterText: Phaser.GameObjects.Text;
  private readonly chapterDetailText: Phaser.GameObjects.Text;
  private readonly wallText: Phaser.GameObjects.Text;
  private readonly pulseBox: Phaser.GameObjects.Rectangle;
  private readonly pulseTitle: Phaser.GameObjects.Text;
  private readonly pulseDetail: Phaser.GameObjects.Text;
  private readonly eventBox: Phaser.GameObjects.Rectangle;
  private readonly eventIcon: Phaser.GameObjects.Image;
  private readonly eventTitle: Phaser.GameObjects.Text;
  private readonly eventDetail: Phaser.GameObjects.Text;
  private pulseClearEvent?: Phaser.Time.TimerEvent;
  private eventClearEvent?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    scene.add
      .rectangle(18, 18, 364, 114, 0xf7efc8, 0.96)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(40)
      .setStrokeStyle(3, 0x23361d, 1);

    this.banner = scene.add
      .rectangle(22, 22, 356, 8, 0x54d55c, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(41);

    this.badge = scene.add
      .rectangle(30, 34, 54, 24, 0x8ed8ff, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(41)
      .setStrokeStyle(2, 0x23361d, 1);

    this.badgeText = scene.add
      .text(57, 46, "RUN", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "12px",
        color: "#102914"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(42);

    scene.add
      .image(102, 46, "ui-coin")
      .setScrollFactor(0)
      .setDepth(42)
      .setScale(1.45);

    this.scoreText = scene.add
      .text(124, 33, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "20px",
        color: "#1a301a"
      })
      .setScrollFactor(0)
      .setDepth(42);

    this.detailText = scene.add
      .text(32, 66, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "14px",
        color: "#445b34"
      })
      .setScrollFactor(0)
      .setDepth(42);

    this.chapterText = scene.add
      .text(32, 90, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "12px",
        color: "#28512d",
        letterSpacing: 1
      })
      .setScrollFactor(0)
      .setDepth(42);

    this.chapterDetailText = scene.add
      .text(122, 90, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "12px",
        color: "#5a6f3d"
      })
      .setScrollFactor(0)
      .setDepth(42);

    this.wallChip = scene.add
      .rectangle(248, 34, 120, 24, 0xffe39d, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(41)
      .setStrokeStyle(2, 0x23361d, 1);

    scene.add
      .image(262, 46, "ui-warning")
      .setScrollFactor(0)
      .setDepth(42)
      .setScale(1.05);

    this.wallText = scene.add
      .text(316, 46, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "12px",
        color: "#3f2200"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(42);

    scene.add
      .image(302, 73, "ui-shield")
      .setScrollFactor(0)
      .setDepth(42)
      .setScale(1.15);

    this.shieldText = scene.add
      .text(320, 66, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "13px",
        color: "#28512d"
      })
      .setScrollFactor(0)
      .setDepth(42);

    this.pulseBox = scene.add
      .rectangle(480, 46, 236, 48, 0x17331f, 0.94)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(3, 0xf7efc8, 1)
      .setVisible(false);

    this.pulseTitle = scene.add
      .text(480, 33, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "13px",
        color: "#fff7d8"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(51)
      .setVisible(false);

    this.pulseDetail = scene.add
      .text(480, 50, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "11px",
        color: "#dce9ff"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(51)
      .setVisible(false);

    this.eventBox = scene.add
      .rectangle(780, 106, 286, 58, 0xf7efc8, 0.98)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(58)
      .setStrokeStyle(4, 0x17331f, 1)
      .setVisible(false);

    this.eventIcon = scene.add
      .image(662, 106, "coin-normal")
      .setScrollFactor(0)
      .setDepth(59)
      .setScale(0.76)
      .setVisible(false);

    this.eventTitle = scene.add
      .text(704, 94, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "18px",
        color: "#17331f",
        stroke: "#fff7d8",
        strokeThickness: 3
      })
      .setScrollFactor(0)
      .setDepth(59)
      .setVisible(false);

    this.eventDetail = scene.add
      .text(704, 116, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "12px",
        color: "#3d522d"
      })
      .setScrollFactor(0)
      .setDepth(59)
      .setVisible(false);
  }

  update(
    snapshot: ScoreSnapshot,
    bestScore: number,
    wallState: WallState,
    shieldCharges = 0
  ): void {
    const wallPalette = this.getWallPalette(wallState);

    this.banner.setFillStyle(wallPalette.banner, 1);
    this.badge.setFillStyle(wallPalette.badge, 1);
    this.badgeText.setText(wallPalette.badgeLabel);
    this.wallChip.setFillStyle(wallPalette.chip, 1);

    this.scoreText.setText(`${snapshot.totalScore}`);
    this.detailText.setText(
      `DIST ${snapshot.distanceUnits}  SEEDS ${snapshot.normalCoins}/${snapshot.riskCoins}  BEST ${bestScore}`
    );
    this.shieldText.setText(`x${shieldCharges}`);
    this.wallText.setText(`WALL ${wallState.toUpperCase()}`);
  }

  setChapterProgress(chapterLabel: string, chapterDetail: string): void {
    this.chapterText.setText(chapterLabel);
    this.chapterDetailText.setText(chapterDetail);
  }

  showPulse(title: string, detail: string, accent = 0x54d55c, durationMs = 1200): void {
    this.pulseClearEvent?.remove(false);
    this.pulseBox.setFillStyle(accent, 1);
    this.pulseBox.setVisible(true);
    this.pulseTitle.setText(title).setVisible(true);
    this.pulseDetail.setText(detail).setVisible(true);

    this.pulseClearEvent = this.pulseBox.scene.time.delayedCall(durationMs, () => {
      this.pulseBox.setVisible(false);
      this.pulseTitle.setVisible(false);
      this.pulseDetail.setVisible(false);
    });
  }

  showEventFeedback({
    title,
    detail,
    accent,
    iconKey,
    durationMs = 1200
  }: {
    title: string;
    detail: string;
    accent: number;
    iconKey: string;
    durationMs?: number;
  }): void {
    this.eventClearEvent?.remove(false);
    this.eventBox.scene.tweens.killTweensOf([
      this.eventBox,
      this.eventIcon,
      this.eventTitle,
      this.eventDetail
    ]);

    this.eventBox
      .setFillStyle(0xf7efc8, 0.98)
      .setStrokeStyle(4, accent, 1)
      .setVisible(true)
      .setAlpha(1)
      .setScale(0.92);
    this.eventIcon
      .setTexture(iconKey)
      .setVisible(true)
      .setAlpha(1)
      .setScale(0.9);
    this.eventTitle
      .setText(title)
      .setColor(`#${accent.toString(16).padStart(6, "0")}`)
      .setVisible(true)
      .setAlpha(1);
    this.eventDetail
      .setText(detail)
      .setVisible(true)
      .setAlpha(1);

    this.eventBox.scene.tweens.add({
      targets: [this.eventBox, this.eventIcon, this.eventTitle, this.eventDetail],
      scale: 1,
      duration: 160,
      ease: "Back.easeOut"
    });

    this.eventClearEvent = this.eventBox.scene.time.delayedCall(durationMs, () => {
      this.eventBox.scene.tweens.add({
        targets: [this.eventBox, this.eventIcon, this.eventTitle, this.eventDetail],
        alpha: 0,
        x: "+=8",
        duration: 180,
        ease: "Quad.easeIn",
        onComplete: () => {
          this.eventBox.setVisible(false).setAlpha(1).setX(780);
          this.eventIcon.setVisible(false).setAlpha(1).setX(662);
          this.eventTitle.setVisible(false).setAlpha(1).setX(704);
          this.eventDetail.setVisible(false).setAlpha(1).setX(704);
        }
      });
    });
  }

  private getWallPalette(wallState: WallState): {
    banner: number;
    badge: number;
    badgeLabel: string;
    chip: number;
  } {
    switch (wallState) {
      case "warning":
        return {
          banner: 0xffbe55,
          badge: 0xffe39d,
          badgeLabel: "WATCH",
          chip: 0xffcf74
        };
      case "sprint":
        return {
          banner: 0xff6d53,
          badge: 0xffb2a1,
          badgeLabel: "RUN",
          chip: 0xff9d82
        };
      case "recover":
        return {
          banner: 0x8ecbff,
          badge: 0xc4ebff,
          badgeLabel: "SAFE",
          chip: 0xb7e7ff
        };
      case "normal":
      default:
        return {
          banner: 0x54d55c,
          badge: 0x8ed8ff,
          badgeLabel: "RUN",
          chip: 0xffe39d
        };
    }
  }
}
