import * as Phaser from "phaser";
import { createGeneratedTextures } from "../assets/generatedTextures";
import { REFERENCE_ASSETS } from "../assets/referenceAssets";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    REFERENCE_ASSETS.forEach((asset) => {
      this.load.image(asset.key, asset.path);
    });
  }

  create(): void {
    createGeneratedTextures(this);
    this.scene.start("GameScene");
  }
}
