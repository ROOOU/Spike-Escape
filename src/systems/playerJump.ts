export interface VariableJumpCutInput {
  velocityY: number;
  jumpHeld: boolean;
  wasJumpHeld: boolean;
  shortHopVelocity: number;
}

export function resolveVariableJumpVelocityY({
  velocityY,
  jumpHeld,
  wasJumpHeld,
  shortHopVelocity
}: VariableJumpCutInput): number {
  const jumpWasReleased = wasJumpHeld && !jumpHeld;

  if (jumpWasReleased && velocityY < -shortHopVelocity) {
    return -shortHopVelocity;
  }

  return velocityY;
}
