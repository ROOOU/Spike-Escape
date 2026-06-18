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
  weight: 0,
  pressure: "recovery",
  role: "onboarding",
  paceTier: "onboarding",
  allowWallSprint: false,
  metadata: {
    chapter: 1,
    pacingBeat: "setup",
    decorDensity: 0.75,
    notes: ["Starting safety runway."]
  },
  platforms: [
    { x: 0, y: ground, width: 960, height: 32, mainPath: true }
  ],
  hazards: [],
  coins: [
    { x: 280, y: 360, type: "normal" },
    { x: 420, y: 344, type: "normal" },
    { x: 566, y: 360, type: "normal" }
  ]
};

export const SEGMENT_CATALOG: SegmentDefinition[] = [
  {
    id: "safe-runway",
    length: 640,
    difficulty: 1,
    weight: 5,
    pressure: "low",
    role: "runway",
    paceTier: "early",
    allowWallSprint: false,
    metadata: {
      chapter: 1,
      pacingBeat: "build",
      decorDensity: 0.7,
      introOrder: 0
    },
    platforms: [
      { x: 0, y: ground, width: 640, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 164, y: 360, type: "normal" },
      { x: 304, y: 344, type: "normal" },
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
      introOrder: 1
    },
    platforms: [
      { x: 0, y: ground, width: 256, height: 32, mainPath: true },
      { x: 336, y: lip, width: 160, height: 32, mainPath: true },
      { x: 472, y: ground, width: 168, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 286, y: 330, type: "normal" }
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
      introOrder: 2
    },
    platforms: [
      { x: 0, y: ground, width: 256, height: 32, mainPath: true },
      { x: 320, y: hop, width: 160, height: 32, mainPath: true },
      { x: 464, y: ground, width: 208, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 268, y: 350, type: "normal" },
      { x: 306, y: 326, type: "normal" },
      { x: 348, y: 302, type: "normal" }
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
      consecutivePits: true
    },
    platforms: [
      { x: 0, y: ground, width: 168, height: 32, mainPath: true },
      { x: 264, y: lip, width: 160, height: 32, mainPath: true },
      { x: 488, y: ground, width: 248, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 216, y: 336, type: "normal" },
      { x: 456, y: 328, type: "risk" }
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
      introOrder: 4
    },
    platforms: [
      { x: 0, y: ground, width: 216, height: 32, mainPath: true },
      { x: 288, y: hop, width: 160, height: 32, mainPath: true },
      { x: 512, y: ground - 64, width: 192, height: 32, mainPath: true }
    ],
    hazards: [],
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
      decorDensity: 0.35
    },
    platforms: [
      { x: 0, y: ground, width: 224, height: 32, mainPath: true },
      { x: 304, y: ground - 64, width: 176, height: 32, mainPath: true },
      { x: 560, y: ground, width: 208, height: 32, mainPath: true }
    ],
    hazards: [
      { x: 220, y: ground - 24, width: 236, height: 24, kind: "spike" }
    ],
    coins: [
      { x: 392, y: 292, type: "normal" },
      { x: 454, y: 302, type: "risk" }
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
      decorDensity: 0.25
    },
    platforms: [
      { x: 0, y: ground, width: 240, height: 32, mainPath: true },
      { x: 336, y: ledge, width: 128, height: 32, mainPath: true },
      { x: 512, y: ground, width: 224, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 380, y: 314, type: "risk" }
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
      decorDensity: 0.3
    },
    platforms: [
      { x: 0, y: ground, width: 240, height: 32, mainPath: true },
      { x: 336, y: ground - 64, width: 112, height: 32, mainPath: true },
      { x: 512, y: ground, width: 256, height: 32, mainPath: true }
    ],
    hazards: [
      { x: 272, y: ground - 24, width: 72, height: 24, kind: "spike" }
    ],
    coins: [
      { x: 400, y: 308, type: "risk" },
      { x: 642, y: 340, type: "normal" }
    ]
  },
  {
    id: "recovery-lane",
    length: 704,
    difficulty: 2,
    weight: 3,
    pressure: "recovery",
    role: "recovery",
    paceTier: "early",
    allowWallSprint: false,
    metadata: {
      chapter: 1,
      pacingBeat: "recovery",
      decorDensity: 0.7,
      introOrder: 3
    },
    platforms: [
      { x: 0, y: ground, width: 704, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 180, y: 360, type: "normal" },
      { x: 308, y: 344, type: "normal" },
      { x: 470, y: 360, type: "normal" }
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
      introOrder: 5
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
      decorDensity: 0.25
    },
    platforms: [
      { x: 0, y: ground, width: 176, height: 32, mainPath: true },
      { x: 272, y: lip, width: 160, height: 32, mainPath: true },
      { x: 528, y: ground - 68, width: 120, height: 32, mainPath: true },
      { x: 712, y: ground, width: 120, height: 32, mainPath: true }
    ],
    hazards: [
      { x: 472, y: ground - 24, width: 72, height: 24, kind: "spike" }
    ],
    coins: [
      { x: 224, y: 334, type: "normal" },
      { x: 586, y: 296, type: "risk" }
    ]
  }
];
