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
  const generateTexture = g.generateTexture.bind(g);

  // Reference assets override generated placeholders; generated art remains as fallback.
  g.generateTexture = ((key: string, width: number, height: number) => {
    if (!scene.textures.exists(key)) {
      generateTexture(key, width, height);
    }

    return g;
  }) as Phaser.GameObjects.Graphics["generateTexture"];

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

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 64, 24);
  g.fillStyle(0xf7efc8, 1);
  for (let x = 2; x < 62; x += 12) {
    g.fillTriangle(x, 24, x + 6, 2, x + 12, 24);
  }
  g.fillStyle(0xff3a30, 1);
  g.fillRect(0, 20, 64, 4);
  g.generateTexture("spike-long", 64, 24);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 32, 10);
  g.fillStyle(0xffcf74, 1);
  g.fillRect(2, 2, 28, 6);
  g.fillStyle(0xff3a30, 1);
  for (let x = -4; x < 32; x += 10) {
    g.fillTriangle(x, 8, x + 8, 2, x + 12, 2);
  }
  g.generateTexture("spike-warning-base", 32, 10);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 2, 32, 8);
  g.fillStyle(0x6f3d1f, 1);
  g.fillRect(0, 3, 32, 2);
  g.fillRect(0, 7, 32, 2);
  g.fillStyle(0xffcf74, 1);
  for (let x = 4; x < 32; x += 12) {
    g.fillRect(x, 4, 4, 4);
  }
  g.generateTexture("patrol-rail-h", 32, 12);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(2, 0, 8, 32);
  g.fillStyle(0x6f3d1f, 1);
  g.fillRect(3, 0, 2, 32);
  g.fillRect(7, 0, 2, 32);
  g.fillStyle(0xffcf74, 1);
  for (let y = 4; y < 32; y += 12) {
    g.fillRect(4, y, 4, 4);
  }
  g.generateTexture("patrol-rail-v", 12, 32);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(4, 0, 24, 4);
  g.fillRect(0, 4, 32, 24);
  g.fillRect(4, 28, 24, 4);
  g.fillStyle(0x3b1240, 1);
  g.fillRect(4, 4, 24, 24);
  g.fillStyle(0xff3a30, 1);
  for (let i = 0; i < 8; i += 1) {
    const x = 4 + (i % 4) * 6;
    const y = 4 + Math.floor(i / 4) * 12;
    g.fillTriangle(x, y + 6, x + 4, y, x + 8, y + 6);
    g.fillTriangle(x, y + 6, x + 4, y + 12, x + 8, y + 6);
  }
  g.generateTexture("patrol-spike", 32, 32);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(10, 0, 12, 64);
  g.fillStyle(0x007f20, 1);
  g.fillRect(13, 0, 6, 64);
  g.fillStyle(0xff0077, 1);
  for (let y = 4; y < 60; y += 12) {
    g.fillTriangle(10, y, 0, y + 6, 10, y + 12);
    g.fillTriangle(22, y, 32, y + 6, 22, y + 12);
  }
  g.generateTexture("thorn-vine", 32, 64);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(8, 30, 48, 10);
  g.fillStyle(0x5a3218, 1);
  g.fillRect(12, 32, 40, 6);
  g.fillStyle(0xff3a30, 1);
  g.fillTriangle(16, 32, 24, 2, 32, 32);
  g.fillStyle(0xffcf74, 1);
  g.fillTriangle(26, 32, 34, 8, 44, 32);
  g.fillStyle(0xffffff, 0.9);
  g.fillRect(30, 18, 4, 8);
  g.generateTexture("flame-vent", 64, 40);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(2, 4, 34, 28);
  g.fillStyle(0x858585, 1);
  g.fillRect(4, 6, 30, 24);
  g.fillStyle(0xbdbdbd, 1);
  g.fillRect(8, 8, 10, 6);
  g.fillStyle(0x565656, 1);
  g.fillRect(20, 20, 10, 6);
  g.generateTexture("falling-rock", 38, 34);
  g.clear();

  g.fillStyle(0x000000, 0.5);
  g.fillRect(0, 8, 48, 8);
  g.fillStyle(0xffcf74, 0.55);
  g.fillRect(4, 6, 40, 4);
  g.generateTexture("falling-rock-shadow", 48, 18);
  g.clear();

  g.fillStyle(0x000000, 0.72);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0xffcf74, 0.32);
  g.fillRect(2, 2, 28, 28);
  g.fillStyle(0xff0077, 0.72);
  g.fillRect(6, 6, 20, 4);
  g.fillRect(6, 22, 20, 4);
  g.generateTexture("timed-warning-zone", 32, 32);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 4, 64, 18);
  g.fillStyle(0x6f3d1f, 1);
  g.fillRect(2, 6, 60, 14);
  g.fillStyle(0xa35200, 1);
  for (let x = 6; x < 58; x += 16) {
    g.fillRect(x, 8, 8, 4);
  }
  g.fillStyle(0xffcf74, 0.75);
  g.fillRect(12, 12, 4, 2);
  g.fillRect(44, 10, 4, 2);
  g.generateTexture("mud-pit", 64, 24);
  g.clear();

  g.fillStyle(0x000000, 0.5);
  g.fillRect(0, 4, 64, 10);
  g.fillStyle(0xffcf74, 0.35);
  g.fillRect(4, 6, 56, 6);
  g.generateTexture("mud-warning", 64, 18);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 64, 24);
  g.fillStyle(0x914900, 1);
  g.fillRect(2, 2, 60, 20);
  g.fillStyle(0xffcf74, 1);
  g.fillRect(8, 6, 18, 3);
  g.fillRect(30, 14, 20, 3);
  g.generateTexture("crumbling-platform", 64, 24);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(4, 4, 28, 20);
  g.fillRect(8, 24, 6, 6);
  g.fillRect(24, 24, 6, 6);
  g.fillStyle(0x7a3e00, 1);
  g.fillRect(6, 6, 24, 16);
  g.fillStyle(0xffcf74, 1);
  g.fillRect(10, 10, 5, 5);
  g.fillRect(22, 10, 5, 5);
  g.fillStyle(0x1d140c, 1);
  g.fillRect(12, 12, 2, 2);
  g.fillRect(24, 12, 2, 2);
  g.fillStyle(0x00b51f, 1);
  g.fillRect(8, 2, 20, 4);
  g.generateTexture("stompable-enemy", 36, 30);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(4, 8, 30, 18);
  g.fillStyle(0x54d55c, 1);
  g.fillRect(6, 10, 26, 14);
  g.fillStyle(0xffffff, 1);
  g.fillRect(12, 12, 5, 5);
  g.fillRect(22, 12, 5, 5);
  g.fillStyle(0x000000, 1);
  g.fillRect(14, 14, 2, 2);
  g.fillRect(24, 14, 2, 2);
  g.fillStyle(0xff0077, 1);
  g.fillRect(14, 2, 10, 8);
  g.generateTexture("stomp-slime", 38, 28);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(8, 8, 28, 14);
  g.fillTriangle(8, 10, 0, 2, 0, 22);
  g.fillTriangle(36, 10, 48, 2, 48, 22);
  g.fillStyle(0x3b1240, 1);
  g.fillRect(10, 10, 24, 10);
  g.fillTriangle(8, 12, 2, 8, 2, 18);
  g.fillTriangle(36, 12, 44, 8, 44, 18);
  g.fillStyle(0xffffff, 1);
  g.fillRect(18, 12, 5, 5);
  g.fillRect(26, 12, 5, 5);
  g.generateTexture("bat", 48, 26);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(2, 10, 34, 20);
  g.fillStyle(0x7a3e00, 1);
  g.fillRect(4, 12, 30, 16);
  g.fillStyle(0xffffff, 1);
  g.fillRect(12, 14, 5, 5);
  g.fillRect(22, 14, 5, 5);
  g.fillStyle(0x000000, 1);
  g.fillRect(14, 16, 2, 2);
  g.fillRect(24, 16, 2, 2);
  g.generateTexture("mole", 38, 32);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(14, 20, 8, 18);
  g.fillStyle(0x007f20, 1);
  g.fillRect(16, 20, 4, 18);
  g.fillStyle(0xff0077, 1);
  g.fillRect(4, 4, 28, 22);
  g.fillStyle(0x000000, 1);
  g.fillRect(12, 12, 12, 8);
  g.fillStyle(0xffcf74, 1);
  g.fillRect(24, 14, 10, 4);
  g.generateTexture("flower-turret", 38, 42);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(2, 8, 38, 18);
  g.fillStyle(0x1d6f24, 1);
  g.fillRect(4, 10, 34, 14);
  g.fillStyle(0xffcf74, 1);
  g.fillRect(8, 14, 6, 5);
  g.fillRect(26, 14, 6, 5);
  g.fillStyle(0xffffff, 1);
  g.fillRect(16, 6, 10, 4);
  g.generateTexture("beetle", 42, 30);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 64, 38);
  g.fillStyle(0x5a3218, 1);
  g.fillRect(4, 4, 56, 26);
  g.fillStyle(0x8b5a2b, 1);
  for (let x = 8; x < 56; x += 12) {
    g.fillRect(x, 8, 6, 4);
    g.fillRect(x + 3, 20, 6, 4);
  }
  g.fillStyle(0xff3a30, 1);
  for (let x = 4; x < 60; x += 10) {
    g.fillTriangle(x, 30, x + 5, 38, x + 10, 30);
  }
  g.generateTexture("crusher", 64, 38);
  g.clear();

  g.fillStyle(0x000000, 0.72);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0xff7048, 0.38);
  g.fillRect(2, 2, 28, 28);
  g.fillStyle(0xffcf74, 0.82);
  for (let x = -20; x < 36; x += 12) {
    g.fillTriangle(x, 30, x + 10, 2, x + 16, 2);
    g.fillTriangle(x + 4, 30, x + 14, 30, x + 20, 12);
  }
  g.generateTexture("crusher-warning-zone", 32, 32);
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

  g.fillStyle(0x000000, 0.35);
  g.fillRect(2, 6, 36, 4);
  g.fillStyle(0xf7efc8, 0.9);
  g.fillRect(4, 4, 10, 4);
  g.fillRect(18, 2, 8, 4);
  g.fillRect(28, 5, 8, 3);
  g.generateTexture("jump-dust", 40, 12);
  g.clear();

  g.fillStyle(0xffffff, 0.88);
  g.fillRect(12, 0, 4, 8);
  g.fillRect(12, 20, 4, 8);
  g.fillRect(0, 12, 8, 4);
  g.fillRect(20, 12, 8, 4);
  g.fillStyle(0xffcf74, 0.86);
  g.fillRect(10, 10, 8, 8);
  g.generateTexture("collect-burst", 28, 28);
  g.clear();

  g.fillStyle(0x000000, 0.62);
  g.fillRect(2, 8, 32, 8);
  g.fillStyle(0xffcf74, 0.95);
  g.fillRect(4, 6, 28, 8);
  g.fillStyle(0xffffff, 0.92);
  g.fillRect(8, 2, 4, 6);
  g.fillRect(24, 2, 4, 6);
  g.generateTexture("stomp-pop", 36, 18);
  g.clear();

  g.fillStyle(0x000000, 0.95);
  g.fillCircle(18, 18, 18);
  g.fillStyle(0x2fb9eb, 0.78);
  g.fillCircle(18, 18, 15);
  g.fillStyle(0xffffff, 0.92);
  g.fillRect(9, 8, 6, 4);
  g.generateTexture("bubble-shield", 36, 36);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 36, 28);
  g.fillStyle(0xf7efc8, 1);
  g.fillRect(4, 6, 8, 8);
  g.fillRect(24, 6, 8, 8);
  g.fillStyle(0xffcf74, 1);
  g.fillTriangle(14, 14, 8, 22, 20, 22);
  g.fillTriangle(22, 14, 16, 22, 28, 22);
  g.generateTexture("tutorial-left-right", 36, 28);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 36, 34);
  g.fillStyle(0xf7efc8, 1);
  g.fillRect(14, 6, 8, 18);
  g.fillStyle(0x8ed8ff, 1);
  g.fillTriangle(18, 2, 8, 14, 28, 14);
  g.fillRect(16, 22, 4, 8);
  g.generateTexture("tutorial-jump", 36, 34);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 40, 30);
  g.fillStyle(0xff9d82, 1);
  for (let x = 4; x < 36; x += 10) {
    g.fillTriangle(x, 26, x + 5, 6, x + 10, 26);
  }
  g.generateTexture("tutorial-hazard", 40, 30);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 42, 30);
  g.fillStyle(0x9a4e00, 1);
  g.fillRect(2, 18, 14, 8);
  g.fillRect(28, 18, 12, 8);
  g.fillStyle(0x54d55c, 1);
  g.fillRect(2, 14, 14, 4);
  g.fillRect(28, 14, 12, 4);
  g.generateTexture("tutorial-gap", 42, 30);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 36, 34);
  g.fillStyle(0xffcf74, 1);
  g.fillCircle(18, 16, 10);
  g.fillStyle(0xffffff, 1);
  g.fillRect(12, 8, 4, 4);
  g.fillRect(20, 8, 4, 4);
  g.generateTexture("tutorial-collect", 36, 34);
  g.clear();

  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, 36, 34);
  g.fillStyle(0x9a4e00, 1);
  g.fillRect(6, 4, 24, 26);
  g.fillStyle(0xff3a30, 1);
  for (let y = 8; y < 28; y += 10) {
    g.fillTriangle(30, y, 20, y + 5, 30, y + 10);
  }
  g.generateTexture("tutorial-wall", 36, 34);
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
