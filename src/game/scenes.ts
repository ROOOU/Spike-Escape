import { BootScene } from "../scenes/BootScene";
import { GameScene } from "../scenes/GameScene";
import { ResultScene } from "../scenes/ResultScene";

export const GAME_SCENES = [BootScene, GameScene, ResultScene] as const;
