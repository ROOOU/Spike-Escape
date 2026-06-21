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
- `assets/generatedTextures.ts`: centralized Phaser texture generation for code-drawn platforms, hazards, pickups, tutorial icons, enemies, and wall art. Large concept sheets are not loaded at runtime.

### Config Modules

- `playerConfig.ts`: manual movement envelope, jump tuning, hitbox inset, and minimum landing width
- `jumpPhysics.ts`: pure derivation of gravity, jump velocity, flight time, and horizontal reach from designer-facing jump targets
- The player sprite is loaded from the reference-style `player3.png`; its visual size and gameplay hitbox are configured separately so art changes do not retune movement.
- `wallConfig.ts`: state timings, speed factors, collision geometry
- `scoreConfig.ts`: distance unit conversion, coin values, storage keys
- `segments.ts`: start segment plus weighted segment catalog
- `gameConfig.ts`: viewport, tile size, world, camera, and recycle thresholds

### Systems

- `InputController`: runtime bridge from Phaser keyboard + DOM touch buttons to a unified input snapshot, including one-frame queues for short keyboard and touch taps
- `inputModel.ts`: pure keyboard/touch mapping, queued tap behavior, and edge-trigger detection
- `PlayerController`: movement, gravity, coyote time, jump buffer, landing state, and a separate visual layer for non-physical squash/stretch feedback
- `playerJump.ts`: pure variable-jump release logic for short-hop velocity cuts
- `FeedbackEffects.ts`: lightweight generated-texture bursts and floating labels for jump, landing, coin, and stomp feedback
- `SegmentManager`: segment selection, spawning, recycling, active-segment lookup, and runtime segment sequence bookkeeping
- `CoinManager`: score collectible spawning and one-time coin handling
- `PickupManager`: non-score pickup spawning and one-time state pickup handling
- `EnemyManager`: stompable and avoidance enemy spawning, short patrol lanes, top-stomp resolution, bounce, and cleanup
- `HazardManager`: static thorns, soft mud pits, animated patrol thorns, timed vines/flames/rocks, timed thorn presses, and collision callbacks
- `SpikeWallSystem`: runtime wall motion and visuals driven by a pure state machine plus player progress delta
- `wallMachine.ts`: pure wall-pressure model for opening grace, stall/backtrack pressure, forward-progress recovery, sprint cooldowns, and collision threshold logic
- `scoreTracker.ts`: pure anti-farming score logic based on furthest progress
- `HUD.ts`: fixed-screen run telemetry plus coin, risk-coin, stomp, and pressure event feedback
- `eventFeedbackConfig.ts`: pure event-feedback copy, icon, color, and duration presets used by the HUD

## Locked Player Physics

`playerConfig.ts` treats the designer-facing values as the source of truth:

- maximum jump rise: `120px`
- early-release short-hop rise: `48px`
- time to apex: `0.5s`
- forward speed: `300px/s`
- reverse speed: `170px/s`
- air control factor: `0.9`
- gameplay hitbox: `20x40px`

`jumpPhysics.ts` derives the runtime values:

- gravity: about `960px/s^2`
- jump launch velocity: about `480px/s`
- short-hop cut velocity: about `303.58px/s`
- same-height airtime: `1.0s`
- short-hop same-height airtime: about `0.63s`
- same-height theoretical reach: `300px`
- same-height practical validation reach: about `234px`

Phaser Arcade gravity is single-sourced. The global Arcade world gravity is `0`; the player body receives the derived gravity. This prevents the runtime from applying gravity twice while the segment validator only applies it once.

Variable jump height is implemented by cutting upward velocity when the jump input is released during ascent. Holding jump preserves the full launch velocity; releasing early clamps upward speed to the short-hop velocity. This gives multiple jump strengths without changing the validated full-jump envelope used by main-route segment checks.

## Data Model

Segments are configuration objects with:

- length
- difficulty
- weight
- pressure level
- `allowWallSprint`
- metadata flags such as `consecutivePits`, authored intro order, decorative density, and optional presentation notes
- `unlockDistancePx` for distance-gated segment and hazard progression
- `themeTag`, `hazardBudget`, `enemyBudget`, `reactionDistancePx`, and optional route tags for readable pacing constraints
- platform definitions
- hazard definitions
- coin definitions
- pickup definitions

Platforms are defined from top-left coordinates and size. Coins use explicit world-center positions. Main-route platforms are tagged so validation can reason about passability.

The runtime planner layers an authored beat model on top of this catalog:

- onboarding sequence for first-run readability
- build-up and reward beats to create route-reading space
- pressure and wall beats to sharpen urgency
- recovery beats to prevent unfair chaining
- climax beats for occasional high-intensity spikes
- theme-repeat limits so the stream avoids showing the same garden biome too many times in a row

The planner gates mechanics by authored map distance, not score. `SegmentManager` passes the next segment's map start distance into `pickPlannedSegment`; the planner filters by `metadata.unlockDistancePx`, difficulty cap, pace tier, chapter, recent intensity, and beat. Coin score and total score are not part of the planner state, so collecting risk coins cannot unlock hazards early. Elapsed time also does not unlock segment difficulty; it remains relevant only to runtime wall-state timing.

Key distance unlocks:

- first static thorn tutorial: around `DIST 30-40` (`960-1280px` from start)
- long thorn strips: `1600px+`
- stompable enemies and static-thorn practice: `3200px+`
- risk routes: `5200px+`
- horizontal patrol thorns: `6400px+`
- mud pits and retracting thorn vines: `7200px+`
- vertical patrol thorns: `9000px+`
- flame vents, falling rocks, and advanced enemy reads: `10400px+`
- crushers: `11000px+`
- dense mixed gauntlets: `15000px+`

## Validation

Before runtime use, the segment catalog is checked for:

- main-route presence,
- maximum reachable gap,
- minimum landing width,
- maximum upward jump rise,
- adjacent upward step bans that would block Arcade Physics movement,
- landing-window checks so a jump cannot merely touch a platform edge,
- practical-reach checks that assume less than theoretical full speed,
- controlled-jump checks that account for player air control instead of requiring held max speed,
- minimum practical-reach margin of `24px`,
- minimum controlled landing-window margin of `16px`,
- full-body landing bounds that include the player hitbox and margin,
- segment-boundary transitions for every catalog pair,
- wall-sprint bans on consecutive-pit layouts,
- mechanical-trap timing and movement bounds,
- enemy placement, patrol timing, and bounce configuration bounds,
- distance unlock thresholds for risk coins, wall sprint, static hazards, patrol hazards, mud pits, thorn vines, flame vents, falling rocks, crushers, stompable enemies, and advanced enemies,
- hazard and enemy budget ceilings,
- minimum reaction distance before the first danger,
- optional route rejoin checks for rewards, pickups, enemies, and traps,
- risk-reward anchoring to narrow landings, gaps, hazards, or enemy pressure,
- unsafe intro and recovery beat content,
- fake risk-coin placements,
- segment length consistency.

Invalid data throws during startup rather than failing silently in play.

The validator and player runtime both use the same derived jump physics. A segment is invalid if it requires more than the practical horizontal reach, a rise above 90% of max jump height, an edge-perfect landing, or a landing platform below the minimum safe width.

## Persistence

The only required persistent state is local best score. Storage is wrapped behind a small utility so tests can inject a fake storage object.

## Bundle Strategy

- Phaser is emitted as a dedicated production chunk through Vite `manualChunks`.
- The entry chunk should stay small enough to render the page shell and load the game runtime asynchronously.
- Business modules should not be split aggressively until they become materially large; current game logic is smaller than the Phaser runtime by orders of magnitude.
- `npm run check:bundle` enforces gzip budgets for entry JS, total JS, CSS, and raw reference assets after production build.
- Runtime art is split conceptually into player/reference art plus generated terrain, pickups, hazards, enemies, decor/UI/SFX cues. The concept atlas images remain source references, not shipped runtime assets.

## Test Strategy

- Score tests verify furthest-progress scoring and backward-movement anti-farming.
- Wall tests verify state transitions, cooldowns, and collision threshold logic.
- Segment planner tests cover authored onboarding order, pacing cooldown behavior, and anti-randomness constraints.
- Segment validation tests cover solvable segments and explicit invalid layouts.
- Budget and readability tests cover v1.5 hazard budgets, reaction distance, soft/timed trap gates, and enemy-anchored risk rewards.
- Event feedback tests cover coin, stomp, mud slowdown, and bubble shield copy/icon presets.
- Distance-gating tests verify that score and elapsed time do not unlock hazard segments early.
- Jump physics tests cover design-value derivation, single-sourced Arcade gravity, vertical flight time, short-hop values, and practical horizontal reach.
- Player jump tests cover early-release velocity cuts and no-op behavior while holding, near apex, or falling.
- Input tests cover keyboard aggregation, key alias mapping, touch-button press/release behavior, and queued quick taps.
- Storage tests cover save/load behavior and invalid persisted values.
- Regression tests scan shipped docs and UI-facing source files to ensure legacy naming does not reappear.
