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
