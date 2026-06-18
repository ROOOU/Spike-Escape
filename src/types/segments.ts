export type PressureLevel = "low" | "medium" | "high" | "recovery";
export type CoinType = "normal" | "risk";
export type SegmentRole =
  | "onboarding"
  | "runway"
  | "gap"
  | "elevation"
  | "hazard"
  | "precision"
  | "recovery"
  | "sprint"
  | "gauntlet";
export type PaceTier = "onboarding" | "early" | "mid" | "late";

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
  introOrder?: number;
  pacingBeat?:
    | "setup"
    | "build"
    | "reward"
    | "pressure"
    | "recovery"
    | "climax";
  chapter?: number;
  notes?: string[];
  decorDensity?: number;
}

export interface SegmentDefinition {
  id: string;
  length: number;
  difficulty: number;
  weight: number;
  pressure: PressureLevel;
  role: SegmentRole;
  paceTier: PaceTier;
  allowWallSprint: boolean;
  metadata: SegmentMetadata;
  platforms: PlatformDefinition[];
  hazards: HazardDefinition[];
  coins: CoinDefinition[];
}
