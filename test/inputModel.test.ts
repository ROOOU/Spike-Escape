import { describe, expect, it } from "vitest";
import {
  InputFrameState,
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
      </div>
    `;

    const root = document.getElementById("touch-controls");
    const binder = createTouchBinder(root);
    const leftButton = root?.querySelector<HTMLButtonElement>("[data-action='left']");
    const jumpButton = root?.querySelector<HTMLButtonElement>("[data-action='jump']");

    leftButton?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    jumpButton?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

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
    expect(merged.usingTouch).toBe(true);

    leftButton?.dispatchEvent(new Event("pointerup", { bubbles: true, cancelable: true }));
    jumpButton?.dispatchEvent(new Event("pointerup", { bubbles: true, cancelable: true }));

    expect(binder.read().jump).toBe(false);
    binder.destroy();
  });
});
