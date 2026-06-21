import { deriveJumpPhysics } from "../utils/jumpPhysics";

export const PLAYER_PHYSICS_DESIGN = {
  jumpHeightPx: 120,
  shortHopHeightPx: 48,
  timeToApexSec: 0.5,
  forwardSpeedPxPerSec: 300,
  reverseSpeedPxPerSec: 170,
  airControlFactor: 0.9,
  practicalSpeedFactor: 0.78,
  controlledSpeedFactor: 0.92
} as const;

export const PLAYER_JUMP_PHYSICS = deriveJumpPhysics(PLAYER_PHYSICS_DESIGN);

export const PLAYER_CONFIG = {
  visualWidth: 32,
  visualHeight: 64,
  hitboxWidth: 20,
  hitboxHeight: 40,
  hitboxOffsetY: 20,
  startX: 160,
  startY: 350,
  idleSpeed: 0,
  boostRunSpeed: PLAYER_PHYSICS_DESIGN.forwardSpeedPxPerSec,
  reverseRunSpeed: -PLAYER_PHYSICS_DESIGN.reverseSpeedPxPerSec,
  facingDeadZone: 10,
  horizontalResponsiveness: 16,
  airControlFactor: PLAYER_PHYSICS_DESIGN.airControlFactor,
  jumpHeightPx: PLAYER_JUMP_PHYSICS.jumpHeightPx,
  shortHopHeightPx: PLAYER_JUMP_PHYSICS.shortHopHeightPx,
  timeToApexSec: PLAYER_JUMP_PHYSICS.timeToApexSec,
  sameHeightAirTimeSec: PLAYER_JUMP_PHYSICS.sameHeightAirTimeSec,
  shortHopSameHeightAirTimeSec:
    PLAYER_JUMP_PHYSICS.shortHopSameHeightAirTimeSec,
  sameHeightPracticalReachPx: PLAYER_JUMP_PHYSICS.sameHeightPracticalReachPx,
  practicalJumpSpeedFactor: PLAYER_PHYSICS_DESIGN.practicalSpeedFactor,
  controlledJumpSpeedFactor: PLAYER_PHYSICS_DESIGN.controlledSpeedFactor,
  jumpVelocity: PLAYER_JUMP_PHYSICS.jumpVelocity,
  shortHopVelocity: PLAYER_JUMP_PHYSICS.shortHopVelocity,
  gravity: PLAYER_JUMP_PHYSICS.gravity,
  worldGravityY: 0,
  maxFallSpeed: 650,
  coyoteTimeMs: 160,
  jumpBufferMs: 190,
  minLandingWidth: 96
} as const;
