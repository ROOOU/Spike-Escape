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
5. Implement pure input modeling for keyboard and touch.
6. Implement local score persistence helpers.

## Phase 3: Runtime Gameplay

1. Generate code-drawn textures in `BootScene`.
2. Build `GameScene` with Arcade Physics and a forward-only camera anchor.
3. Add player movement with coyote time and jump buffering.
4. Spawn weighted segments and recycle them behind the camera.
5. Add hazards, coins, HUD, and wall motion.
6. Add `ResultScene` restart flow and best-score update.

## Phase 4: Verification

1. Run unit and regression tests.
2. Run a production build.
3. Manually verify keyboard play on desktop.
4. Manually verify touch controls in a mobile-sized viewport.
