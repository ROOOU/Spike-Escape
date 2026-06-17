# Spike Escape PRD

## Product Goal

Spike Escape is a 2D endless platform runner about surviving forward pressure. The player is chased by a spike wall, chooses between safe and risky coin routes, and should understand the loop within the first 30 seconds.

The prototype succeeds if players clearly understand:

- movement and jumping,
- why they died,
- why taking extra risk can pay off,
- and why pressing restart feels immediate.

## Core Loop

1. Start a run.
2. Drift forward through stitched segments.
3. Accelerate, brake, or retreat to line up jumps.
4. Collect normal and risk coins.
5. Avoid pits, spikes, and the advancing wall.
6. Die, review the result, and restart.

## Inputs

### Desktop

- `A` / `Left Arrow`: retreat
- `D` / `Right Arrow`: accelerate
- `W` / `Up Arrow` / `Space`: jump
- `R`: restart after death

### Mobile

- Left button: retreat
- Right button: accelerate
- Jump button: jump

Touch inputs must map to the same gameplay actions as keyboard inputs.

## Movement Rules

- The player has a baseline forward drift.
- Holding right accelerates beyond the drift speed.
- Holding left can reverse movement and allow full backtracking.
- Jumping supports coyote time and jump buffering.
- There is no double jump.
- Collision is intentionally forgiving through a slightly inset player hitbox.

## World Rules

- The world is built from predefined segments stitched end-to-end.
- Segment selection is weighted and constrained by difficulty and safety rules.
- Camera progression follows the furthest forward progress reached and does not pan backward.
- The wall advances on its own timeline and is not delayed by backtracking.
- Coins do not respawn once collected.

## Hazards And Rewards

### Pits

- Falling below the kill line ends the run.
- Pit width must remain within the validated jump envelope.

### Spikes

- Touching spikes ends the run immediately.
- Spike placement must stay visually obvious and never blend into the floor.

### Spike Wall

- The wall kills on contact.
- It has `Normal`, `Warning`, `Sprint`, and `Recover` states.
- Sprint only triggers in explicitly allowed, validated segments.
- Wall sprint is blocked for the first 30 seconds of a run.

### Coins

- Normal coin: `100`
- Risk coin: `300`
- Risk coins appear on routes that demand additional danger or precision.

## Scoring

Final score is:

```text
distance score + normal coins * 100 + risk coins * 300
```

Distance score uses the **furthest horizontal progress reached**, not total travel. Moving backward cannot farm score.

## Acceptance Criteria

- New players understand controls within 10 seconds.
- Death reasons are always legible.
- No segment marked valid produces an impossible main route.
- Backtracking does not increase distance score.
- The wall provides pressure without creating unavoidable deaths in the opening phase.
- Desktop keyboard and touch controls both complete a full run loop.
