# Spike Escape

Spike Escape is a web-first Phaser prototype for a 2D endless escape runner. The player drifts forward by default, can accelerate, brake, or fully retreat, and must survive pits, spikes, risky coin routes, and a relentless spike wall.

## Gameplay Summary

- Endless segment-based runner with weighted procedural stitching.
- Keyboard and touch controls ship in v1.
- Backtracking is allowed, but score and distance only use the furthest progress reached.
- Coins are one-time pickups: normal coins reward safe routing, risk coins reward dangerous routes.
- The spike wall advances independently of the player and kills on contact.

## Controls

- `A` / `Left Arrow`: retreat
- `D` / `Right Arrow`: accelerate
- `W` / `Up Arrow` / `Space`: jump
- `R`: restart after a loss

On touch devices, left/right/jump buttons appear over the playfield.

## Run

```sh
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Verify

```sh
npm run test
npm run build
```

`npm run verify` runs both in sequence.

## Project Layout

```text
.
├── docs/
│   ├── implementation-plan.md
│   ├── prd.md
│   └── technical-spec.md
├── src/
│   ├── config/
│   ├── scenes/
│   ├── systems/
│   ├── types/
│   ├── ui/
│   ├── utils/
│   └── main.ts
├── test/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Implementation Notes

- All visuals are generated in code; there are no external sprite assets.
- Segment data is validated before runtime use.
- Best score is stored locally in the browser.
- The shipped docs intentionally describe only Spike Escape; legacy project references are removed.
