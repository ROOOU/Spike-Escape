export interface ProgressionStage {
  key: string;
  minDistancePx: number;
  chapterLabel: string;
  title: string;
  detail: string;
  accent: number;
}

export const PROGRESSION_STAGES: ProgressionStage[] = [
  {
    key: "warmup",
    minDistancePx: 0,
    chapterLabel: "RUN 01",
    title: "WARMUP",
    detail: "Movement and low hops",
    accent: 0x54d55c
  },
  {
    key: "early-traps",
    minDistancePx: 960,
    chapterLabel: "RUN 02",
    title: "EARLY TRAPS",
    detail: "Low thorns, jump clean",
    accent: 0xff9d82
  },
  {
    key: "long-thorns",
    minDistancePx: 1600,
    chapterLabel: "RUN 03",
    title: "READ THORNS",
    detail: "Long strips need commitment",
    accent: 0xffcf74
  },
  {
    key: "elevation",
    minDistancePx: 3200,
    chapterLabel: "RUN 04",
    title: "STOMP / SPIKES",
    detail: "Enemies, thorns, wall windows",
    accent: 0x8ed8ff
  },
  {
    key: "risk-routes",
    minDistancePx: 5200,
    chapterLabel: "RUN 05",
    title: "RISK ROUTES",
    detail: "Optional flowers, safe lane first",
    accent: 0xffcf74
  },
  {
    key: "patrols",
    minDistancePx: 6400,
    chapterLabel: "RUN 06",
    title: "PATROLS",
    detail: "Track rails before crossing",
    accent: 0xffbe55
  },
  {
    key: "mud-vines",
    minDistancePx: 7200,
    chapterLabel: "RUN 07",
    title: "MUD / VINES",
    detail: "Slow zones and timed thorns",
    accent: 0xc48a3a
  },
  {
    key: "vertical-patrols",
    minDistancePx: 9000,
    chapterLabel: "RUN 08",
    title: "VERTICAL PATROLS",
    detail: "Wait for the lane to open",
    accent: 0xf58bd4
  },
  {
    key: "flame-rocks",
    minDistancePx: 10400,
    chapterLabel: "RUN 09",
    title: "FIRE / ROCK",
    detail: "Watch pre-warnings",
    accent: 0xff6d53
  },
  {
    key: "crushers",
    minDistancePx: 11000,
    chapterLabel: "RUN 10",
    title: "CRUSHERS",
    detail: "Watch the warning zone",
    accent: 0xff6d53
  },
  {
    key: "climax-traps",
    minDistancePx: 13000,
    chapterLabel: "RUN 11",
    title: "CLIMAX TRAPS",
    detail: "Denser combinations",
    accent: 0xff9d82
  },
  {
    key: "gauntlet",
    minDistancePx: 15000,
    chapterLabel: "RUN 12",
    title: "GAUNTLET",
    detail: "Mixed pressure, cooldown after danger",
    accent: 0xff3a30
  }
];

export function progressionStageForDistance(distancePx: number): ProgressionStage {
  const safeDistance = Number.isFinite(distancePx) ? Math.max(0, distancePx) : 0;
  let activeStage = PROGRESSION_STAGES[0];

  for (const stage of PROGRESSION_STAGES) {
    if (safeDistance < stage.minDistancePx) {
      break;
    }

    activeStage = stage;
  }

  return activeStage;
}
