import Phaser from "phaser";
import type { ScoreSnapshot } from "../systems/scoreTracker";
import type { WallState } from "../systems/wallMachine";

export class HUD {
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly detailText: Phaser.GameObjects.Text;
  private readonly wallText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    scene.add
      .rectangle(18, 18, 320, 104, 0x142238, 0.74)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(40)
      .setStrokeStyle(2, 0xf8f3d8, 0.35);

    this.scoreText = scene.add
      .text(32, 28, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "28px",
        color: "#fff8de"
      })
      .setScrollFactor(0)
      .setDepth(41);

    this.detailText = scene.add
      .text(32, 62, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "16px",
        color: "#dce9ff"
      })
      .setScrollFactor(0)
      .setDepth(41);

    this.wallText = scene.add
      .text(32, 94, "", {
        fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
        fontSize: "14px",
        color: "#ffcf80"
      })
      .setScrollFactor(0)
      .setDepth(41);
  }

  update(snapshot: ScoreSnapshot, bestScore: number, wallState: WallState): void {
    this.scoreText.setText(`Score ${snapshot.totalScore}`);
    this.detailText.setText(
      `Distance ${snapshot.distanceUnits}  Coins ${snapshot.normalCoins}/${snapshot.riskCoins}  Best ${bestScore}`
    );
    this.wallText.setText(`Wall ${wallState.toUpperCase()}  Risk coins are worth triple.`);
  }
}
