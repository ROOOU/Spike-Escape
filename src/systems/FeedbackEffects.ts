import * as Phaser from "phaser";

function destroyOnComplete(target: Phaser.GameObjects.GameObject): () => void {
  return () => target.destroy();
}

export function spawnJumpDust(
  scene: Phaser.Scene,
  x: number,
  y: number,
  tint = 0xf7efc8,
  label?: string
): void {
  const dust = scene.add
    .image(x, y, "jump-dust")
    .setDepth(11)
    .setTint(tint)
    .setAlpha(1)
    .setScale(1.42);

  scene.tweens.add({
    targets: dust,
    x: x - 10,
    y: y + 4,
    scaleX: 2.25,
    scaleY: 1.08,
    alpha: 0,
    duration: 520,
    ease: "Quad.easeOut",
    onComplete: destroyOnComplete(dust)
  });

  if (label) {
    spawnFloatingLabel(scene, x + 10, y - 42, label, "#ffcf74", 18, 760);
  }
}

export function spawnFloatingLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color = "#fff7d8",
  fontSizePx = 16,
  durationMs = 520
): void {
  const label = scene.add
    .text(x, y, text, {
      fontFamily: "Trebuchet MS, Avenir Next, sans-serif",
      fontSize: `${fontSizePx}px`,
      color,
      stroke: "#17331f",
      strokeThickness: 4
    })
    .setOrigin(0.5)
    .setDepth(30);

  scene.tweens.add({
    targets: label,
    y: y - 34,
    alpha: 0,
    scale: 1.16,
    duration: durationMs,
    ease: "Quad.easeOut",
    onComplete: destroyOnComplete(label)
  });
}

export function spawnCollectBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  risk: boolean
): void {
  const burst = scene.add
    .image(x, y, "collect-burst")
    .setDepth(32)
    .setTint(risk ? 0xffcf74 : 0x8ed8ff)
    .setAlpha(1)
    .setScale(risk ? 1.45 : 1.2);

  scene.tweens.add({
    targets: burst,
    angle: risk ? 80 : -52,
    scale: risk ? 2.35 : 1.85,
    alpha: 0,
    duration: 700,
    ease: "Back.easeOut",
    onComplete: destroyOnComplete(burst)
  });

  const sparkleColor = risk ? 0xfff1a6 : 0xc7efff;
  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI * 2 * index) / 6;
    const sparkle = scene.add
      .rectangle(x, y, risk ? 8 : 6, risk ? 8 : 6, sparkleColor, 0.95)
      .setDepth(33);
    scene.tweens.add({
      targets: sparkle,
      x: x + Math.cos(angle) * (risk ? 34 : 26),
      y: y + Math.sin(angle) * (risk ? 30 : 22),
      alpha: 0,
      scale: 0.35,
      duration: risk ? 640 : 520,
      ease: "Quad.easeOut",
      onComplete: destroyOnComplete(sparkle)
    });
  }
}

export function spawnStompBurst(scene: Phaser.Scene, x: number, y: number): void {
  const pop = scene.add
    .image(x, y, "stomp-pop")
    .setDepth(13)
    .setAlpha(0.88)
    .setScale(0.76);

  scene.tweens.add({
    targets: pop,
    y: y - 8,
    scaleX: 1.26,
    scaleY: 0.9,
    alpha: 0,
    duration: 320,
    ease: "Back.easeOut",
    onComplete: destroyOnComplete(pop)
  });

  spawnFloatingLabel(scene, x, y - 16, "STOMP", "#ffcf74");
}
