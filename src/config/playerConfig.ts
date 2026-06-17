export const PLAYER_CONFIG = {
  width: 32,
  height: 48,
  bodyInsetX: 6,
  bodyInsetY: 4,
  startX: 160,
  startY: 350,
  baseRunSpeed: 220,
  boostRunSpeed: 300,
  reverseRunSpeed: -170,
  horizontalResponsiveness: 10,
  jumpVelocity: 420,
  gravity: 900,
  maxFallSpeed: 650,
  coyoteTimeMs: 100,
  jumpBufferMs: 120,
  minLandingWidth: 72
} as const;
