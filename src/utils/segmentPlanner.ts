import { SEGMENT_CATALOG } from "../config/segments";
import type {
  PaceTier,
  PressureLevel,
  SegmentDefinition,
  SegmentRole
} from "../types/segments";

const PACE_ORDER: PaceTier[] = ["onboarding", "early", "mid", "late"];
const INTENSE_ROLES = new Set<SegmentRole>(["hazard", "precision", "gauntlet"]);
const COOLING_PRESSURES = new Set<PressureLevel>(["low", "recovery"]);
const ACT_PATTERN = ["build", "reward", "pressure", "recovery", "build", "climax"] as const;

type PacingBeat = NonNullable<SegmentDefinition["metadata"]["pacingBeat"]>;

export interface SegmentPlanState {
  generatedCount: number;
  progressAnchorX: number;
  elapsedMs: number;
  recent: SegmentDefinition[];
}

function countRiskCoins(segment: SegmentDefinition): number {
  return segment.coins.filter((coin) => coin.type === "risk").length;
}

function isIntenseSegment(segment: SegmentDefinition): boolean {
  return segment.pressure === "high" || INTENSE_ROLES.has(segment.role) || countRiskCoins(segment) > 0;
}

function difficultyCap(progressAnchorX: number, elapsedMs: number): number {
  return Math.min(
    3,
    Math.max(1, 1 + Math.floor(progressAnchorX / 2400), 1 + Math.floor(elapsedMs / 20000))
  );
}

function paceCap(progressAnchorX: number, elapsedMs: number): PaceTier {
  const score = Math.max(progressAnchorX / 2600, elapsedMs / 22000);

  if (score < 1.3) {
    return "early";
  }

  if (score < 3.4) {
    return "mid";
  }

  return "late";
}

function allowsTier(segment: SegmentDefinition, cap: PaceTier): boolean {
  return PACE_ORDER.indexOf(segment.paceTier) <= PACE_ORDER.indexOf(cap);
}

function introSequence(): SegmentDefinition[] {
  return SEGMENT_CATALOG
    .filter((segment) => segment.metadata.introOrder !== undefined)
    .sort((a, b) => (a.metadata.introOrder ?? 0) - (b.metadata.introOrder ?? 0));
}

function chapterCap(progressAnchorX: number, elapsedMs: number): number {
  if (progressAnchorX < 3200 && elapsedMs < 28000) {
    return 1;
  }

  if (progressAnchorX < 7200 && elapsedMs < 60000) {
    return 2;
  }

  return 3;
}

function actBeatIndex(generatedCount: number): number {
  const introLength = introSequence().length;
  return Math.max(0, generatedCount - introLength) % ACT_PATTERN.length;
}

function targetBeat(generatedCount: number): PacingBeat {
  return ACT_PATTERN[actBeatIndex(generatedCount)];
}

function segmentBeat(segment: SegmentDefinition): PacingBeat {
  return segment.metadata.pacingBeat ?? "build";
}

function preferBeat(
  candidates: SegmentDefinition[],
  beat: PacingBeat
): SegmentDefinition[] {
  const matches = candidates.filter((segment) => segmentBeat(segment) === beat);
  return matches.length > 0 ? matches : candidates;
}

function preferChapter(
  candidates: SegmentDefinition[],
  chapter: number
): SegmentDefinition[] {
  const matches = candidates.filter((segment) => (segment.metadata.chapter ?? 1) <= chapter);
  return matches.length > 0 ? matches : candidates;
}

function applyRecentConstraints(
  candidates: SegmentDefinition[],
  recent: SegmentDefinition[]
): SegmentDefinition[] {
  const last = recent[recent.length - 1];
  const previous = recent[recent.length - 2];
  const recentIntense = recent.filter(isIntenseSegment).length;
  const chainedIntensity =
    recentIntense >= 2 ||
    (last !== undefined && previous !== undefined && isIntenseSegment(last) && isIntenseSegment(previous));

  let next = [...candidates];

  if (last) {
    next = next.filter((segment) => segment.id !== last.id);
  }

  if (last && chainedIntensity) {
    const recoveryCandidates = next.filter(
      (segment) =>
        segmentBeat(segment) === "recovery" ||
        segment.role === "recovery" ||
        (segment.role === "runway" && COOLING_PRESSURES.has(segment.pressure))
    );
    if (recoveryCandidates.length > 0) {
      next = recoveryCandidates;
    }
    return next;
  }

  if (!last) {
    return next;
  }

  if (isIntenseSegment(last)) {
    const coolerCandidates = next.filter(
      (segment) =>
        COOLING_PRESSURES.has(segment.pressure) ||
        segmentBeat(segment) === "recovery"
    );
    if (coolerCandidates.length > 0) {
      next = coolerCandidates;
    }
  }

  if (last.role !== "runway" && last.role !== "recovery") {
    const variedCandidates = next.filter((segment) => segment.role !== last.role);
    if (variedCandidates.length > 0) {
      next = variedCandidates;
    }
  }

  if (segmentBeat(last) === "reward") {
    const nonRewardCandidates = next.filter((segment) => segmentBeat(segment) !== "reward");
    if (nonRewardCandidates.length > 0) {
      next = nonRewardCandidates;
    }
  }

  if (countRiskCoins(last) > 0) {
    const saferRewardCandidates = next.filter((segment) => countRiskCoins(segment) === 0);
    if (saferRewardCandidates.length > 0) {
      next = saferRewardCandidates;
    }
  }

  return next;
}

function pickWeighted(
  candidates: SegmentDefinition[],
  random: () => number
): SegmentDefinition {
  const totalWeight = candidates.reduce((sum, segment) => sum + segment.weight, 0);
  let roll = random() * totalWeight;

  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) {
      return candidate;
    }
  }

  return candidates[candidates.length - 1];
}

export function describePlannedBeat(generatedCount: number): PacingBeat {
  if (generatedCount < introSequence().length) {
    return segmentBeat(introSequence()[generatedCount]);
  }

  return targetBeat(generatedCount);
}

export function pickPlannedSegment(
  state: SegmentPlanState,
  random: () => number = Math.random
): SegmentDefinition {
  const intro = introSequence();
  if (state.generatedCount < intro.length) {
    return intro[state.generatedCount];
  }

  const cap = difficultyCap(state.progressAnchorX, state.elapsedMs);
  const pace = paceCap(state.progressAnchorX, state.elapsedMs);
  const chapter = chapterCap(state.progressAnchorX, state.elapsedMs);
  const beat = targetBeat(state.generatedCount);

  let candidates = SEGMENT_CATALOG.filter(
    (segment) => segment.difficulty <= cap && allowsTier(segment, pace)
  );

  candidates = preferChapter(candidates, chapter);
  candidates = applyRecentConstraints(candidates, state.recent);
  candidates = preferBeat(candidates, beat);

  if (candidates.length === 0) {
    candidates = SEGMENT_CATALOG.filter(
      (segment) => segment.difficulty <= cap && allowsTier(segment, pace)
    );
  }

  return pickWeighted(candidates, random);
}
