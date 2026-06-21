export interface JumpPhysicsDesign {
  jumpHeightPx: number;
  shortHopHeightPx: number;
  timeToApexSec: number;
  forwardSpeedPxPerSec: number;
  practicalSpeedFactor: number;
  controlledSpeedFactor: number;
}

export interface JumpPhysicsEnvelope {
  jumpHeightPx: number;
  shortHopHeightPx: number;
  timeToApexSec: number;
  gravity: number;
  jumpVelocity: number;
  shortHopVelocity: number;
  sameHeightAirTimeSec: number;
  shortHopSameHeightAirTimeSec: number;
  sameHeightFullSpeedReachPx: number;
  sameHeightPracticalReachPx: number;
  sameHeightControlledReachPx: number;
}

function assertPositive(name: string, value: number): void {
  if (value <= 0) {
    throw new Error(`${name} must be positive.`);
  }
}

export function deriveJumpPhysics(
  design: JumpPhysicsDesign
): JumpPhysicsEnvelope {
  assertPositive("jumpHeightPx", design.jumpHeightPx);
  assertPositive("shortHopHeightPx", design.shortHopHeightPx);
  assertPositive("timeToApexSec", design.timeToApexSec);
  assertPositive("forwardSpeedPxPerSec", design.forwardSpeedPxPerSec);
  assertPositive("practicalSpeedFactor", design.practicalSpeedFactor);
  assertPositive("controlledSpeedFactor", design.controlledSpeedFactor);
  if (design.shortHopHeightPx >= design.jumpHeightPx) {
    throw new Error("shortHopHeightPx must be below jumpHeightPx.");
  }

  const gravity =
    (2 * design.jumpHeightPx) /
    (design.timeToApexSec * design.timeToApexSec);
  const jumpVelocity = (2 * design.jumpHeightPx) / design.timeToApexSec;
  const shortHopVelocity = Math.sqrt(2 * gravity * design.shortHopHeightPx);
  const sameHeightAirTimeSec = design.timeToApexSec * 2;
  const shortHopSameHeightAirTimeSec = (2 * shortHopVelocity) / gravity;

  return {
    jumpHeightPx: design.jumpHeightPx,
    shortHopHeightPx: design.shortHopHeightPx,
    timeToApexSec: design.timeToApexSec,
    gravity,
    jumpVelocity,
    shortHopVelocity,
    sameHeightAirTimeSec,
    shortHopSameHeightAirTimeSec,
    sameHeightFullSpeedReachPx:
      design.forwardSpeedPxPerSec * sameHeightAirTimeSec,
    sameHeightPracticalReachPx:
      design.forwardSpeedPxPerSec *
      design.practicalSpeedFactor *
      sameHeightAirTimeSec,
    sameHeightControlledReachPx:
      design.forwardSpeedPxPerSec *
      design.controlledSpeedFactor *
      sameHeightAirTimeSec
  };
}

export function flightTimeForVerticalDelta(
  verticalDeltaPx: number,
  gravity: number,
  jumpVelocity: number
): number | null {
  const discriminant =
    jumpVelocity * jumpVelocity + 2 * gravity * verticalDeltaPx;

  if (discriminant < -0.000001) {
    return null;
  }

  return (jumpVelocity + Math.sqrt(Math.max(0, discriminant))) / gravity;
}

export function horizontalReach(
  speedPxPerSec: number,
  flightTimeSec: number,
  speedFactor = 1
): number {
  return speedPxPerSec * speedFactor * flightTimeSec;
}
