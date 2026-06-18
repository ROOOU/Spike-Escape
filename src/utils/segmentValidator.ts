import { PLAYER_CONFIG } from "../config/playerConfig";
import type { PlatformDefinition, SegmentDefinition } from "../types/segments";

export interface SegmentValidationReport {
  segmentId: string;
  errors: string[];
}

function mainPathPlatforms(segment: SegmentDefinition): PlatformDefinition[] {
  return segment.platforms
    .filter((platform) => platform.mainPath)
    .sort((a, b) => a.x - b.x);
}

function computeFlightTime(dy: number): number | null {
  const v = PLAYER_CONFIG.jumpVelocity;
  const g = PLAYER_CONFIG.gravity;
  const discriminant = v * v + 2 * g * dy;

  if (discriminant <= 0) {
    return null;
  }

  return (v + Math.sqrt(discriminant)) / g;
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

export function validateSegment(segment: SegmentDefinition): SegmentValidationReport {
  const errors: string[] = [];
  const mainPath = mainPathPlatforms(segment);

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
    ...segment.hazards.map((hazard) => hazard.x + hazard.width)
  );

  if (highestExtent > segment.length) {
    errors.push("Segment geometry extends beyond segment length.");
  }

  const maxJumpRise =
    (PLAYER_CONFIG.jumpVelocity * PLAYER_CONFIG.jumpVelocity) /
    (2 * PLAYER_CONFIG.gravity);

  for (let index = 0; index < mainPath.length - 1; index += 1) {
    const current = mainPath[index];
    const next = mainPath[index + 1];
    const gap = next.x - (current.x + current.width);
    const dy = next.y - current.y;

    if (dy < 0 && Math.abs(dy) > maxJumpRise) {
      errors.push(`Main path rises too high between ${current.x} and ${next.x}.`);
    }

    const flightTime = computeFlightTime(dy);
    if (flightTime === null) {
      errors.push(`Unreachable vertical transition between ${current.x} and ${next.x}.`);
      continue;
    }

    const safeReach = PLAYER_CONFIG.boostRunSpeed * flightTime * 0.8;
    if (gap > safeReach) {
      errors.push(`Gap ${gap} exceeds safe reach ${safeReach.toFixed(1)}.`);
    }

    if (next.width < PLAYER_CONFIG.minLandingWidth) {
      errors.push(`Landing width ${next.width} is below ${PLAYER_CONFIG.minLandingWidth}.`);
    }
  }

  if (segment.allowWallSprint && segment.metadata.consecutivePits) {
    errors.push("Wall sprint cannot be enabled on consecutive-pit segments.");
  }

  if (segment.paceTier === "onboarding") {
    errors.push("Only the start segment may use onboarding pace.");
  }

  if (segment.metadata.introOrder !== undefined) {
    if (segment.hazards.length > 0) {
      errors.push("Intro segments cannot contain hazards.");
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

  for (const coin of segment.coins.filter((entry) => entry.type === "risk")) {
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

    if (!supportedLanding && !supportedGap && !supportedHazard) {
      errors.push(`Risk coin ${coin.x} is not anchored to a real risk line.`);
    }
  }

  return {
    segmentId: segment.id,
    errors
  };
}

export function assertValidSegments(segments: SegmentDefinition[]): void {
  const reports = segments
    .map(validateSegment)
    .filter((report) => report.errors.length > 0);

  if (reports.length === 0) {
    return;
  }

  const detail = reports
    .map((report) => `${report.segmentId}: ${report.errors.join(" | ")}`)
    .join("\n");

  throw new Error(`Invalid segment catalog:\n${detail}`);
}
