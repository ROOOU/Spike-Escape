# Spike Escape Implementation Plan

## Phase 1: Bootstrap

1. Create the Vite + TypeScript package shell.
2. Add Phaser and Vitest tooling.
3. Split docs into README, PRD, technical spec, and this plan.

## Phase 2: Pure Gameplay Logic

1. Define game, player, wall, score, and segment configs.
2. Implement score tracking from furthest progress.
3. Implement wall state machine and collision threshold helper.
4. Implement segment validation utilities.
5. Add a pacing planner that turns weighted segments into authored run beats and act-like progression.
5. Implement pure input modeling for keyboard and touch.
6. Implement local score persistence helpers.

## Phase 3: Runtime Gameplay

1. Generate code-drawn textures in `BootScene`.
2. Build `GameScene` with Arcade Physics and a forward-only camera anchor.
3. Add player movement with coyote time and jump buffering.
4. Spawn paced segments and recycle them behind the camera.
5. Add hazards, coins, HUD, wall motion, and clear in-run beat feedback.
6. Add `ResultScene` restart flow, best-score update, and run-summary feedback that reflects the act-like structure reached.
7. Add v1.5 black-garden mechanics: soft mud pits, long thorns, retracting vines, flame vents, falling rocks, expanded enemies, pickups, and shield-state feedback.

## Phase 4: Verification

1. Run unit and regression tests.
2. Run a production build.
3. Run bundle budget checks.
4. Manually verify keyboard play on desktop.
5. Manually verify touch controls in a mobile-sized viewport.

## Phase 5: Maintainability

1. Keep Phaser isolated as a cacheable vendor chunk.
2. Keep `main.ts` lightweight and avoid pulling game runtime dependencies into the entry chunk.
3. Keep asset loading centralized through manifests instead of hardcoding every resource in scenes.
4. Revisit deeper code splitting only if business modules become materially larger than the current Phaser runtime.

## Optimization Checklist

### Completed In Current Optimization Pass

1. Add non-colliding hazard telegraphs: static spike base markers, patrol rails, and crusher warning zones.
2. Harden segment catalog validation for duplicate IDs, finite dimensions, positive weights, mechanic unlock floors, and risk-route anchoring.
3. Align recovery and precision segment metadata with progression floors instead of changing player physics.
4. Add map-distance stage labels to HUD feedback so mechanic teaching follows authored distance thresholds rather than score.
5. Move the first low static thorn to the `DIST 30-40` band and increase later trap density by lowering patrol/crusher/gauntlet unlocks.
6. Add stompable ground enemies with top-stomp bounce, side-contact death, patrol lanes, and validator coverage.
7. Replace fixed wall advance with a distance-pressure chase model that punishes stalls/backtracking and recovers on forward progress.
8. Add high-contrast black-garden visual treatment, generated tutorial icons, and remove missing tutorial image loads.
9. Add segment metadata for `themeTag`, `hazardBudget`, `enemyBudget`, `reactionDistancePx`, and route tags.
10. Add bubble-shield pickups as non-score state pickups with visible player aura and one-hit trap/enemy protection.
11. Add validator coverage for hazard budgets, reaction distance, optional-route safety, v1.5 unlock gates, and enemy-anchored risk rewards.

### Next Optimization Queue

1. Add browser-tuned contrast review for warning-zone alpha on both desktop and mobile viewport.
2. Add lightweight runtime pooling for repeated telegraph, pickup, and enemy helpers only if profiling shows object churn during long runs.
3. Add optional audio, screen-shake, or haptic-style cues for crusher, flame, falling rock, shield pop, and risk seed collection.
4. Replace generated placeholder hazard/enemy art with packed source atlas slices when final production assets are ready.
5. Add enemy projectile behavior for flower turrets only after projectile timing is covered by validator tests.

### Ongoing Rules

1. Run `npm run test -- --run test/segmentValidator.test.ts test/segmentPlanner.test.ts` after segment catalog or progression-rule changes.
2. Run `npm run build` before release branches and treat bundle-budget failures as release blockers.
3. Preserve player core physics when a segment fails validation; adjust segment spacing, widths, metadata unlocks, or hazard timing first.
4. Keep hazard, coin, and segment spawning pooled or recycled in runtime systems before adding new per-frame allocations.
5. Keep advanced mechanics tied to map-distance unlocks so score, elapsed time, or random weighting cannot surface them early.
6. Recheck risk-coin branches for an obvious support line: narrow landing, clear gap arc, or nearby hazard read.
7. Keep main routes independent of speed/jump/glide pickups until a matching `CapabilityProfile` validator exists.
