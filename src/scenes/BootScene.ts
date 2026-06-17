import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    const g = this.add.graphics({ x: 0, y: 0 });

    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 1, 1);
    g.generateTexture("pixel", 1, 1);
    g.clear();

    g.fillStyle(0x8d5e3d, 1);
    g.fillRect(0, 4, 32, 28);
    g.fillStyle(0x7ed36d, 1);
    g.fillRect(0, 0, 32, 8);
    g.lineStyle(2, 0x1f2a22, 1);
    g.strokeRect(0, 0, 32, 32);
    g.generateTexture("platform", 32, 32);
    g.clear();

    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(4, 6, 24, 36, 5);
    g.fillStyle(0x171717, 1);
    g.fillRect(10, 18, 4, 4);
    g.fillRect(18, 18, 4, 4);
    g.lineStyle(3, 0x171717, 1);
    g.strokeRoundedRect(4, 6, 24, 36, 5);
    g.generateTexture("player", 32, 48);
    g.clear();

    g.fillStyle(0xffdc55, 1);
    g.fillCircle(12, 12, 10);
    g.lineStyle(3, 0x7f5f00, 1);
    g.strokeCircle(12, 12, 10);
    g.generateTexture("coin-normal", 24, 24);
    g.clear();

    g.fillStyle(0xffef8e, 1);
    g.fillCircle(14, 14, 11);
    g.lineStyle(4, 0xe57128, 1);
    g.strokeCircle(14, 14, 11);
    g.lineStyle(2, 0xff9f43, 1);
    g.strokeCircle(14, 14, 14);
    g.generateTexture("coin-risk", 28, 28);
    g.clear();

    g.fillStyle(0xd73a31, 1);
    g.fillTriangle(0, 24, 12, 0, 24, 24);
    g.fillTriangle(20, 24, 32, 0, 44, 24);
    g.lineStyle(2, 0x300a0a, 1);
    g.strokeTriangle(0, 24, 12, 0, 24, 24);
    g.strokeTriangle(20, 24, 32, 0, 44, 24);
    g.generateTexture("spike", 44, 24);
    g.clear();

    g.fillStyle(0x4a0c10, 1);
    g.fillRect(0, 0, 72, 256);
    g.fillStyle(0xb51320, 1);
    for (let y = 0; y < 256; y += 22) {
      g.fillTriangle(72, y, 48, y + 11, 72, y + 22);
    }
    g.lineStyle(3, 0x210203, 1);
    g.strokeRect(0, 0, 72, 256);
    g.generateTexture("wall", 72, 256);
    g.destroy();

    this.scene.start("GameScene");
  }
}
