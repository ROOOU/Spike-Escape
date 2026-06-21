# Spike Escape PRD

## Product Goal

Spike Escape is a 2D endless platform runner about surviving forward pressure in a black garden. The player is chased by a spike wall, chooses between safe and risky seed routes, reads high-contrast traps quickly, and should understand the loop within the first 30 seconds.

The prototype succeeds if players clearly understand:

- movement and jumping,
- why they died,
- why taking extra risk can pay off,
- why a pickup changed the character state,
- why each stretch of the run has a clear gameplay beat,
- and why pressing restart feels immediate.

## Core Loop

1. Land on the ready prompt.
2. Start the run with the first movement, jump, or touch input.
3. Move through stitched segments with explicit left/right input.
4. Accelerate, stop, or retreat to line up jumps.
5. Read the current beat: setup, reward route, wall pressure, recovery, or climax.
6. Collect normal seeds, risk seeds, and occasional short-lived pickups.
7. Avoid pits, thorns, timed traps, enemies, and the advancing wall.
8. Die, review the result, and restart.

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
- Restart button: restart after death

Touch inputs must map to the same gameplay actions as keyboard inputs.

## Movement Rules

- The player does not auto-run; no horizontal input means no intentional horizontal movement.
- Movement, scoring, wall timers, and segment progression begin only after the ready prompt receives a start input.
- Holding right moves forward.
- Holding left can reverse movement and allow full backtracking.
- Jumping supports generous coyote time and jump buffering so early misses do not feel punitive.
- Jump height is variable: short taps produce low hops, while holding jump reaches full height.
- There is no double jump.
- Collision is intentionally forgiving through a slightly inset player hitbox.
- Platform gaps and height changes must fit the validated jump envelope; valid segments cannot require edge-perfect landings or impossible climbs.

## Core Physics Envelope

- Player physics is locked before level authoring; level data must adapt to these values, not the reverse.
- Full-jump height target: `120px`.
- Short-hop height target: `48px` when jump is released early.
- Time to apex: `0.5s`.
- Same-height airtime: `1.0s`.
- Short-hop same-height airtime: about `0.63s`.
- Forward speed: `300px/s`.
- Reverse speed: `170px/s`.
- Air control factor: `0.9`.
- Hitbox: `20x40px` inside the `32x64px` character art.
- Practical same-height gap reach for validation is about `234px`, including the reduced-speed safety factor before landing buffers.
- Main-path upward rises should stay at or below `108px`, which is 90% of the theoretical maximum rise.
- Valid main-route jumps must retain at least `24px` practical reach margin and `16px` controlled landing-window margin.

## World Rules

- The world is built from predefined segments stitched end-to-end.
- Segment selection is weighted, but also steered by authored pacing beats so runs feel more like short levels than flat randomness.
- New hazards and pressure mechanics unlock by furthest map distance reached; score, coins, and elapsed time cannot unlock them early.
- Camera progression follows the furthest forward progress reached and does not pan backward.
- The wall is distance-pressure based: it starts with an opening grace, closes harder when the player stalls or backtracks, and eases off when the player makes strong forward progress.
- The wall does not advance while the ready prompt is waiting for the first input.
- Coins do not respawn once collected.
- Runtime art follows a high-contrast rule: read silhouette first, danger second, detail last. Dangerous objects and important pickups must be recognizable within about `0.2-0.4s`.
- The player body, hitbox, and core proportions stay fixed. Expressions, headgear, bubble aura, fire/floral states, and damage expressions are visual/state feedback only unless a validator-supported route explicitly opts into that capability.

## Pacing And Level Feel

- The opening run must teach movement, jumping, reward routing, recovery space, and the wall sprint window in a fixed readable order.
- After onboarding, the segment planner should keep rotating through clear beats:
  - build-up or setup,
  - a readable reward route,
  - a pressure beat,
  - a recovery stretch,
  - and an occasional climax beat.
- Two high-pressure beats should not chain without a meaningful cooldown lane.
- Risk-coin routes should feel intentional and visible, not randomly scattered.
- The run should feel like linked platforming acts with quick restarts, similar in spirit to mobile Rayman stage flow, while still remaining endless.
- Distance pacing targets:
- `0-960px`: movement, safe runway, and basic coin reading.
- `960-1600px`: first low static thorns around `DIST 30-40`, small gaps, and coin arcs.
- `1600-3200px`: long thorn strips and early commitment reads.
- `3200-5200px`: static-thorn practice, stompable enemies, elevation, and first wall sprint lane.
- `5200-7200px`: consecutive pits, optional risk coins, and precision rewards.
- `6400-9000px`: horizontal patrol thorns and denser static-trap combinations.
- `7200-9000px`: mud slow zones and retracting thorn vines, introduced one at a time.
- `9000-11000px`: vertical patrol thorns.
- `10400-11000px`: flame vents, falling rocks, and advanced enemy reads.
- `11000-13000px`: telegraphed thorn presses and stronger wall pressure.
- `13000-15000px`: climax trap ribbons with mixed rewards.
- `15000px+`: mixed high-pressure gauntlets with cooldown lanes between them.

## Hazards And Rewards

### Pits

- Falling below the kill line ends the run.
- Pit width must remain within the validated jump envelope.
- Landing platforms after pits must be wide enough for a practical landing window.
- Authored pits must be playable below theoretical full speed; validator rules should reject jumps that only work from perfect edge takeoff or perfect max-speed timing.
- Opening segments should use short gaps, low rises, and wide landings before precision or hazard pressure appears.
- If a candidate jump exceeds the locked physics envelope, the level must be redesigned; physics values should not be adjusted to rescue one segment.

### Spikes

- Touching spikes ends the run immediately.
- Spike placement must stay visually obvious and never blend into the floor.

### Mechanical Traps

- The first trap should appear around `DIST 30-40` as a low, clearly marked static thorn, not as a moving or timing trap.
- Long thorn strips can appear after the first trap read, but they must have clear takeoff space and visible warning bases.
- Mud pits are soft hazards: they slow movement briefly but do not kill. They must not be paired with a high-pressure unavoidable timing trap on the main route.
- Thorn vines, flame vents, falling rocks, vertical patrols, and crushers must have a visible warning window before becoming dangerous.
- Moving thorn traps patrol short, visible lanes and should teach timing without requiring perfect jumps.
- Thorn presses telegraph before slamming down and must include enough warning time to be readable.
- Moving and timed mechanical traps should appear in pressure, climax, or later reward beats, not in the opening onboarding sequence.
- Trap routes may protect risk coins, but the safe main route must stay legible.
- Every segment has a hazard budget and reaction-distance target. High-pressure main routes should not carry more than two primary danger sources without moving extra danger into an optional route.

### Enemies

- Stompable ground enemies can be defeated only when the player is descending onto their top.
- Side contact or hitting an enemy from below is a death.
- A successful stomp applies a small upward bounce so the action feels Mario-like and readable.
- Enemies may patrol short ground lanes, but enemy patrols must be validated for readable timing and segment bounds.
- Slimes and beetles are stompable. Bats, moles, and flower turrets are primarily avoidance hazards in v1.5 and should be introduced one at a time.

### Pickups

- Pickups are gameplay state items, separate from score coins.
- Bubble shield grants one visible bubble state and blocks one normal trap or enemy hit.
- Bubble shield does not block the spike wall or falling below the kill line.
- Other pickup kinds are typed for future expansion, but any pickup that changes jump height, speed, glide, or timing must remain optional until route validation supports that capability.

### Spike Wall

- The wall kills on contact.
- It has `Normal`, `Warning`, `Sprint`, and `Recover` states.
- Sprint only triggers in explicitly allowed, validated segments.
- Wall sprint is blocked for the first 30 seconds of a run.
- During normal chase, the wall should feel like a rubber-band pressure system: stalling and backtracking increase pressure, while forward progress buys breathing room.

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
- New players can identify the difference between safe space, reward routing, and pressure beats within the opening minute.
- Death reasons are always legible.
- No segment marked valid produces an impossible main route.
- Backtracking does not increase distance score.
- The wall provides pressure without creating unavoidable deaths in the opening phase.
- The segment stream avoids feeling purely random across multiple restarts.
- Desktop keyboard and touch controls both complete a full run loop.
