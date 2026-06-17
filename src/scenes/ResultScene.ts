import Phaser from "phaser";
import { VIEWPORT } from "../config/gameConfig";

interface ResultSceneData {
  score: number;
  distance: number;
  normalCoins: number;
  riskCoins: number;
  deathReason: string;
  bestScore: number;
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(data: ResultSceneData): void {
    this.add
      .rectangle(0, 0, VIEWPORT.width, VIEWPORT.height, 0x06070d, 0.72)
      .setOrigin(0, 0);

    this.add
      .rectangle(
        VIEWPORT.width / 2,
        VIEWPORT.height / 2,
        420,
        280,
        0x142238,
        0.96
      )
      .setStrokeStyle(3, 0xffd36b, 0.85);

    this.add
      .text(VIEWPORT.width / 2, 160, "Run Over", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "44px",
        color: "#fff5d8"
      })
      .setOrigin(0.5);

    const summary = [
      `Score ${data.score}`,
      `Distance ${data.distance}`,
      `Coins ${data.normalCoins}/${data.riskCoins}`,
      `Best ${data.bestScore}`,
      data.deathReason
    ].join("\n");

    this.add
      .text(VIEWPORT.width / 2, 246, summary, {
        align: "center",
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "20px",
        color: "#dce9ff",
        lineSpacing: 10
      })
      .setOrigin(0.5);

    const button = this.add
      .rectangle(VIEWPORT.width / 2, 382, 220, 54, 0xffc44c, 1)
      .setInteractive({ useHandCursor: true });
    const label = this.add
      .text(VIEWPORT.width / 2, 382, "Restart", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "28px",
        color: "#2b1800"
      })
      .setOrigin(0.5);

    button.on("pointerup", () => this.restartRun());
    label.setInteractive({ useHandCursor: true }).on("pointerup", () => this.restartRun());

    this.add
      .text(VIEWPORT.width / 2, 438, "Press R or tap Restart", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "16px",
        color: "#ffdc92"
      })
      .setOrigin(0.5);

    this.input.keyboard?.once("keydown-R", () => this.restartRun());
    this.input.keyboard?.once("keydown-SPACE", () => this.restartRun());
  }

  private restartRun(): void {
    this.scene.stop("ResultScene");
    this.scene.stop("GameScene");
    this.scene.start("GameScene");
  }
}
