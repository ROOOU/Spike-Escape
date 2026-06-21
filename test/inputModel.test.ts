import { describe, expect, it } from "vitest";
import {
  InputFrameState,
  actionFromKeyboardEventLike,
  createTouchBinder,
  mergeInputStates,
  readKeyboardState
} from "../src/systems/inputModel";

describe("inputModel", () => {
  it("maps keyboard aliases into gameplay actions", () => {
    const state = readKeyboardState({
      left: [{ isDown: false }, { isDown: true }],
      right: [{ isDown: false }],
      jump: [{ isDown: true }],
      restart: [{ isDown: false }]
    });

    expect(state.left).toBe(true);
    expect(state.right).toBe(false);
    expect(state.jump).toBe(true);
  });

  it("maps keyboard events into queued gameplay actions", () => {
    expect(actionFromKeyboardEventLike({ code: "ArrowLeft" })).toBe("left");
    expect(actionFromKeyboardEventLike({ code: "KeyD" })).toBe("right");
    expect(actionFromKeyboardEventLike({ code: "Space" })).toBe("jump");
    expect(actionFromKeyboardEventLike({ key: " " })).toBe("jump");
    expect(actionFromKeyboardEventLike({ code: "KeyR" })).toBe("restart");
    expect(actionFromKeyboardEventLike({ code: "Escape" })).toBeUndefined();
  });

  it("tracks edge-triggered jump presses", () => {
    const frames = new InputFrameState();

    frames.update({
      left: false,
      right: false,
      jump: false,
      restart: false,
      usingTouch: false
    });
    frames.update({
      left: false,
      right: true,
      jump: true,
      restart: false,
      usingTouch: false
    });

    const snapshot = frames.snapshot();
    expect(snapshot.jumpPressed).toBe(true);
    expect(snapshot.right).toBe(true);
  });

  it("binds touch buttons and merges them with keyboard state", () => {
    document.body.innerHTML = `
      <div id="touch-controls">
        <button data-action="left" type="button">Left</button>
        <button data-action="jump" type="button">Jump</button>
        <button data-action="restart" type="button">Restart</button>
      </div>
    `;

    const root = document.getElementById("touch-controls");
    const binder = createTouchBinder(root);
    const leftButton = root?.querySelector<HTMLButtonElement>("[data-action='left']");
    const jumpButton = root?.querySelector<HTMLButtonElement>("[data-action='jump']");
    const restartButton = root?.querySelector<HTMLButtonElement>("[data-action='restart']");

    leftButton?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    jumpButton?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    restartButton?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

    const merged = mergeInputStates(
      {
        left: false,
        right: true,
        jump: false,
        restart: false,
        usingTouch: false
      },
      binder.read()
    );

    expect(merged.left).toBe(true);
    expect(merged.right).toBe(true);
    expect(merged.jump).toBe(true);
    expect(merged.restart).toBe(true);
    expect(merged.usingTouch).toBe(true);

    leftButton?.dispatchEvent(new Event("pointerup", { bubbles: true, cancelable: true }));
    jumpButton?.dispatchEvent(new Event("pointerup", { bubbles: true, cancelable: true }));
    restartButton?.dispatchEvent(new Event("pointerup", { bubbles: true, cancelable: true }));

    expect(binder.read().jump).toBe(false);
    expect(binder.read().restart).toBe(false);
    binder.destroy();
  });

  it("queues quick touch taps until the next input read", () => {
    document.body.innerHTML = `
      <div id="touch-controls">
        <button data-action="jump" type="button">Jump</button>
      </div>
    `;

    const root = document.getElementById("touch-controls");
    const binder = createTouchBinder(root);
    const jumpButton = root?.querySelector<HTMLButtonElement>("[data-action='jump']");

    jumpButton?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    jumpButton?.dispatchEvent(new Event("pointerup", { bubbles: true, cancelable: true }));

    expect(binder.read().jump).toBe(true);
    expect(binder.read().jump).toBe(false);
    binder.destroy();
  });

  it("supports mouse and click fallback for touch controls", () => {
    document.body.innerHTML = `
      <div id="touch-controls">
        <button data-action="jump" type="button">Jump</button>
      </div>
    `;

    const root = document.getElementById("touch-controls");
    const binder = createTouchBinder(root);
    const jumpButton = root?.querySelector<HTMLButtonElement>("[data-action='jump']");

    jumpButton?.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
    expect(binder.read().jump).toBe(true);
    expect(binder.read().jump).toBe(false);

    jumpButton?.dispatchEvent(new Event("mousedown", { bubbles: true, cancelable: true }));
    expect(binder.read().jump).toBe(true);
    expect(jumpButton?.dataset.active).toBe("true");

    jumpButton?.dispatchEvent(new Event("mouseup", { bubbles: true, cancelable: true }));
    expect(binder.read().jump).toBe(false);
    expect(jumpButton?.dataset.active).toBe("false");

    jumpButton?.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
    expect(binder.read().jump).toBe(false);
    binder.destroy();
  });
});
