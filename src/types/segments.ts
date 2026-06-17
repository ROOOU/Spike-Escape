export type PressureLevel = "low" | "medium" | "high" | "recovery";
export type CoinType = "normal" | "risk";

export interface PlatformDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
  mainPath?: boolean;
}

export interface HazardDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
  kind: "spike";
}

export interface CoinDefinition {
  x: number;
  y: number;
  type: CoinType;
}

export interface SegmentMetadata {
  consecutivePits?: boolean;
  notes?: string[];
}

export interface SegmentDefinition {
  id: string;
  length: number;
  difficulty: number;
  weight: number;
  pressure: PressureLevel;
  allowWallSprint: boolean;
  metadata: SegmentMetadata;
  platforms: PlatformDefinition[];
  hazards: HazardDefinition[];
  coins: CoinDefinition[];
}
