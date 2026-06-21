export type PressureLevel = "low" | "medium" | "high" | "recovery";
export type CoinType = "normal" | "risk";
export type PickupKind =
  | "seed"
  | "risk-seed"
  | "magnet"
  | "bubble-shield"
  | "clock-spore"
  | "fire-crown"
  | "white-flower"
  | "red-flower";
export type RouteType = "main" | "optional" | "requiresPowerup";
export type CapabilityProfile =
  | "bubble-shield"
  | "magnet"
  | "clock-spore"
  | "fire-crown"
  | "bounce";
export type ThemeTag = "meadow" | "thorn" | "cave" | "night" | "storm" | "treasure";
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
  routeType?: RouteType;
  requiredCapability?: CapabilityProfile;
  behavior?: PlatformBehaviorDefinition;
}

export type HazardKind =
  | "spike"
  | "spike-long"
  | "patrol-spike"
  | "crusher"
  | "thorn-vine"
  | "flame-vent"
  | "crumbling-platform"
  | "falling-rock"
  | "mud-pit";

export type PlatformBehaviorKind = "static" | "moving" | "collapsing" | "spring";

export interface PlatformBehaviorDefinition {
  kind: PlatformBehaviorKind;
  routeType?: RouteType;
  delayMs?: number;
  resetMs?: number;
}

export interface PatrolMotionDefinition {
  axis: "x" | "y";
  distance: number;
  durationMs: number;
  phaseMs?: number;
}

export interface CrusherMotionDefinition {
  distance: number;
  warningMs: number;
  slamMs: number;
  holdMs: number;
  returnMs: number;
  phaseMs?: number;
}

export interface TimedHazardDefinition {
  warningMs: number;
  activeMs: number;
  inactiveMs: number;
  phaseMs?: number;
}

export interface SoftHazardDefinition {
  speedFactor: number;
  durationMs: number;
}

export interface HazardDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
  kind: HazardKind;
  routeType?: RouteType;
  requiredCapability?: CapabilityProfile;
  patrol?: PatrolMotionDefinition;
  crusher?: CrusherMotionDefinition;
  timing?: TimedHazardDefinition;
  soft?: SoftHazardDefinition;
}

export type EnemyKind =
  | "stompable-ground"
  | "stomp-slime"
  | "bat"
  | "mole"
  | "flower-turret"
  | "beetle";

export interface EnemyPatrolDefinition {
  distance: number;
  durationMs: number;
  phaseMs?: number;
}

export interface EnemyDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
  kind: EnemyKind;
  routeType?: RouteType;
  requiredCapability?: CapabilityProfile;
  patrol?: EnemyPatrolDefinition;
  bounceVelocity?: number;
}

export interface CoinDefinition {
  x: number;
  y: number;
  type: CoinType;
  pickupKind?: PickupKind;
  routeType?: RouteType;
  requiredCapability?: CapabilityProfile;
}

export interface PickupDefinition {
  x: number;
  y: number;
  kind: PickupKind;
  routeType?: RouteType;
  requiredCapability?: CapabilityProfile;
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
  unlockDistancePx?: number;
  themeTag: ThemeTag;
  hazardBudget: number;
  enemyBudget: number;
  reactionDistancePx: number;
  routeType: RouteType;
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
  enemies?: EnemyDefinition[];
  coins: CoinDefinition[];
  pickups?: PickupDefinition[];
}
