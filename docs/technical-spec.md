# Spike Escape Technical Spec

## Stack

- Phaser `3.90`
- TypeScript
- Vite
- Vitest with `jsdom` for pure logic and DOM input tests

## Runtime Architecture

### Scenes

- `BootScene`: generates procedural textures and starts the game scene
- `GameScene`: owns the ready gate, live run, physics, camera, UI, and system orchestration
- `ResultScene`: overlays end-of-run stats and restart affordances

### Game Bootstrap

- `main.ts`: lightweight browser entry that loads CSS, validates the game container, and dynamically imports the runtime bootstrap.
- `game/startGame.ts`: creates the Phaser game instance and owns Phaser-specific configuration.
- `game/scenes.ts`: central scene registry.
- `assets/referenceAssets.ts`: manifest for external reference-style image assets loaded by `BootScene`.
- `assets/generatedTextures.ts`: centralized Phaser texture generation for code-drawn sprites, platforms, hazards, and wall art.

### Config Modules

- `playerConfig.ts`: movement envelope, jump tuning, hitbox inset
- `wallConfig.ts`: state timings, speed factors, collision geometry
- `scoreConfig.ts`: distance unit conversion, coin values, storage keys
- `segments.ts`: start segment plus weighted segment catalog
- `gameConfig.ts`: viewport, tile size, world, camera, and recycle thresholds

### Systems

- `InputController`: runtime bridge from Phaser keyboard + DOM touch buttons to a unified input snapshot, including one-frame queues for short keyboard and touch taps
- `inputModel.ts`: pure keyboard/touch mapping, queued tap behavior, and edge-trigger detection
- `PlayerController`: movement, gravity, coyote time, jump buffer, and landing state
- `SegmentManager`: segment selection, spawning, recycling, active-segment lookup, and runtime segment sequence bookkeeping
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
- metadata flags such as `consecutivePits`, authored intro order, decorative density, and optional presentation notes
- platform definitions
- hazard definitions
- coin definitions

Platforms are defined from top-left coordinates and size. Coins use explicit world-center positions. Main-route platforms are tagged so validation can reason about passability.

The runtime planner layers an authored beat model on top of this catalog:

- onboarding sequence for first-run readability
- build-up and reward beats to create route-reading space
- pressure and wall beats to sharpen urgency
- recovery beats to prevent unfair chaining
- climax beats for occasional high-intensity spikes

## Validation

Before runtime use, the segment catalog is checked for:

- main-route presence,
- maximum reachable gap,
- minimum landing width,
- maximum upward jump rise,
- wall-sprint bans on consecutive-pit layouts,
- unsafe intro and recovery beat content,
- fake risk-coin placements,
- segment length consistency.

Invalid data throws during startup rather than failing silently in play.

## Persistence

The only required persistent state is local best score. Storage is wrapped behind a small utility so tests can inject a fake storage object.

## Bundle Strategy

- Phaser is emitted as a dedicated production chunk through Vite `manualChunks`.
- The entry chunk should stay small enough to render the page shell and load the game runtime asynchronously.
- Business modules should not be split aggressively until they become materially large; current game logic is smaller than the Phaser runtime by orders of magnitude.
- `npm run check:bundle` enforces gzip budgets for entry JS, total JS, CSS, and raw reference assets after production build.

## Test Strategy

- Score tests verify furthest-progress scoring and backward-movement anti-farming.
- Wall tests verify state transitions, cooldowns, and collision threshold logic.
- Segment planner tests cover authored onboarding order, pacing cooldown behavior, and anti-randomness constraints.
- Segment validation tests cover solvable segments and explicit invalid layouts.
- Input tests cover keyboard aggregation, key alias mapping, touch-button press/release behavior, and queued quick taps.
- Storage tests cover save/load behavior and invalid persisted values.
- Regression tests scan shipped docs and UI-facing source files to ensure legacy naming does not reappear.
