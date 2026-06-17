import Phaser from "phaser";
import "./styles.css";
import { VIEWPORT } from "./config/gameConfig";
import { PLAYER_CONFIG } from "./config/playerConfig";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { ResultScene } from "./scenes/ResultScene";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-root",
  width: VIEWPORT.width,
  height: VIEWPORT.height,
  backgroundColor: "#87d5ff",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, GameScene, ResultScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: PLAYER_CONFIG.gravity },
      debug: false
    }
  },
  render: {
    pixelArt: true,
    antialias: false
  }
});

window.addEventListener("beforeunload", () => {
  game.destroy(true);
});
