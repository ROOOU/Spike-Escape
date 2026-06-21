import { PLAYER_CONFIG } from "../config/playerConfig";
import type { InputSnapshot } from "./inputModel";

export function resolvePlayerTargetVelocityX(
  input: Pick<InputSnapshot, "left" | "right">,
  speedScale = 1
): number {
  const safeScale = Number.isFinite(speedScale) ? Math.max(0.1, speedScale) : 1;

  if (input.left && !input.right) {
    return PLAYER_CONFIG.reverseRunSpeed * safeScale;
  }

  if (input.right && !input.left) {
    return PLAYER_CONFIG.boostRunSpeed * safeScale;
  }

  return PLAYER_CONFIG.idleSpeed;
}
