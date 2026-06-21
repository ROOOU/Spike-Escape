# Spike Escape

Spike Escape is a web-first Phaser prototype for a 2D endless escape runner set in a high-contrast black garden. The player moves only when the player presses left/right, can jump to cross authored platform gaps, stomp readable enemies from above, pick up short-lived status items such as the bubble shield, and must survive pits, thorns, timed traps, risky seed routes, and a pressure-based spike wall.

## Gameplay Summary

- Endless segment-based runner with authored pacing beats layered over weighted segment stitching.
- Runs are shaped like short level acts: tutorial, build-up, reward route, wall pressure, recovery, and climax.
- Each run waits on a ready prompt; wall pressure and scoring begin on the first movement, jump, or touch input.
- Keyboard and touch controls ship in v1.
- Backtracking is allowed, but score and distance only use the furthest progress reached.
- Hazard and pressure segments unlock by map distance, never by score or coin value.
- Coins are one-time pickups: normal coins reward safe routing, risk coins reward dangerous routes.
- Pickups are separate from score: the bubble shield gives one visual bubble state and blocks one normal trap/enemy hit, but it does not block pits or the spike wall.
- DIST 30-40 introduces the first low static thorn so trap reading starts early without a timing gate.
- Mid and late segments add denser readable traps such as long thorn strips, stompable slimes, mud slow zones, retracting vines, flame vents, falling rocks, moving thorns, and timed thorn presses.
- The spike wall kills on contact, closes harder during stalls/backtracking, and eases when the player makes strong forward progress.

## Locked Player Physics

- Jump target: `120px` maximum rise, `0.5s` to apex, `1.0s` same-height airtime.
- Short-hop target: `48px` when jump is released early, about `0.63s` same-height airtime.
- Derived runtime values: `960px/s^2` gravity and `480px/s` jump launch velocity.
- Horizontal movement: `300px/s` forward, `170px/s` reverse, `0.9` air-control factor.
- Same-height jump reach: `300px` theoretical full-speed, about `234px` practical validator reach.
- Hitbox: `20x40px`, inset inside a `32x64px` reference-style character sprite.

## Controls

- `A` / `Left Arrow`: retreat
- `D` / `Right Arrow`: accelerate
- `W` / `Up Arrow` / `Space`: jump; tap for a low hop, hold for full height
- `R`: restart after a loss

On touch devices, left/right/jump/restart buttons appear over the playfield. Tap jump for a low hop; keep it pressed for full height.

## Run

```sh
npm install
npm run dev
```

Or double-click `start-spike-escape.command` to launch on `http://127.0.0.1:5623`.

## Verify

```sh
npm run test
npm run build
npm run check:bundle
```

`npm run build` runs TypeScript, production bundling, and bundle budget checks. `npm run verify` runs tests plus the full build pipeline.

Use `stop-spike-escape.command` to stop the local dev server.

## Project Layout

```text
.
├── docs/
│   ├── implementation-plan.md
│   ├── prd.md
│   └── technical-spec.md
├── src/
│   ├── assets/
│   ├── config/
│   ├── game/
│   ├── scenes/
│   ├── systems/
│   ├── types/
│   ├── ui/
│   ├── utils/
│   └── main.ts
├── scripts/
├── test/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Implementation Notes

- The current 2D look mixes Phaser-generated high-contrast black-garden primitives with repo-owned reference-style art under `public/reference-style`.
- The player character uses the uploaded reference sprite at `public/reference-style/player3.png`.
- External images are declared in `src/assets/referenceAssets.ts`; code-generated gameplay textures live in `src/assets/generatedTextures.ts`. Large concept sheets are not shipped as runtime assets.
- Segment data is validated before runtime use.
- Segment validation checks gap width, platform height changes, landing width, trap timing, danger budgets, reaction distance, optional-route rejoin safety, full-body landing windows, and segment-boundary transitions against the locked practical player jump envelope.
- Segment planning uses `unlockDistancePx` metadata so hazards appear at authored map-distance thresholds instead of score thresholds.
- The segment planner steers runs through repeatable pacing beats so the stream feels closer to a compact platforming level than a flat random shuffle.
- The entry module stays lightweight and lazy-loads the Phaser runtime through `src/game/startGame.ts`.
- Production builds split `phaser` into its own cacheable chunk and enforce a small bundle budget with `scripts/check-bundle-size.mjs`.
- Best score is stored locally in the browser.
- The shipped docs intentionally describe only Spike Escape; legacy project references are removed.
