import { WORLD_CONFIG } from "../config/gameConfig";
import { PLAYER_CONFIG } from "../config/playerConfig";
import type { PlatformDefinition, SegmentDefinition } from "../types/segments";
import { flightTimeForVerticalDelta, horizontalReach } from "./jumpPhysics";

const MAX_RISE_SAFETY = 0.9;
const LANDING_MARGIN = 16;
const MIN_REACH_MARGIN = 24;
const MIN_LANDING_WINDOW_MARGIN = 16;
const MIN_RISK_COIN_UNLOCK_DISTANCE = 5200;
const MIN_STATIC_HAZARD_UNLOCK_DISTANCE = 800;
const MIN_SPIKE_LONG_UNLOCK_DISTANCE = 1280;
const MIN_HORIZONTAL_PATROL_UNLOCK_DISTANCE = 6400;
const MIN_VERTICAL_PATROL_UNLOCK_DISTANCE = 9000;
const MIN_CRUSHER_UNLOCK_DISTANCE = 11000;
const MIN_SOFT_TRAP_UNLOCK_DISTANCE = 7040;
const MIN_CRUMBLING_PLATFORM_UNLOCK_DISTANCE = 7040;
const MIN_THORN_VINE_UNLOCK_DISTANCE = 7040;
const MIN_TIMED_TRAP_UNLOCK_DISTANCE = 10240;
const MIN_ADVANCED_ENEMY_UNLOCK_DISTANCE = 10240;
const MIN_WALL_SPRINT_UNLOCK_DISTANCE = 4000;
const MIN_ENEMY_UNLOCK_DISTANCE = 3200;
const MIN_DIFFICULTY_3_UNLOCK_DISTANCE = 6400;
const MIN_MID_TIER_UNLOCK_DISTANCE = 3200;
const MIN_LATE_TIER_UNLOCK_DISTANCE = 7200;
const MIN_HIGH_PRESSURE_UNLOCK_DISTANCE = 5200;
const MAX_EARLY_TAKEOFF = 72;
const EARLY_TAKEOFF_PLATFORM_RATIO = 0.4;
const MIN_REACTION_DISTANCE_PX = 128;
const MIN_TIMED_WARNING_MS = 450;
const MAX_MAIN_ROUTE_PRIMARY_DANGERS = 2;

export interface SegmentValidationReport {
  segmentId: string;
  errors: string[];
}

interface TransitionContext {
  current: PlatformDefinition;
  next: PlatformDefinition;
  errors: string[];
  label: string;
}

function mainPathPlatforms(segment: SegmentDefinition): PlatformDefinition[] {
  return segment.platforms
    .filter((platform) => platform.mainPath)
    .sort((a, b) => a.x - b.x);
}

function computeFlightTime(dy: number): number | null {
  return flightTimeForVerticalDelta(
    dy,
    PLAYER_CONFIG.gravity,
    PLAYER_CONFIG.jumpVelocity
  );
}

function platformContainsX(platform: PlatformDefinition, x: number): boolean {
  return x >= platform.x && x <= platform.x + platform.width;
}

function riskCoinOverMainPathGap(mainPath: PlatformDefinition[], x: number): boolean {
  for (let index = 0; index < mainPath.length - 1; index += 1) {
    const current = mainPath[index];
    const next = mainPath[index + 1];
    const gapStart = current.x + current.width;
    const gapEnd = next.x;
    const gapWidth = gapEnd - gapStart;

    if (gapWidth < 48) {
      continue;
    }

    if (x >= gapStart + 24 && x <= gapEnd - 24) {
      return true;
    }
  }

  return false;
}

function hazardMaxX(hazard: SegmentDefinition["hazards"][number]): number {
  if (hazard.kind === "patrol-spike" && hazard.patrol?.axis === "x") {
    return hazard.x + hazard.width + Math.max(0, hazard.patrol.distance);
  }

  return hazard.x + hazard.width;
}

function hazardMaxY(hazard: SegmentDefinition["hazards"][number]): number {
  if (hazard.kind === "patrol-spike" && hazard.patrol?.axis === "y") {
    return hazard.y + hazard.height + Math.max(0, hazard.patrol.distance);
  }

  if (hazard.kind === "crusher") {
    return hazard.y + hazard.height + Math.max(0, hazard.crusher?.distance ?? 0);
  }

  return hazard.y + hazard.height;
}

function enemyMaxX(enemy: NonNullable<SegmentDefinition["enemies"]>[number]): number {
  return enemy.x + enemy.width + Math.max(0, enemy.patrol?.distance ?? 0);
}

function enemyMaxY(enemy: NonNullable<SegmentDefinition["enemies"]>[number]): number {
  return enemy.y + enemy.height;
}

function pickupMaxX(pickup: NonNullable<SegmentDefinition["pickups"]>[number]): number {
  return pickup.x + 16;
}

function unlockDistance(segment: SegmentDefinition): number {
  return segment.metadata.unlockDistancePx ?? 0;
}

function hasOnlyStaticSpikeHazards(segment: SegmentDefinition): boolean {
  return (
    segment.hazards.length > 0 &&
    segment.hazards.every(
      (hazard) => hazard.kind === "spike" || hazard.kind === "spike-long"
    )
  );
}

function routeTypeOf(
  item: { routeType?: SegmentDefinition["metadata"]["routeType"] },
  segment: SegmentDefinition
): NonNullable<SegmentDefinition["metadata"]["routeType"]> {
  return item.routeType ?? segment.metadata.routeType ?? "main";
}

function validateCapabilityRoute(
  item: {
    routeType?: SegmentDefinition["metadata"]["routeType"];
    requiredCapability?: string;
  },
  segment: SegmentDefinition,
  errors: string[],
  label: string
): void {
  const routeType = routeTypeOf(item, segment);

  if (routeType === "main" && item.requiredCapability !== undefined) {
    errors.push(`${label} cannot require a powerup on the main route.`);
  }

  if (routeType === "requiresPowerup" && item.requiredCapability === undefined) {
    errors.push(`${label} requiresPowerup route must declare requiredCapability.`);
  }
}

function hazardBudgetCost(hazard: SegmentDefinition["hazards"][number]): number {
  switch (hazard.kind) {
    case "spike":
      return 1;
    case "spike-long":
      return 1.25;
    case "mud-pit":
    case "crumbling-platform":
      return 1.5;
    case "patrol-spike":
    case "thorn-vine":
    case "flame-vent":
    case "falling-rock":
      return 2;
    case "crusher":
      return 3;
    default:
      return 1;
  }
}

function enemyBudgetCost(enemy: NonNullable<SegmentDefinition["enemies"]>[number]): number {
  switch (enemy.kind) {
    case "stompable-ground":
    case "stomp-slime":
      return 1;
    case "beetle":
    case "bat":
    case "mole":
      return 1.5;
    case "flower-turret":
      return 2;
    default:
      return 1;
  }
}

function isPrimaryDangerOnMainRoute(
  item: { routeType?: SegmentDefinition["metadata"]["routeType"] },
  segment: SegmentDefinition
): boolean {
  return routeTypeOf(item, segment) === "main";
}

function canRejoinMainPath(
  mainPath: PlatformDefinition[],
  x: number,
  segmentLength: number
): boolean {
  const safeX = Math.max(0, Math.min(segmentLength, x));
  const supportedOnMain = mainPath.some(
    (platform) =>
      safeX >= platform.x + 96 && safeX <= platform.x + platform.width - 96
  );
  if (supportedOnMain) {
    return true;
  }

  const hasBefore = mainPath.some((platform) => platform.x + platform.width < safeX);
  const hasAfter = mainPath.some((platform) => platform.x > safeX);
  const hasSupportAfter = mainPath.some(
    (platform) => platform.x <= safeX && platform.x + platform.width >= safeX + 96
  );

  return hasBefore && (hasAfter || hasSupportAfter);
}

function validateDifficultyBudget(
  segment: SegmentDefinition,
  enemies: NonNullable<SegmentDefinition["enemies"]>,
  errors: string[]
): void {
  if (!isPositiveFinite(segment.metadata.hazardBudget)) {
    errors.push("Hazard budget must be a positive finite number.");
  } else {
    const cost = segment.hazards.reduce(
      (sum, hazard) => sum + hazardBudgetCost(hazard),
      0
    );
    if (cost > segment.metadata.hazardBudget) {
      errors.push(
        `Hazard budget ${segment.metadata.hazardBudget} is below authored danger cost ${cost}.`
      );
    }
  }

  if (!isNonNegativeFinite(segment.metadata.enemyBudget)) {
    errors.push("Enemy budget must be a non-negative finite number.");
  } else {
    const cost = enemies.reduce((sum, enemy) => sum + enemyBudgetCost(enemy), 0);
    if (cost > segment.metadata.enemyBudget) {
      errors.push(
        `Enemy budget ${segment.metadata.enemyBudget} is below authored enemy cost ${cost}.`
      );
    }
  }

  const mainRouteDangerCount =
    segment.hazards.filter((hazard) => isPrimaryDangerOnMainRoute(hazard, segment))
      .length +
    enemies.filter((enemy) => isPrimaryDangerOnMainRoute(enemy, segment)).length;
  if (
    segment.pressure === "high" &&
    mainRouteDangerCount > MAX_MAIN_ROUTE_PRIMARY_DANGERS
  ) {
    errors.push(
      `High-pressure main route has ${mainRouteDangerCount} primary dangers, above ${MAX_MAIN_ROUTE_PRIMARY_DANGERS}.`
    );
  }
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function isNonNegativeFinite(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function validateRequiredMetadata(
  segment: SegmentDefinition,
  errors: string[]
): void {
  if (segment.metadata.themeTag === undefined) {
    errors.push("Segment metadata must define a theme tag.");
  }

  if (segment.metadata.routeType === undefined) {
    errors.push("Segment metadata must define a route type.");
  }

  if (
    !Number.isFinite(segment.metadata.reactionDistancePx) ||
    segment.metadata.reactionDistancePx < MIN_REACTION_DISTANCE_PX
  ) {
    errors.push(
      `Reaction distance must be at least ${MIN_REACTION_DISTANCE_PX}px.`
    );
  }
}

function validateProgressionUnlock(
  segment: SegmentDefinition,
  unlockDistancePx: number,
  errors: string[]
): void {
  if (
    segment.difficulty >= 3 &&
    unlockDistancePx < MIN_DIFFICULTY_3_UNLOCK_DISTANCE
  ) {
    errors.push(
      `Difficulty 3 segments must unlock at ${MIN_DIFFICULTY_3_UNLOCK_DISTANCE}px or later.`
    );
  }

  if (
    segment.paceTier === "mid" &&
    unlockDistancePx < MIN_MID_TIER_UNLOCK_DISTANCE
  ) {
    errors.push(
      `Mid-tier segments must unlock at ${MIN_MID_TIER_UNLOCK_DISTANCE}px or later.`
    );
  }

  if (
    segment.paceTier === "late" &&
    unlockDistancePx < MIN_LATE_TIER_UNLOCK_DISTANCE
  ) {
    errors.push(
      `Late-tier segments must unlock at ${MIN_LATE_TIER_UNLOCK_DISTANCE}px or later.`
    );
  }

  if (
    segment.pressure === "high" &&
    unlockDistancePx < MIN_HIGH_PRESSURE_UNLOCK_DISTANCE
  ) {
    errors.push(
      `High-pressure segments must unlock at ${MIN_HIGH_PRESSURE_UNLOCK_DISTANCE}px or later.`
    );
  }
}

function validatePlatformTransition({
  current,
  next,
  errors,
  label
}: TransitionContext): void {
  const theoreticalMaxJumpRise = PLAYER_CONFIG.jumpHeightPx;
  const maxSafeJumpRise = theoreticalMaxJumpRise * MAX_RISE_SAFETY;
  const landingEdgeBuffer = PLAYER_CONFIG.hitboxWidth + LANDING_MARGIN;

  const gap = next.x - (current.x + current.width);
  const dy = next.y - current.y;
  const rise = dy < 0 ? Math.abs(dy) : 0;

  if (gap <= 0 && rise > 0) {
    errors.push(
      `${label}: Adjacent upward step ${rise} between ${current.x} and ${next.x} can block Arcade movement.`
    );
  }

  if (rise > maxSafeJumpRise) {
    errors.push(
      `${label}: Main path rises ${rise} between ${current.x} and ${next.x}, above safe rise ${maxSafeJumpRise.toFixed(1)}.`
    );
  }

  const flightTime = computeFlightTime(dy);
  if (flightTime === null) {
    errors.push(`${label}: Unreachable vertical transition between ${current.x} and ${next.x}.`);
    return;
  }

  if (gap > 0) {
    const requiredReach = gap + landingEdgeBuffer;
    const safeReach = horizontalReach(
      PLAYER_CONFIG.boostRunSpeed,
      flightTime,
      PLAYER_CONFIG.practicalJumpSpeedFactor
    );
    const reachMargin = safeReach - requiredReach;
    if (reachMargin < MIN_REACH_MARGIN) {
      errors.push(
        `${label}: Gap ${gap} plus landing buffer ${landingEdgeBuffer} leaves only ${reachMargin.toFixed(1)}px practical reach margin, below ${MIN_REACH_MARGIN}px.`
      );
    }

    if (dy <= 0) {
      const controlledJumpReach = horizontalReach(
        PLAYER_CONFIG.boostRunSpeed,
        flightTime,
        PLAYER_CONFIG.controlledJumpSpeedFactor
      );
      const landingWindowEnd =
        gap + next.width - PLAYER_CONFIG.hitboxWidth - LANDING_MARGIN;
      const earlyTakeoffAllowance = Math.min(
        current.width * EARLY_TAKEOFF_PLATFORM_RATIO,
        MAX_EARLY_TAKEOFF
      );
      const landingWindowMargin =
        landingWindowEnd - (controlledJumpReach - earlyTakeoffAllowance);
      if (landingWindowMargin < MIN_LANDING_WINDOW_MARGIN) {
        errors.push(
          `${label}: Landing window ${landingWindowEnd.toFixed(1)} leaves only ${landingWindowMargin.toFixed(1)}px controlled margin, below ${MIN_LANDING_WINDOW_MARGIN}px.`
        );
      }
    }
  }

  if (next.width < PLAYER_CONFIG.minLandingWidth) {
    errors.push(
      `${label}: Landing width ${next.width} is below ${PLAYER_CONFIG.minLandingWidth}.`
    );
  }
}

export function validateSegment(segment: SegmentDefinition): SegmentValidationReport {
  const errors: string[] = [];
  const mainPath = mainPathPlatforms(segment);
  const segmentUnlockDistance = unlockDistance(segment);
  const enemies = segment.enemies ?? [];
  const pickups = segment.pickups ?? [];

  if (segment.id.trim().length === 0) {
    errors.push("Segment id must not be empty.");
  }

  if (!Number.isFinite(segmentUnlockDistance) || segmentUnlockDistance < 0) {
    errors.push("Segment unlock distance must be a non-negative finite number.");
  }

  if (!isPositiveFinite(segment.length)) {
    errors.push("Segment length must be a positive finite number.");
  }

  if (!isPositiveFinite(segment.weight)) {
    errors.push("Segment weight must be a positive finite number.");
  }

  validateRequiredMetadata(segment, errors);
  validateProgressionUnlock(segment, segmentUnlockDistance, errors);
  validateDifficultyBudget(segment, enemies, errors);

  if (mainPath.length === 0) {
    errors.push("Missing main-path platforms.");
  }

  if (mainPath[0] && mainPath[0].x !== 0) {
    errors.push("Main path must start at the segment entrance.");
  }

  const lastPlatform = mainPath[mainPath.length - 1];
  if (lastPlatform && lastPlatform.x + lastPlatform.width < segment.length) {
    errors.push("Main path must carry the player to the segment exit.");
  }

  const highestExtent = Math.max(
    0,
    ...segment.platforms.map((platform) => platform.x + platform.width),
    ...segment.hazards.map(hazardMaxX),
    ...enemies.map(enemyMaxX),
    ...pickups.map(pickupMaxX)
  );

  if (highestExtent > segment.length) {
    errors.push("Segment geometry extends beyond segment length.");
  }

  segment.platforms.forEach((platform, index) => {
    if (!isNonNegativeFinite(platform.x) || !Number.isFinite(platform.y)) {
      errors.push(`Platform ${index} must have finite position.`);
    }

    if (!isPositiveFinite(platform.width) || !isPositiveFinite(platform.height)) {
      errors.push(`Platform ${index} must have positive finite size.`);
    }

    validateCapabilityRoute(platform, segment, errors, `Platform ${index}`);

    if (platform.mainPath && platform.routeType === "requiresPowerup") {
      errors.push(`Platform ${index} cannot put the main path behind a powerup.`);
    }

    if (platform.mainPath && platform.requiredCapability !== undefined) {
      errors.push(`Platform ${index} main path cannot require a powerup.`);
    }

    if (
      (platform.routeType === "optional" || platform.routeType === "requiresPowerup") &&
      !canRejoinMainPath(mainPath, platform.x, segment.length)
    ) {
      errors.push(`Optional platform route at ${platform.x} must rejoin the main path.`);
    }
  });

  for (let index = 0; index < mainPath.length - 1; index += 1) {
    validatePlatformTransition({
      current: mainPath[index],
      next: mainPath[index + 1],
      errors,
      label: "Main path"
    });
  }

  if (segment.allowWallSprint && segment.metadata.consecutivePits) {
    errors.push("Wall sprint cannot be enabled on consecutive-pit segments.");
  }

  if (
    segment.allowWallSprint &&
    segmentUnlockDistance < MIN_WALL_SPRINT_UNLOCK_DISTANCE
  ) {
    errors.push(
      `Wall sprint segments must unlock at ${MIN_WALL_SPRINT_UNLOCK_DISTANCE}px or later.`
    );
  }

  if (segment.paceTier === "onboarding" && segment.id !== "start-runway") {
    errors.push("Only the start segment may use onboarding pace.");
  }

  if (segment.metadata.introOrder !== undefined) {
    if (segment.hazards.length > 0 && !hasOnlyStaticSpikeHazards(segment)) {
      errors.push("Intro segments can only teach static spike hazards.");
    }

    if (segment.coins.some((coin) => coin.type === "risk")) {
      errors.push("Intro segments cannot require risk-coin routing.");
    }

    if (segment.difficulty > 2 || segment.pressure === "high") {
      errors.push("Intro segments must stay below high-pressure difficulty.");
    }
  }

  if (segment.pressure === "recovery") {
    if (segment.hazards.length > 0) {
      errors.push("Recovery segments cannot contain hazards.");
    }

    if (segment.coins.some((coin) => coin.type === "risk")) {
      errors.push("Recovery segments cannot contain risk coins.");
    }
  }

  if (
    segment.hazards.length > 0 &&
    segmentUnlockDistance < MIN_STATIC_HAZARD_UNLOCK_DISTANCE
  ) {
    errors.push(
      `Hazard segments must unlock at ${MIN_STATIC_HAZARD_UNLOCK_DISTANCE}px or later.`
    );
  }

  const firstDangerX = Math.min(
    Number.POSITIVE_INFINITY,
    ...segment.hazards.map((hazard) => hazard.x),
    ...enemies.map((enemy) => enemy.x)
  );
  if (
    Number.isFinite(firstDangerX) &&
    Number.isFinite(segment.metadata.reactionDistancePx) &&
    firstDangerX < segment.metadata.reactionDistancePx
  ) {
    errors.push(
      `First danger at ${firstDangerX}px appears before reaction distance ${segment.metadata.reactionDistancePx}px.`
    );
  }

  segment.hazards.forEach((hazard) => {
    validateCapabilityRoute(hazard, segment, errors, `Hazard at ${hazard.x}`);

    if (!isNonNegativeFinite(hazard.x) || !isNonNegativeFinite(hazard.y)) {
      errors.push(`Hazard at ${hazard.x} must have non-negative finite position.`);
    }

    if (!isPositiveFinite(hazard.width) || !isPositiveFinite(hazard.height)) {
      errors.push(`Hazard at ${hazard.x} must have positive finite size.`);
    }

    if (hazard.y < 0 || hazardMaxY(hazard) > WORLD_CONFIG.floorKillY) {
      errors.push(`Hazard at ${hazard.x} has unsafe vertical bounds.`);
    }

    if (
      (hazard.routeType === "optional" || hazard.routeType === "requiresPowerup") &&
      !canRejoinMainPath(mainPath, hazard.x, segment.length)
    ) {
      errors.push(`Optional hazard route at ${hazard.x} must rejoin the main path.`);
    }

    if (
      hazard.kind === "spike-long" &&
      segmentUnlockDistance < MIN_SPIKE_LONG_UNLOCK_DISTANCE
    ) {
      errors.push(
        `Long spike hazard at ${hazard.x} must unlock at ${MIN_SPIKE_LONG_UNLOCK_DISTANCE}px or later.`
      );
    }

    if (hazard.kind === "patrol-spike") {
      if (!hazard.patrol) {
        errors.push(`Patrol hazard at ${hazard.x} is missing patrol motion.`);
      } else {
        const minimumUnlock =
          hazard.patrol.axis === "y"
            ? MIN_VERTICAL_PATROL_UNLOCK_DISTANCE
            : MIN_HORIZONTAL_PATROL_UNLOCK_DISTANCE;
        if (segmentUnlockDistance < minimumUnlock) {
          errors.push(
            `Patrol hazard at ${hazard.x} must unlock at ${minimumUnlock}px or later.`
          );
        }

        if (!isPositiveFinite(hazard.patrol.distance)) {
          errors.push(`Patrol hazard at ${hazard.x} must move a positive finite distance.`);
        }

        if (hazard.patrol.durationMs < 600 || !Number.isFinite(hazard.patrol.durationMs)) {
          errors.push(`Patrol hazard at ${hazard.x} moves too fast for readable timing.`);
        }

        if (
          hazard.patrol.phaseMs !== undefined &&
          !isNonNegativeFinite(hazard.patrol.phaseMs)
        ) {
          errors.push(`Patrol hazard at ${hazard.x} must use a non-negative finite phase.`);
        }
      }
    }

    if (hazard.kind === "crusher") {
      if (!hazard.crusher) {
        errors.push(`Crusher at ${hazard.x} is missing crusher timing.`);
      } else {
        if (segmentUnlockDistance < MIN_CRUSHER_UNLOCK_DISTANCE) {
          errors.push(
            `Crusher at ${hazard.x} must unlock at ${MIN_CRUSHER_UNLOCK_DISTANCE}px or later.`
          );
        }

        const totalCycle =
          hazard.crusher.warningMs +
          hazard.crusher.slamMs +
          hazard.crusher.holdMs +
          hazard.crusher.returnMs;
        if (
          !isPositiveFinite(hazard.crusher.distance) ||
          !isPositiveFinite(hazard.crusher.warningMs) ||
          !isPositiveFinite(hazard.crusher.slamMs) ||
          !isPositiveFinite(hazard.crusher.holdMs) ||
          !isPositiveFinite(hazard.crusher.returnMs) ||
          !Number.isFinite(totalCycle)
        ) {
          errors.push(`Crusher at ${hazard.x} must have positive finite movement and timing.`);
        }

        if (hazard.crusher.warningMs < 450) {
          errors.push(`Crusher at ${hazard.x} needs at least 450ms warning time.`);
        }

        if (
          hazard.crusher.phaseMs !== undefined &&
          !isNonNegativeFinite(hazard.crusher.phaseMs)
        ) {
          errors.push(`Crusher at ${hazard.x} must use a non-negative finite phase.`);
        }
      }
    }

    if (
      hazard.kind === "thorn-vine" ||
      hazard.kind === "flame-vent" ||
      hazard.kind === "falling-rock"
    ) {
      const minimumUnlock =
        hazard.kind === "thorn-vine"
          ? MIN_THORN_VINE_UNLOCK_DISTANCE
          : MIN_TIMED_TRAP_UNLOCK_DISTANCE;
      if (segmentUnlockDistance < minimumUnlock) {
        errors.push(
          `${hazard.kind} at ${hazard.x} must unlock at ${minimumUnlock}px or later.`
        );
      }

      if (!hazard.timing) {
        errors.push(`${hazard.kind} at ${hazard.x} is missing timed warning data.`);
      } else {
        const totalCycle =
          hazard.timing.warningMs +
          hazard.timing.activeMs +
          hazard.timing.inactiveMs;
        if (
          !isPositiveFinite(hazard.timing.warningMs) ||
          !isPositiveFinite(hazard.timing.activeMs) ||
          !isPositiveFinite(hazard.timing.inactiveMs) ||
          !Number.isFinite(totalCycle)
        ) {
          errors.push(`${hazard.kind} at ${hazard.x} must have positive finite timing.`);
        }

        if (hazard.timing.warningMs < MIN_TIMED_WARNING_MS) {
          errors.push(
            `${hazard.kind} at ${hazard.x} needs at least ${MIN_TIMED_WARNING_MS}ms warning time.`
          );
        }

        if (
          hazard.timing.phaseMs !== undefined &&
          !isNonNegativeFinite(hazard.timing.phaseMs)
        ) {
          errors.push(`${hazard.kind} at ${hazard.x} must use a non-negative finite phase.`);
        }
      }
    }

    if (hazard.kind === "mud-pit") {
      if (segmentUnlockDistance < MIN_SOFT_TRAP_UNLOCK_DISTANCE) {
        errors.push(
          `Mud pit at ${hazard.x} must unlock at ${MIN_SOFT_TRAP_UNLOCK_DISTANCE}px or later.`
        );
      }

      const speedFactor = hazard.soft?.speedFactor ?? 0.65;
      const durationMs = hazard.soft?.durationMs ?? 260;
      if (
        !Number.isFinite(speedFactor) ||
        speedFactor <= 0 ||
        speedFactor >= 1 ||
        !isPositiveFinite(durationMs)
      ) {
        errors.push(`Mud pit at ${hazard.x} must define a readable slowing effect.`);
      }
    }

    if (
      hazard.kind === "crumbling-platform" &&
      segmentUnlockDistance < MIN_CRUMBLING_PLATFORM_UNLOCK_DISTANCE
    ) {
      errors.push(
        `Crumbling platform at ${hazard.x} must unlock at ${MIN_CRUMBLING_PLATFORM_UNLOCK_DISTANCE}px or later.`
      );
    }
  });

  if (
    enemies.length > 0 &&
    segmentUnlockDistance < MIN_ENEMY_UNLOCK_DISTANCE
  ) {
    errors.push(
      `Stompable enemies must unlock at ${MIN_ENEMY_UNLOCK_DISTANCE}px or later.`
    );
  }

  enemies.forEach((enemy) => {
    validateCapabilityRoute(enemy, segment, errors, `Enemy at ${enemy.x}`);

    if (!isNonNegativeFinite(enemy.x) || !isNonNegativeFinite(enemy.y)) {
      errors.push(`Enemy at ${enemy.x} must have non-negative finite position.`);
    }

    if (!isPositiveFinite(enemy.width) || !isPositiveFinite(enemy.height)) {
      errors.push(`Enemy at ${enemy.x} must have positive finite size.`);
    }

    if (enemy.y < 0 || enemyMaxY(enemy) > WORLD_CONFIG.floorKillY) {
      errors.push(`Enemy at ${enemy.x} has unsafe vertical bounds.`);
    }

    if (
      (enemy.routeType === "optional" || enemy.routeType === "requiresPowerup") &&
      !canRejoinMainPath(mainPath, enemy.x, segment.length)
    ) {
      errors.push(`Optional enemy route at ${enemy.x} must rejoin the main path.`);
    }

    if (
      (enemy.kind === "bat" ||
        enemy.kind === "mole" ||
        enemy.kind === "flower-turret" ||
        enemy.kind === "beetle") &&
      segmentUnlockDistance < MIN_ADVANCED_ENEMY_UNLOCK_DISTANCE
    ) {
      errors.push(
        `${enemy.kind} at ${enemy.x} must unlock at ${MIN_ADVANCED_ENEMY_UNLOCK_DISTANCE}px or later.`
      );
    }

    if (enemy.patrol) {
      if (!isPositiveFinite(enemy.patrol.distance)) {
        errors.push(`Enemy at ${enemy.x} must patrol a positive finite distance.`);
      }

      if (enemy.patrol.durationMs < 600 || !Number.isFinite(enemy.patrol.durationMs)) {
        errors.push(`Enemy at ${enemy.x} patrols too fast for readable timing.`);
      }

      if (
        enemy.patrol.phaseMs !== undefined &&
        !isNonNegativeFinite(enemy.patrol.phaseMs)
      ) {
        errors.push(`Enemy at ${enemy.x} must use a non-negative finite phase.`);
      }
    }

    if (
      enemy.bounceVelocity !== undefined &&
      !isPositiveFinite(enemy.bounceVelocity)
    ) {
      errors.push(`Enemy at ${enemy.x} must use a positive finite bounce velocity.`);
    }
  });

  for (const coin of segment.coins.filter((entry) => entry.type === "risk")) {
    if (segmentUnlockDistance < MIN_RISK_COIN_UNLOCK_DISTANCE) {
      errors.push(
        `Risk coin ${coin.x} must unlock at ${MIN_RISK_COIN_UNLOCK_DISTANCE}px or later.`
      );
    }

    if (coin.x < 96 || coin.x > segment.length - 96) {
      errors.push(`Risk coin ${coin.x} is too close to the segment edge.`);
    }

    const supportedLanding = mainPath.some((platform) => {
      if (!platformContainsX(platform, coin.x)) {
        return false;
      }

      return platform.width <= PLAYER_CONFIG.minLandingWidth * 2;
    });
    const supportedGap = riskCoinOverMainPathGap(mainPath, coin.x);

    const supportedHazard = segment.hazards.some(
      (hazard) => coin.x >= hazard.x - 32 && coin.x <= hazard.x + hazard.width + 32
    );
    const supportedEnemy = enemies.some(
      (enemy) => coin.x >= enemy.x - 32 && coin.x <= enemy.x + enemy.width + 32
    );

    if (!supportedLanding && !supportedGap && !supportedHazard && !supportedEnemy) {
      errors.push(`Risk coin ${coin.x} is not anchored to a real risk line.`);
    }
  }

  segment.coins.forEach((coin) => {
    validateCapabilityRoute(coin, segment, errors, `Coin at ${coin.x}`);
  });

  segment.coins
    .filter(
      (coin) => coin.routeType === "optional" || coin.routeType === "requiresPowerup"
    )
    .forEach((coin) => {
      if (!canRejoinMainPath(mainPath, coin.x, segment.length)) {
        errors.push(`Optional reward route at ${coin.x} must rejoin the main path.`);
      }
    });

  pickups.forEach((pickup) => {
    validateCapabilityRoute(pickup, segment, errors, `Pickup at ${pickup.x}`);

    if (!isNonNegativeFinite(pickup.x) || !isNonNegativeFinite(pickup.y)) {
      errors.push(`Pickup at ${pickup.x} must have non-negative finite position.`);
    }

    if (pickup.x < 48 || pickup.x > segment.length - 48) {
      errors.push(`Pickup ${pickup.x} is too close to the segment edge.`);
    }

    if (
      (pickup.routeType === "optional" || pickup.routeType === "requiresPowerup") &&
      !canRejoinMainPath(mainPath, pickup.x, segment.length)
    ) {
      errors.push(`Optional pickup route at ${pickup.x} must rejoin the main path.`);
    }
  });

  return {
    segmentId: segment.id,
    errors
  };
}

export function validateSegmentTransition(
  currentSegment: SegmentDefinition,
  nextSegment: SegmentDefinition
): SegmentValidationReport {
  const errors: string[] = [];
  const currentPath = mainPathPlatforms(currentSegment);
  const nextPath = mainPathPlatforms(nextSegment);
  const current = currentPath[currentPath.length - 1];
  const next = nextPath[0];

  if (current && next) {
    validatePlatformTransition({
      current,
      next: {
        ...next,
        x: currentSegment.length + next.x
      },
      errors,
      label: `${currentSegment.id}->${nextSegment.id}`
    });
  }

  return {
    segmentId: `${currentSegment.id}->${nextSegment.id}`,
    errors
  };
}

export function assertValidSegments(segments: SegmentDefinition[]): void {
  const reports: SegmentValidationReport[] = [];
  const seenSegmentIds = new Set<string>();

  for (const segment of segments) {
    if (seenSegmentIds.has(segment.id)) {
      reports.push({
        segmentId: segment.id,
        errors: [`Duplicate segment id "${segment.id}".`]
      });
    }
    seenSegmentIds.add(segment.id);
  }

  reports.push(...segments.flatMap((segment) => {
    const segmentReport = validateSegment(segment);
    return segmentReport.errors.length > 0 ? [segmentReport] : [];
  }));

  for (const currentSegment of segments) {
    for (const nextSegment of segments) {
      const transitionReport = validateSegmentTransition(currentSegment, nextSegment);
      if (transitionReport.errors.length > 0) {
        reports.push(transitionReport);
      }
    }
  }

  if (reports.length === 0) {
    return;
  }

  const detail = reports
    .map((report) => `${report.segmentId}: ${report.errors.join(" | ")}`)
    .join("\n");

  throw new Error(`Invalid segment catalog:\n${detail}`);
}
