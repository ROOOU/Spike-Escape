# Spike Escape

Spike Escape is a web-first Phaser prototype for a 2D endless escape runner. The player moves only when the player presses left/right, can jump to cross authored platform gaps, and must survive pits, spikes, risky coin routes, and a relentless spike wall.

## Gameplay Summary

- Endless segment-based runner with authored pacing beats layered over weighted segment stitching.
- Runs are shaped like short level acts: tutorial, build-up, reward route, wall pressure, recovery, and climax.
- Each run waits on a ready prompt; wall pressure and scoring begin on the first movement, jump, or touch input.
- Keyboard and touch controls ship in v1.
- Backtracking is allowed, but score and distance only use the furthest progress reached.
- Coins are one-time pickups: normal coins reward safe routing, risk coins reward dangerous routes.
- The spike wall advances independently of the player and kills on contact.

## Controls

- `A` / `Left Arrow`: retreat
- `D` / `Right Arrow`: accelerate
- `W` / `Up Arrow` / `Space`: jump
- `R`: restart after a loss

On touch devices, left/right/jump/restart buttons appear over the playfield.

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

- The current 2D look mixes Phaser-generated primitives with repo-owned reference-style art under `public/reference-style`.
- The player character uses the uploaded reference sprite at `public/reference-style/player3.png`.
- External images are declared in `src/assets/referenceAssets.ts`; code-generated gameplay textures live in `src/assets/generatedTextures.ts`.
- Segment data is validated before runtime use.
- Segment validation checks gap width, platform height changes, landing width, full-body landing windows, and segment-boundary transitions against a practical player jump envelope.
- The segment planner steers runs through repeatable pacing beats so the stream feels closer to a compact platforming level than a flat random shuffle.
- The entry module stays lightweight and lazy-loads the Phaser runtime through `src/game/startGame.ts`.
- Production builds split `phaser` into its own cacheable chunk and enforce a small bundle budget with `scripts/check-bundle-size.mjs`.
- Best score is stored locally in the browser.
- The shipped docs intentionally describe only Spike Escape; legacy project references are removed.
