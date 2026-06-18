import { PLAYER_CONFIG } from "../config/playerConfig";
import type { InputSnapshot } from "./inputModel";

export function resolvePlayerTargetVelocityX(
  input: Pick<InputSnapshot, "left" | "right">
): number {
  if (input.left && !input.right) {
    return PLAYER_CONFIG.reverseRunSpeed;
  }

  if (input.right && !input.left) {
    return PLAYER_CONFIG.boostRunSpeed;
  }

  return PLAYER_CONFIG.idleSpeed;
}
