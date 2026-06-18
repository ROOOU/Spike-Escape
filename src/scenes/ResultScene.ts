import * as Phaser from "phaser";
import { VIEWPORT } from "../config/gameConfig";
import { InputController } from "../systems/InputController";

interface ResultSceneData {
  score: number;
  distance: number;
  normalCoins: number;
  riskCoins: number;
  deathReason: string;
  bestScore: number;
  beatLabel?: string;
  chapterLabel?: string;
}

export class ResultScene extends Phaser.Scene {
  private inputController?: InputController;
  private restarting = false;

  constructor() {
    super("ResultScene");
  }

  create(data: ResultSceneData): void {
    this.restarting = false;
    this.inputController = new InputController(
      this,
      document.getElementById("touch-controls")
    );

    this.add
      .rectangle(0, 0, VIEWPORT.width, VIEWPORT.height, 0x6fcfff, 0.82)
      .setOrigin(0, 0);
    this.add
      .rectangle(0, 0, VIEWPORT.width, VIEWPORT.height, 0xeff8ff, 0.18)
      .setOrigin(0, 0);
    this.add
      .ellipse(760, 92, 122, 122, 0xfff0a8, 0.94)
      .setDepth(1);
    this.add
      .rectangle(0, 438, VIEWPORT.width, 102, 0x875024, 1)
      .setOrigin(0, 0)
      .setDepth(1);
    this.add
      .rectangle(0, 430, VIEWPORT.width, 16, 0x3acb4a, 1)
      .setOrigin(0, 0)
      .setDepth(2);

    this.add
      .rectangle(
        VIEWPORT.width / 2,
        VIEWPORT.height / 2,
        452,
        300,
        0xf7efc8,
        0.96
      )
      .setDepth(5)
      .setStrokeStyle(4, 0x22361f, 1);
    this.add
      .rectangle(
        VIEWPORT.width / 2,
        142,
        436,
        10,
        0x54d55c,
        1
      )
      .setDepth(6);

    this.add
      .image(332, 182, "tutorial-hazard")
      .setScale(1.4)
      .setDepth(6);
    this.add
      .image(628, 182, "tutorial-collect")
      .setScale(1.4)
      .setFlipX(true)
      .setDepth(6);

    this.add
      .text(VIEWPORT.width / 2, 160, "Run Over", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "42px",
        color: "#17331f"
      })
      .setOrigin(0.5)
      .setDepth(7);

    this.add
      .text(VIEWPORT.width / 2, 196, `${data.chapterLabel ?? "RUN 01"} · ${data.beatLabel ?? "SETUP"}`, {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "16px",
        color: "#3b6d3a"
      })
      .setOrigin(0.5)
      .setDepth(7);

    const summary = [
      `SCORE ${data.score}`,
      `DISTANCE ${data.distance}`,
      `FLOWERS ${data.normalCoins}/${data.riskCoins}`,
      `BEST ${data.bestScore}`,
      data.deathReason
    ].join("\n");

    this.add
      .text(VIEWPORT.width / 2, 246, summary, {
        align: "center",
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "20px",
        color: "#49603d",
        lineSpacing: 12
      })
      .setOrigin(0.5)
      .setDepth(7);

    const button = this.add
      .rectangle(VIEWPORT.width / 2, 386, 236, 58, 0xffd76c, 1)
      .setStrokeStyle(4, 0x22361f, 1)
      .setDepth(7)
      .setInteractive({ useHandCursor: true });
    const label = this.add
      .text(VIEWPORT.width / 2, 386, "PLAY AGAIN", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "24px",
        color: "#2b1800"
      })
      .setOrigin(0.5)
      .setDepth(8);

    button.on("pointerup", () => this.restartRun());
    label.setInteractive({ useHandCursor: true }).on("pointerup", () => this.restartRun());

    this.add
      .text(VIEWPORT.width / 2, 442, "PRESS SPACE OR TAP", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "16px",
        color: "#fff8dc"
      })
      .setOrigin(0.5)
      .setDepth(7);

    if (this.scale.width < 520) {
      this.add
        .rectangle(0, 456, VIEWPORT.width, 84, 0x8ed8ff, 0.18)
        .setOrigin(0, 0)
        .setDepth(4);
    }

    this.input.keyboard?.once("keydown-SPACE", () => this.restartRun());
    this.input.keyboard?.once("keydown-ENTER", () => this.restartRun());
    this.input.once("pointerdown", () => this.restartRun());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.inputController?.destroy();
      this.inputController = undefined;
    });
  }

  update(): void {
    if (this.inputController?.poll().restartPressed) {
      this.restartRun();
    }
  }

  private restartRun(): void {
    if (this.restarting) {
      return;
    }

    this.restarting = true;
    this.scene.stop("ResultScene");
    this.scene.stop("GameScene");
    this.scene.start("GameScene");
  }
}
