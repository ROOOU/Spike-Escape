import * as Phaser from "phaser";
import { VIEWPORT } from "../config/gameConfig";
import { PLAYER_CONFIG } from "../config/playerConfig";
import { GAME_SCENES } from "./scenes";

export function startGame(): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-root",
    width: VIEWPORT.width,
    height: VIEWPORT.height,
    backgroundColor: "#050906",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [...GAME_SCENES],
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: PLAYER_CONFIG.worldGravityY },
        debug: false
      }
    },
    render: {
      pixelArt: true,
      antialias: false
    }
  });
}
