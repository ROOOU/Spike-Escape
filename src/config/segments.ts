import { WORLD_CONFIG } from "./gameConfig";
import type { SegmentDefinition } from "../types/segments";

const ground = WORLD_CONFIG.groundTop;

export const START_SEGMENT: SegmentDefinition = {
  id: "start-runway",
  length: 960,
  difficulty: 0,
  weight: 0,
  pressure: "recovery",
  allowWallSprint: false,
  metadata: {
    notes: ["Starting safety runway."]
  },
  platforms: [
    { x: 0, y: ground, width: 960, height: 32, mainPath: true }
  ],
  hazards: [],
  coins: [
    { x: 320, y: 360, type: "normal" },
    { x: 430, y: 332, type: "normal" },
    { x: 540, y: 360, type: "normal" }
  ]
};

export const SEGMENT_CATALOG: SegmentDefinition[] = [
  {
    id: "safe-runway",
    length: 640,
    difficulty: 1,
    weight: 5,
    pressure: "low",
    allowWallSprint: false,
    metadata: {},
    platforms: [
      { x: 0, y: ground, width: 640, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 180, y: 360, type: "normal" },
      { x: 280, y: 344, type: "normal" },
      { x: 380, y: 360, type: "normal" }
    ]
  },
  {
    id: "single-gap",
    length: 640,
    difficulty: 1,
    weight: 4,
    pressure: "medium",
    allowWallSprint: false,
    metadata: {},
    platforms: [
      { x: 0, y: ground, width: 232, height: 32, mainPath: true },
      { x: 360, y: ground, width: 280, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 300, y: 332, type: "risk" }
    ]
  },
  {
    id: "coin-arc",
    length: 672,
    difficulty: 1,
    weight: 4,
    pressure: "medium",
    allowWallSprint: false,
    metadata: {},
    platforms: [
      { x: 0, y: ground, width: 224, height: 32, mainPath: true },
      { x: 352, y: ground, width: 320, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 250, y: 344, type: "normal" },
      { x: 288, y: 320, type: "normal" },
      { x: 326, y: 344, type: "normal" }
    ]
  },
  {
    id: "twin-gap",
    length: 736,
    difficulty: 2,
    weight: 3,
    pressure: "high",
    allowWallSprint: false,
    metadata: {
      consecutivePits: true
    },
    platforms: [
      { x: 0, y: ground, width: 176, height: 32, mainPath: true },
      { x: 272, y: ground, width: 160, height: 32, mainPath: true },
      { x: 528, y: ground, width: 208, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 224, y: 332, type: "normal" },
      { x: 480, y: 332, type: "risk" }
    ]
  },
  {
    id: "stair-step",
    length: 704,
    difficulty: 2,
    weight: 3,
    pressure: "medium",
    allowWallSprint: false,
    metadata: {},
    platforms: [
      { x: 0, y: ground, width: 192, height: 32, mainPath: true },
      { x: 264, y: ground - 48, width: 160, height: 32, mainPath: true },
      { x: 496, y: ground - 92, width: 208, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 332, y: 318, type: "normal" },
      { x: 586, y: 274, type: "risk" }
    ]
  },
  {
    id: "spike-bridge",
    length: 768,
    difficulty: 2,
    weight: 3,
    pressure: "medium",
    allowWallSprint: false,
    metadata: {},
    platforms: [
      { x: 0, y: ground, width: 192, height: 32, mainPath: true },
      { x: 304, y: ground - 72, width: 176, height: 32, mainPath: true },
      { x: 576, y: ground, width: 192, height: 32, mainPath: true }
    ],
    hazards: [
      { x: 224, y: ground - 24, width: 224, height: 24, kind: "spike" }
    ],
    coins: [
      { x: 392, y: 300, type: "normal" },
      { x: 514, y: 344, type: "risk" }
    ]
  },
  {
    id: "narrow-landing",
    length: 736,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    allowWallSprint: false,
    metadata: {},
    platforms: [
      { x: 0, y: ground, width: 208, height: 32, mainPath: true },
      { x: 336, y: ground, width: 96, height: 32, mainPath: true },
      { x: 544, y: ground, width: 192, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 384, y: 332, type: "risk" }
    ]
  },
  {
    id: "risk-ribbon",
    length: 768,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    allowWallSprint: false,
    metadata: {},
    platforms: [
      { x: 0, y: ground, width: 224, height: 32, mainPath: true },
      { x: 352, y: ground - 64, width: 96, height: 32, mainPath: true },
      { x: 512, y: ground, width: 256, height: 32, mainPath: true }
    ],
    hazards: [
      { x: 288, y: ground - 24, width: 64, height: 24, kind: "spike" }
    ],
    coins: [
      { x: 400, y: 308, type: "risk" },
      { x: 640, y: 340, type: "normal" }
    ]
  },
  {
    id: "recovery-lane",
    length: 704,
    difficulty: 2,
    weight: 3,
    pressure: "recovery",
    allowWallSprint: false,
    metadata: {},
    platforms: [
      { x: 0, y: ground, width: 704, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 208, y: 360, type: "normal" },
      { x: 320, y: 344, type: "normal" },
      { x: 432, y: 360, type: "normal" }
    ]
  },
  {
    id: "wall-sprint-window",
    length: 832,
    difficulty: 2,
    weight: 3,
    pressure: "low",
    allowWallSprint: true,
    metadata: {},
    platforms: [
      { x: 0, y: ground, width: 832, height: 32, mainPath: true }
    ],
    hazards: [],
    coins: [
      { x: 256, y: 360, type: "normal" },
      { x: 512, y: 344, type: "normal" },
      { x: 640, y: 360, type: "risk" }
    ]
  },
  {
    id: "mixed-pressure",
    length: 832,
    difficulty: 3,
    weight: 2,
    pressure: "high",
    allowWallSprint: false,
    metadata: {},
    platforms: [
      { x: 0, y: ground, width: 176, height: 32, mainPath: true },
      { x: 288, y: ground, width: 176, height: 32, mainPath: true },
      { x: 560, y: ground - 64, width: 120, height: 32, mainPath: true },
      { x: 744, y: ground, width: 88, height: 32, mainPath: true }
    ],
    hazards: [
      { x: 500, y: ground - 24, width: 56, height: 24, kind: "spike" }
    ],
    coins: [
      { x: 232, y: 336, type: "normal" },
      { x: 618, y: 300, type: "risk" }
    ]
  }
];
