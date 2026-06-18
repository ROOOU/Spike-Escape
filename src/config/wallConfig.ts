export const WALL_CONFIG = {
  width: 72,
  initialOffset: 260,
  dangerDistance: 220,
  baseAdvanceSpeed: 220,
  normalSpeedFactor: 0.75,
  chaseSpeedFactor: 0.95,
  sprintSpeedFactor: 1.2,
  warningDurationMs: 1000,
  sprintDurationMs: 800,
  recoverDurationMs: 1000,
  cooldownMs: 10000,
  noSprintDurationMs: 30000
} as const;
