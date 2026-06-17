# Spike Escape Technical Spec

## Stack

- Phaser `3.90`
- TypeScript
- Vite
- Vitest with `jsdom` for pure logic and DOM input tests

## Runtime Architecture

### Scenes

- `BootScene`: generates procedural textures and starts the game scene
- `GameScene`: owns the live run, physics, camera, UI, and system orchestration
- `ResultScene`: overlays end-of-run stats and restart affordances

### Config Modules

- `playerConfig.ts`: movement envelope, jump tuning, hitbox inset
- `wallConfig.ts`: state timings, speed factors, collision geometry
- `scoreConfig.ts`: distance unit conversion, coin values, storage keys
- `segments.ts`: start segment plus weighted segment catalog
- `gameConfig.ts`: viewport, tile size, world, camera, and recycle thresholds

### Systems

- `InputController`: runtime bridge from Phaser keyboard + DOM touch buttons to a unified input snapshot
- `inputModel.ts`: pure keyboard/touch mapping and edge-trigger detection
- `PlayerController`: movement, gravity, coyote time, jump buffer, and landing state
- `SegmentManager`: segment selection, spawning, recycling, and active-segment lookup
- `CoinManager`: collectible spawning and one-time pickup handling
- `HazardManager`: spike spawning and collision callbacks
- `SpikeWallSystem`: runtime wall motion and visuals driven by a pure state machine
- `wallMachine.ts`: pure state machine for wall phases and sprint cooldown logic
- `scoreTracker.ts`: pure anti-farming score logic based on furthest progress
- `HUD.ts`: fixed-screen run telemetry

## Data Model

Segments are configuration objects with:

- length
- difficulty
- weight
- pressure level
- `allowWallSprint`
- metadata flags such as `consecutivePits`
- platform definitions
- hazard definitions
- coin definitions

Platforms are defined from top-left coordinates and size. Coins use explicit world-center positions. Main-route platforms are tagged so validation can reason about passability.

## Validation

Before runtime use, the segment catalog is checked for:

- main-route presence,
- maximum reachable gap,
- minimum landing width,
- maximum upward jump rise,
- wall-sprint bans on consecutive-pit layouts,
- segment length consistency.

Invalid data throws during startup rather than failing silently in play.

## Persistence

The only required persistent state is local best score. Storage is wrapped behind a small utility so tests can inject a fake storage object.

## Test Strategy

- Score tests verify furthest-progress scoring and backward-movement anti-farming.
- Wall tests verify state transitions, cooldowns, and collision threshold logic.
- Segment validation tests cover solvable segments and explicit invalid layouts.
- Input tests cover keyboard aggregation and touch-button press/release behavior.
- Storage tests cover save/load behavior and invalid persisted values.
- Regression tests scan shipped docs and UI-facing source files to ensure legacy naming does not reappear.
