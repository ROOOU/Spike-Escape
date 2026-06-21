import { WORLD_CONFIG } from "./gameConfig";
import type { SegmentDefinition } from "../types/segments";

const ground = WORLD_CONFIG.groundTop;
const lip = ground - 16;
const hop = ground - 32;
const ledge = ground - 48;

export const START_SEGMENT: SegmentDefinition = {
  id: "start-runway",
  length: 960,
  difficulty: 0,
  weight: 1,
  pressure: "recovery",
  role: "onboarding",
  paceTier: "onboarding",
  allowWallSprint: false,
  metadata: {
    chapter: 1,
    pacingBeat: "setup",
    decorDensity: 0.75,
    themeTag: "meadow",
    hazardBudget: 1,
    enemyBudget: 0,
    reactionDistancePx: 160,
    routeType: "main",
    notes: ["Starting safety runway."]
  },
  platforms: [
    { x: 0, y: ground, width: 960, height: 32, mainPath: true }
  ],
  hazards: [],
  coins: [
    { x: 280, y: 360, type: "normal" },
    { x: 384, y: 344, type: "normal" },
    { x: 488, y: 344, type: "normal" },
    { x: 592, y: 360, type: "normal" }
  ]
};

export const SEGMENT_CATALOG: SegmentDefinition[] = [
  {
    id: "safe-runway",
    length: 640,
    difficulty: 1,
    weight: 5,
    pressure: "medium",
    role: "runway",
    paceTier: "early",
    allowWallSprint: false,
    metadata: {
      chapter: 1,
      pacingBeat: "build",
      decorDensity: 0.7,
      introOrder: 0,
      unlockDistancePx: 800,
      themeTag: "thorn",
      hazardBudget: 1,
      enemyBudget: 0,
      reactionDistancePx: 180,
      routeType: "main",
      notes: ["First low thorn appears around DIST 34."]
    },
    platforms: [
      { x: 0, y: ground, width: 640, height: 32, mainPath: true }
    ],
    hazards: [
      { x: 300, y: ground - 24, width: 48, height: 24, kind: "spike" }
    ],
    coins: [
      { x: 164, y: 360, type: "normal" },
      { x: 304, y: 326, type: "normal" },
      { x: 458, y: 360, type: "normal" }
    ]
  },
  {
    id: "single-gap",
    length: 640,
    difficulty: 1,
    weight: 4,
    pressure: "medium",
    role: "gap",
    paceTier: "early",
    allowWallSprint: false,
    metadata: {
      chapter: 1,
      pacingBeat: "build",
      decorDensity: 0.45,
      introOrder: 1,
      unlockDistancePx: 960,
      themeTag: "meadow",
      hazardBudget: 1,
      enemyBudget: 0,
      reactionDistancePx: 180,
      routeType: "main"
    },
    platforms: [
      { x: 0, y: ground, width: 272, height: 32, mainPath: true },
      { x: 328, y: lip, width: 208, height: 32, mainPath: true },
      { x: 528, y: ground, width: 112, height: 32, mainPath: true }
    ],
    hazards: [
      { x: 578, y: ground - 24, width: 40, height: 24, kind: "spike" }
    ],
    coins: [
      { x: 292, y: 354, type: "normal" },
      { x: 330, y: 330, type: "normal" },
      { x: 372, y: 314, type: "normal" }
    ]
  },
  {
    id: "coin-arc",
    length: 672,
    difficulty: 1,
    weight: 4,
    pressure: "medium",
    role: "gap",
    paceTier: "early",
    allowWallSprint: false,
    metadata: {
      chapter: 1,
      pacingBeat: "reward",
      decorDensity: 0.55,
      introOrder: 2,
      unlockDistancePx: 2000,
      themeTag: "meadow",
      hazardBudget: 1,
      enemyBudget: 0,
      reactionDistancePx: 180,
      routeType: "main"
    },
    platforms: [
      { x: 0, y: ground, width: 256, height: 32, mainPath: true },
      { x: 320, y: hop, width: 184, height: 32, mainPath: true },
      { x: 464, y: ground, width: 208, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 268, y: 350, type: "normal" },
      { x: 306, y: 326, type: "normal" },
      { x: 348, y: 302, type: "normal" },
      { x: 392, y: 314, type: "normal" }
    ]
  },
  {
    id: "twin-gap",
    length: 736,
    difficulty: 2,
    weight: 3,
    pressure: "high",
    role: "gap",
    paceTier: "mid",
    allowWallSprint: false,
    metadata: {
      chapter: 2,
      pacingBeat: "pressure",
      decorDensity: 0.45,
      consecutivePits: true,
      unlockDistancePx: 5200,
      themeTag: "meadow",
      hazardBudget: 1,
      enemyBudget: 0,
      reactionDistancePx: 160,
      routeType: "main"
    },
    platforms: [
      { x: 0, y: ground, width: 168, height: 32, mainPath: true },
      { x: 264, y: lip, width: 160, height: 32, mainPath: true },
      { x: 488, y: ground, width: 248, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 216, y: 336, type: "normal" },
      { x: 456, y: 328, type: "risk", routeType: "optional" }
    ]
  },
  {
    id: "stair-step",
    length: 704,
    difficulty: 2,
    weight: 3,
    pressure: "medium",
    role: "elevation",
    paceTier: "early",
    allowWallSprint: false,
    metadata: {
      chapter: 1,
      pacingBeat: "build",
      decorDensity: 0.55,
      introOrder: 4,
      unlockDistancePx: 3200,
      themeTag: "meadow",
      hazardBudget: 1,
      enemyBudget: 1,
      reactionDistancePx: 128,
      routeType: "main"
    },
    platforms: [
      { x: 0, y: ground, width: 216, height: 32, mainPath: true },
      { x: 288, y: hop, width: 176, height: 32, mainPath: true },
      { x: 512, y: ground - 64, width: 192, height: 32, mainPath: true }
    ],
    hazards: [],
    enemies: [
      {
        x: 132,
        y: ground - 30,
        width: 34,
        height: 30,
        kind: "stompable-ground",
        patrol: { distance: 48, durationMs: 1800 }
      }
    ],
    coins: [
      { x: 344, y: 330, type: "normal" },
      { x: 548, y: 292, type: "normal" },
      { x: 636, y: 292, type: "normal" }
    ]
  },
  {
    id: "spike-bridge",
    length: 768,
    difficulty: 2,
    weight: 3,
    pressure: "medium",
    role: "hazard",
    paceTier: "mid",
    allowWallSprint: false,
    metadata: {
      chapter: 2,
      pacingBeat: "pressure",
      decorDensity: 0.35,
      unlockDistancePx: 6400,
      themeTag: "thorn",
      hazardBudget: 3.25,
      enemyBudget: 0,
      reactionDistancePx: 180,
      routeType: "main"
    },
    platforms: [
      { x: 0, y: ground, width: 224, height: 32, mainPath: true },
      { x: 304, y: ground - 64, width: 176, height: 32, mainPath: true },
      { x: 560, y: ground, width: 208, height: 32, mainPath: true }
    ],
    hazards: [
      { x: 220, y: ground - 24, width: 236, height: 24, kind: "spike" },
      {
        x: 326,
        y: ground - 96,
        width: 32,
        height: 32,
        kind: "patrol-spike",
        patrol: { axis: "x", distance: 104, durationMs: 1900 }
      }
    ],
    coins: [
      { x: 392, y: 292, type: "normal" },
      { x: 454, y: 302, type: "risk", routeType: "optional" }
    ]
  },
  {
    id: "narrow-landing",
    length: 736,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    role: "precision",
    paceTier: "mid",
    allowWallSprint: false,
    metadata: {
      chapter: 2,
      pacingBeat: "reward",
      decorDensity: 0.25,
      unlockDistancePx: 6400,
      themeTag: "treasure",
      hazardBudget: 1,
      enemyBudget: 1,
      reactionDistancePx: 180,
      routeType: "main"
    },
    platforms: [
      { x: 0, y: ground, width: 240, height: 32, mainPath: true },
      { x: 336, y: ledge, width: 160, height: 32, mainPath: true },
      { x: 512, y: ground, width: 224, height: 32, mainPath: true }
    ],
    hazards: [],
    enemies: [
      {
        x: 568,
        y: ground - 30,
        width: 34,
        height: 30,
        kind: "stompable-ground",
        patrol: { distance: 56, durationMs: 1700, phaseMs: 240 }
      }
    ],
    coins: [
      { x: 380, y: 314, type: "risk", routeType: "optional" }
    ]
  },
  {
    id: "spike-garden-intro",
    length: 768,
    difficulty: 2,
    weight: 3,
    pressure: "medium",
    role: "hazard",
    paceTier: "mid",
    allowWallSprint: false,
    metadata: {
      chapter: 2,
      pacingBeat: "pressure",
      decorDensity: 0.35,
      unlockDistancePx: 3200,
      themeTag: "thorn",
      hazardBudget: 1,
      enemyBudget: 1,
      reactionDistancePx: 180,
      routeType: "main",
      notes: ["First static thorn read."]
    },
    platforms: [
      { x: 0, y: ground, width: 768, height: 32, mainPath: true }
    ],
    hazards: [
      { x: 352, y: ground - 24, width: 72, height: 24, kind: "spike" }
    ],
    enemies: [
      {
        x: 536,
        y: ground - 30,
        width: 34,
        height: 30,
        kind: "stompable-ground"
      }
    ],
    coins: [
      { x: 244, y: 360, type: "normal" },
      { x: 390, y: 326, type: "normal" },
      { x: 558, y: 360, type: "normal" }
    ]
  },
  {
    id: "risk-ribbon",
    length: 768,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    role: "hazard",
    paceTier: "late",
    allowWallSprint: false,
    metadata: {
      chapter: 3,
      pacingBeat: "climax",
      decorDensity: 0.3,
      unlockDistancePx: 13000,
      themeTag: "treasure",
      hazardBudget: 4,
      enemyBudget: 1,
      reactionDistancePx: 150,
      routeType: "main"
    },
    platforms: [
      { x: 0, y: ground, width: 240, height: 32, mainPath: true },
      { x: 336, y: ground - 64, width: 128, height: 32, mainPath: true },
      { x: 512, y: ground, width: 256, height: 32, mainPath: true }
    ],
    hazards: [
      {
        x: 272,
        y: ground - 24,
        width: 72,
        height: 24,
        kind: "spike",
        routeType: "optional"
      },
      {
        x: 608,
        y: ground - 132,
        width: 64,
        height: 38,
        kind: "crusher",
        crusher: {
          distance: 94,
          warningMs: 700,
          slamMs: 240,
          holdMs: 360,
          returnMs: 780,
          phaseMs: 280
        }
      }
    ],
    enemies: [
      {
        x: 150,
        y: ground - 30,
        width: 34,
        height: 30,
        kind: "stompable-ground",
        patrol: { distance: 52, durationMs: 1500 }
      }
    ],
    coins: [
      { x: 400, y: 308, type: "risk", routeType: "optional" },
      { x: 642, y: 340, type: "normal" }
    ]
  },
  {
    id: "vertical-patrol-intro",
    length: 768,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    role: "hazard",
    paceTier: "late",
    allowWallSprint: false,
    metadata: {
      chapter: 3,
      pacingBeat: "pressure",
      decorDensity: 0.25,
      unlockDistancePx: 9000,
      themeTag: "thorn",
      hazardBudget: 2,
      enemyBudget: 0,
      reactionDistancePx: 180,
      routeType: "main",
      notes: ["Vertical thorns teach wait-and-pass timing."]
    },
    platforms: [
      { x: 0, y: ground, width: 768, height: 32, mainPath: true }
    ],
    hazards: [
      {
        x: 408,
        y: ground - 150,
        width: 32,
        height: 32,
        kind: "patrol-spike",
        patrol: { axis: "y", distance: 96, durationMs: 1900, phaseMs: 120 }
      }
    ],
    coins: [
      { x: 254, y: 360, type: "normal" },
      { x: 424, y: 330, type: "risk", routeType: "optional" },
      { x: 592, y: 360, type: "normal" }
    ]
  },
  {
    id: "crusher-intro",
    length: 832,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    role: "hazard",
    paceTier: "late",
    allowWallSprint: false,
    metadata: {
      chapter: 3,
      pacingBeat: "pressure",
      decorDensity: 0.25,
      unlockDistancePx: 11000,
      themeTag: "thorn",
      hazardBudget: 3,
      enemyBudget: 0,
      reactionDistancePx: 220,
      routeType: "main",
      notes: ["Thorn press telegraphs before blocking the lane."]
    },
    platforms: [
      { x: 0, y: ground, width: 832, height: 32, mainPath: true }
    ],
    hazards: [
      {
        x: 512,
        y: ground - 140,
        width: 64,
        height: 38,
        kind: "crusher",
        crusher: {
          distance: 102,
          warningMs: 820,
          slamMs: 240,
          holdMs: 360,
          returnMs: 780,
          phaseMs: 160
        }
      }
    ],
    coins: [
      { x: 350, y: 360, type: "normal" },
      { x: 548, y: 340, type: "risk", routeType: "optional" },
      { x: 694, y: 360, type: "normal" }
    ]
  },
  {
    id: "recovery-lane",
    length: 704,
    difficulty: 1,
    weight: 3,
    pressure: "recovery",
    role: "recovery",
    paceTier: "early",
    allowWallSprint: false,
    metadata: {
      chapter: 1,
      pacingBeat: "recovery",
      decorDensity: 0.7,
      introOrder: 3,
      unlockDistancePx: 2400,
      themeTag: "meadow",
      hazardBudget: 1,
      enemyBudget: 0,
      reactionDistancePx: 180,
      routeType: "main"
    },
    platforms: [
      { x: 0, y: ground, width: 704, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 180, y: 360, type: "normal" },
      { x: 308, y: 344, type: "normal" },
      { x: 470, y: 360, type: "normal" }
    ],
    pickups: [
      { x: 590, y: 388, kind: "bubble-shield" }
    ]
  },
  {
    id: "magnet-seed-lane",
    length: 768,
    difficulty: 2,
    weight: 2,
    pressure: "medium",
    role: "runway",
    paceTier: "mid",
    allowWallSprint: false,
    metadata: {
      chapter: 2,
      pacingBeat: "reward",
      decorDensity: 0.72,
      unlockDistancePx: 5600,
      themeTag: "treasure",
      hazardBudget: 1,
      enemyBudget: 0,
      reactionDistancePx: 220,
      routeType: "main",
      notes: ["Magnet star pulls nearby seeds without changing movement."]
    },
    platforms: [
      { x: 0, y: ground, width: 768, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 330, y: 344, type: "normal" },
      { x: 396, y: 318, type: "normal" },
      { x: 462, y: 344, type: "normal" },
      { x: 560, y: 360, type: "normal" }
    ],
    pickups: [
      { x: 246, y: 388, kind: "magnet", routeType: "optional" }
    ]
  },
  {
    id: "clock-breather",
    length: 768,
    difficulty: 1,
    weight: 2,
    pressure: "recovery",
    role: "recovery",
    paceTier: "mid",
    allowWallSprint: false,
    metadata: {
      chapter: 2,
      pacingBeat: "recovery",
      decorDensity: 0.78,
      unlockDistancePx: 7200,
      themeTag: "meadow",
      hazardBudget: 1,
      enemyBudget: 0,
      reactionDistancePx: 220,
      routeType: "main",
      notes: ["Clock spore briefly calms wall pressure."]
    },
    platforms: [
      { x: 0, y: ground, width: 768, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 202, y: 360, type: "normal" },
      { x: 440, y: 344, type: "normal" },
      { x: 598, y: 360, type: "normal" }
    ],
    pickups: [
      { x: 332, y: 388, kind: "clock-spore", routeType: "optional" }
    ]
  },
  {
    id: "wall-sprint-window",
    length: 832,
    difficulty: 2,
    weight: 3,
    pressure: "low",
    role: "sprint",
    paceTier: "early",
    allowWallSprint: true,
    metadata: {
      chapter: 1,
      pacingBeat: "build",
      decorDensity: 0.65,
      introOrder: 5,
      unlockDistancePx: 4000,
      themeTag: "meadow",
      hazardBudget: 1,
      enemyBudget: 0,
      reactionDistancePx: 180,
      routeType: "main"
    },
    platforms: [
      { x: 0, y: ground, width: 224, height: 32, mainPath: true },
      { x: 224, y: ground, width: 160, height: 32, mainPath: true },
      { x: 384, y: ground, width: 176, height: 32, mainPath: true },
      { x: 560, y: ground, width: 272, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 242, y: 360, type: "normal" },
      { x: 472, y: 344, type: "normal" },
      { x: 664, y: 360, type: "normal" }
    ]
  },
  {
    id: "long-spike-read",
    length: 704,
    difficulty: 1,
    weight: 3,
    pressure: "medium",
    role: "hazard",
    paceTier: "early",
    allowWallSprint: false,
    metadata: {
      chapter: 1,
      pacingBeat: "pressure",
      decorDensity: 0.45,
      unlockDistancePx: 1600,
      themeTag: "thorn",
      hazardBudget: 1.25,
      enemyBudget: 0,
      reactionDistancePx: 192,
      routeType: "main",
      notes: ["Long thorn strip teaches early commitment."]
    },
    platforms: [
      { x: 0, y: ground, width: 704, height: 32, mainPath: true }
    ],
    hazards: [
      { x: 272, y: ground - 24, width: 96, height: 24, kind: "spike-long" }
    ],
    coins: [
      { x: 164, y: 360, type: "normal" },
      { x: 312, y: 320, type: "normal" },
      { x: 510, y: 360, type: "normal" }
    ]
  },
  {
    id: "slime-garden",
    length: 736,
    difficulty: 2,
    weight: 3,
    pressure: "medium",
    role: "hazard",
    paceTier: "mid",
    allowWallSprint: false,
    metadata: {
      chapter: 2,
      pacingBeat: "build",
      decorDensity: 0.5,
      unlockDistancePx: 3200,
      themeTag: "meadow",
      hazardBudget: 1,
      enemyBudget: 1,
      reactionDistancePx: 220,
      routeType: "main",
      notes: ["Slime can be stomped or avoided."]
    },
    platforms: [
      { x: 0, y: ground, width: 736, height: 32, mainPath: true }
    ],
    hazards: [],
    enemies: [
      {
        x: 356,
        y: ground - 28,
        width: 38,
        height: 28,
        kind: "stomp-slime"
      }
    ],
    coins: [
      { x: 214, y: 360, type: "normal" },
      { x: 374, y: 318, type: "normal" },
      { x: 536, y: 360, type: "normal" }
    ]
  },
  {
    id: "mud-pit-intro",
    length: 768,
    difficulty: 2,
    weight: 2,
    pressure: "medium",
    role: "hazard",
    paceTier: "late",
    allowWallSprint: false,
    metadata: {
      chapter: 3,
      pacingBeat: "pressure",
      decorDensity: 0.35,
      unlockDistancePx: 7200,
      themeTag: "cave",
      hazardBudget: 1.5,
      enemyBudget: 0,
      reactionDistancePx: 220,
      routeType: "main",
      notes: ["Mud slows movement but does not kill."]
    },
    platforms: [
      { x: 0, y: ground, width: 768, height: 32, mainPath: true }
    ],
    hazards: [
      {
        x: 336,
        y: ground - 14,
        width: 112,
        height: 18,
        kind: "mud-pit",
        soft: { speedFactor: 0.62, durationMs: 360 }
      }
    ],
    coins: [
      { x: 210, y: 360, type: "normal" },
      { x: 390, y: 328, type: "normal" },
      { x: 566, y: 360, type: "normal" }
    ]
  },
  {
    id: "thorn-vine-intro",
    length: 768,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    role: "hazard",
    paceTier: "late",
    allowWallSprint: false,
    metadata: {
      chapter: 3,
      pacingBeat: "pressure",
      decorDensity: 0.25,
      unlockDistancePx: 7200,
      themeTag: "thorn",
      hazardBudget: 2,
      enemyBudget: 0,
      reactionDistancePx: 260,
      routeType: "main",
      notes: ["Thorn vine flashes before the lane closes."]
    },
    platforms: [
      { x: 0, y: ground, width: 768, height: 32, mainPath: true }
    ],
    hazards: [
      {
        x: 420,
        y: ground - 64,
        width: 32,
        height: 64,
        kind: "thorn-vine",
        timing: {
          warningMs: 720,
          activeMs: 620,
          inactiveMs: 1150,
          phaseMs: 160
        }
      }
    ],
    coins: [
      { x: 250, y: 360, type: "normal" },
      { x: 438, y: 322, type: "risk", routeType: "optional" },
      { x: 604, y: 360, type: "normal" }
    ]
  },
  {
    id: "flame-vent-intro",
    length: 832,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    role: "hazard",
    paceTier: "late",
    allowWallSprint: false,
    metadata: {
      chapter: 3,
      pacingBeat: "pressure",
      decorDensity: 0.22,
      unlockDistancePx: 10400,
      themeTag: "storm",
      hazardBudget: 2,
      enemyBudget: 0,
      reactionDistancePx: 260,
      routeType: "main",
      notes: ["Flame vent gives a long pre-fire warning."]
    },
    platforms: [
      { x: 0, y: ground, width: 832, height: 32, mainPath: true }
    ],
    hazards: [
      {
        x: 430,
        y: ground - 40,
        width: 64,
        height: 40,
        kind: "flame-vent",
        timing: {
          warningMs: 760,
          activeMs: 700,
          inactiveMs: 1240,
          phaseMs: 220
        }
      }
    ],
    coins: [
      { x: 268, y: 360, type: "normal" },
      { x: 462, y: 322, type: "risk", routeType: "optional" },
      { x: 658, y: 360, type: "normal" }
    ]
  },
  {
    id: "falling-rock-intro",
    length: 832,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    role: "hazard",
    paceTier: "late",
    allowWallSprint: false,
    metadata: {
      chapter: 3,
      pacingBeat: "pressure",
      decorDensity: 0.2,
      unlockDistancePx: 11200,
      themeTag: "cave",
      hazardBudget: 2,
      enemyBudget: 0,
      reactionDistancePx: 260,
      routeType: "main",
      notes: ["Rock shadow marks the landing point before impact."]
    },
    platforms: [
      { x: 0, y: ground, width: 832, height: 32, mainPath: true }
    ],
    hazards: [
      {
        x: 488,
        y: ground - 34,
        width: 38,
        height: 34,
        kind: "falling-rock",
        crusher: {
          distance: 102,
          warningMs: 1,
          slamMs: 1,
          holdMs: 1,
          returnMs: 1
        },
        timing: {
          warningMs: 780,
          activeMs: 520,
          inactiveMs: 1320,
          phaseMs: 320
        }
      }
    ],
    coins: [
      { x: 286, y: 360, type: "normal" },
      { x: 506, y: 318, type: "risk", routeType: "optional" },
      { x: 672, y: 360, type: "normal" }
    ]
  },
  {
    id: "crumble-slime-choice",
    length: 832,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    role: "hazard",
    paceTier: "late",
    allowWallSprint: false,
    metadata: {
      chapter: 3,
      pacingBeat: "reward",
      decorDensity: 0.3,
      unlockDistancePx: 9200,
      themeTag: "cave",
      hazardBudget: 1.5,
      enemyBudget: 1,
      reactionDistancePx: 260,
      routeType: "main",
      notes: ["Cracked ground marks an optional risk seed line."]
    },
    platforms: [
      { x: 0, y: ground, width: 832, height: 32, mainPath: true }
    ],
    hazards: [
      {
        x: 408,
        y: ground - 20,
        width: 80,
        height: 20,
        kind: "crumbling-platform",
        routeType: "optional"
      }
    ],
    enemies: [
      {
        x: 590,
        y: ground - 28,
        width: 38,
        height: 28,
        kind: "stomp-slime",
        patrol: { distance: 48, durationMs: 1600, phaseMs: 180 }
      }
    ],
    coins: [
      { x: 250, y: 360, type: "normal" },
      { x: 448, y: 320, type: "risk", routeType: "optional" },
      { x: 610, y: 318, type: "normal" },
      { x: 720, y: 360, type: "normal" }
    ]
  },
  {
    id: "bat-and-mole-line",
    length: 896,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    role: "gauntlet",
    paceTier: "late",
    allowWallSprint: false,
    metadata: {
      chapter: 3,
      pacingBeat: "climax",
      decorDensity: 0.2,
      unlockDistancePx: 12800,
      themeTag: "night",
      hazardBudget: 1,
      enemyBudget: 3,
      reactionDistancePx: 240,
      routeType: "main",
      notes: ["Bat layer and mole bump are readable one at a time."]
    },
    platforms: [
      { x: 0, y: ground, width: 896, height: 32, mainPath: true }
    ],
    hazards: [],
    enemies: [
      {
        x: 350,
        y: ground - 66,
        width: 48,
        height: 26,
        kind: "bat",
        patrol: { distance: 72, durationMs: 1700 }
      },
      {
        x: 610,
        y: ground - 32,
        width: 38,
        height: 32,
        kind: "mole"
      }
    ],
    coins: [
      { x: 224, y: 360, type: "normal" },
      { x: 520, y: 330, type: "normal" },
      { x: 724, y: 360, type: "normal" }
    ]
  },
  {
    id: "flower-turret-read",
    length: 896,
    difficulty: 3,
    weight: 1.5,
    pressure: "high",
    role: "gauntlet",
    paceTier: "late",
    allowWallSprint: false,
    metadata: {
      chapter: 3,
      pacingBeat: "climax",
      decorDensity: 0.18,
      unlockDistancePx: 13600,
      themeTag: "thorn",
      hazardBudget: 1,
      enemyBudget: 2,
      reactionDistancePx: 280,
      routeType: "main",
      notes: ["Turret is a visible body hazard in v1.5."]
    },
    platforms: [
      { x: 0, y: ground, width: 896, height: 32, mainPath: true }
    ],
    hazards: [],
    enemies: [
      {
        x: 470,
        y: ground - 42,
        width: 38,
        height: 42,
        kind: "flower-turret"
      }
    ],
    coins: [
      { x: 248, y: 360, type: "normal" },
      { x: 494, y: 322, type: "risk", routeType: "optional" },
      { x: 708, y: 360, type: "normal" }
    ]
  },
  {
    id: "mixed-pressure",
    length: 832,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    role: "gauntlet",
    paceTier: "late",
    allowWallSprint: false,
    metadata: {
      chapter: 3,
      pacingBeat: "climax",
      decorDensity: 0.25,
      unlockDistancePx: 15000,
      themeTag: "storm",
      hazardBudget: 6,
      enemyBudget: 0,
      reactionDistancePx: 160,
      routeType: "main"
    },
    platforms: [
      { x: 0, y: ground, width: 176, height: 32, mainPath: true },
      { x: 272, y: lip, width: 160, height: 32, mainPath: true },
      { x: 528, y: ground - 68, width: 144, height: 32, mainPath: true },
      { x: 704, y: ground, width: 128, height: 32, mainPath: true }
    ],
    hazards: [
      {
        x: 472,
        y: ground - 24,
        width: 72,
        height: 24,
        kind: "spike",
        routeType: "optional"
      },
      {
        x: 300,
        y: lip - 32,
        width: 32,
        height: 32,
        kind: "patrol-spike",
        patrol: { axis: "x", distance: 72, durationMs: 1500, phaseMs: 220 }
      },
      {
        x: 720,
        y: ground - 132,
        width: 64,
        height: 38,
        kind: "crusher",
        crusher: {
          distance: 94,
          warningMs: 560,
          slamMs: 220,
          holdMs: 420,
          returnMs: 720
        }
      }
    ],
    coins: [
      { x: 224, y: 334, type: "normal" },
      { x: 586, y: 296, type: "risk", routeType: "optional" }
    ]
  }
];
