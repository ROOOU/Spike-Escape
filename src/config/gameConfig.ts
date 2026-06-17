export const VIEWPORT = {
  width: 960,
  height: 540
} as const;

export const WORLD_CONFIG = {
  tileSize: 32,
  groundTop: 420,
  floorKillY: 760,
  spawnAheadDistance: 2400,
  recycleBehindDistance: 760,
  cameraLead: 360,
  worldBounds: {
    x: -1024,
    y: 0,
    width: 200000,
    height: 1800
  }
} as const;
