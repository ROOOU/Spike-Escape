import * as Phaser from "phaser";

function pixelRect(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number
): void {
  graphics.fillStyle(color, 1);
  graphics.fillRect(x, y, width, height);
}

export function createGeneratedTextures(scene: Phaser.Scene): void {
  const g = scene.add.graphics({ x: 0, y: 0 });

  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 1, 1);
  g.generateTexture("pixel", 1, 1);
  g.clear();

  g.fillStyle(0x1388dc, 1);
  g.fillRect(0, 0, 64, 64);
  g.generateTexture("sky-chip", 64, 64);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 56, 48);
  g.fillStyle(0x9a4e00, 1);
  g.fillRect(2, 8, 52, 38);
  g.fillStyle(0x00b51f, 1);
  g.fillRect(2, 0, 52, 10);
  for (let i = 0; i < 14; i += 1) {
    const x = 4 + (i * 7) % 46;
    const y = 14 + (i % 3) * 5;
    pixelRect(g, x, y, 2, 2, 0x7a3e00);
  }
  g.fillStyle(0x00d02a, 1);
  g.fillRect(0, 0, 56, 4);
  g.generateTexture("platform", 56, 48);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(10, 0, 8, 8);
  g.fillRect(4, 8, 20, 8);
  g.fillRect(0, 16, 28, 8);
  g.fillStyle(0x007f20, 1);
  g.fillRect(12, 0, 4, 8);
  g.fillRect(8, 8, 12, 8);
  g.fillRect(4, 16, 20, 8);
  g.generateTexture("spike", 28, 24);
  g.clear();

  g.fillStyle(0x007f20, 1);
  g.fillRect(8, 18, 4, 12);
  g.fillRect(14, 10, 4, 20);
  g.fillStyle(0xff3a30, 1);
  g.fillRect(0, 6, 10, 10);
  g.fillRect(8, 0, 10, 10);
  g.fillRect(16, 6, 10, 10);
  g.fillRect(8, 12, 10, 10);
  g.generateTexture("flower", 26, 30);
  g.clear();

  g.fillStyle(0x007f20, 1);
  g.fillRect(12, 8, 4, 20);
  g.fillRect(4, 14, 8, 4);
  g.fillRect(16, 14, 8, 4);
  g.generateTexture("grass-tuft", 28, 28);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 72, 256);
  g.fillStyle(0x9a4e00, 1);
  g.fillRect(2, 6, 68, 248);
  g.fillStyle(0x00b51f, 1);
  g.fillRect(2, 0, 68, 8);
  g.fillStyle(0xb86608, 1);
  for (let y = 18; y < 240; y += 20) {
    g.fillTriangle(70, y, 50, y + 10, 70, y + 20);
  }
  g.generateTexture("wall", 72, 256);
  g.destroy();
}
