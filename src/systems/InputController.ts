import * as Phaser from "phaser";
import {
  InputFrameState,
  actionFromKeyboardEventLike,
  createTouchBinder,
  mergeInputStates,
  readKeyboardState,
  type InputSnapshot,
  type KeyboardBindings,
  type RawInputState,
  type TouchBinder
} from "./inputModel";

const EMPTY_INPUT: RawInputState = {
  left: false,
  right: false,
  jump: false,
  restart: false,
  usingTouch: false
};

export class InputController {
  private readonly bindings: KeyboardBindings;
  private readonly touchBinder: TouchBinder;
  private readonly keyboardRemovers: Array<() => void> = [];
  private readonly frameState = new InputFrameState();
  private queuedKeyboardState: RawInputState = { ...EMPTY_INPUT };

  constructor(scene: Phaser.Scene, touchRoot: HTMLElement | null) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error("Keyboard input is unavailable.");
    }

    this.bindings = {
      left: [
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
      ],
      right: [
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
      ],
      jump: [
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      ],
      restart: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)]
    };
    [
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.R
    ].forEach((keyCode) => keyboard.addCapture(keyCode));

    this.bindKeyboardEventQueue();
    this.touchBinder = createTouchBinder(touchRoot);
  }

  poll(): InputSnapshot {
    const next = mergeInputStates(
      readKeyboardState(this.bindings),
      this.consumeQueuedKeyboardState(),
      this.touchBinder.read()
    );

    this.frameState.update(next);
    return this.frameState.snapshot();
  }

  destroy(): void {
    this.keyboardRemovers.forEach((remove) => remove());
    this.keyboardRemovers.length = 0;
    this.touchBinder.destroy();
  }

  private bindKeyboardEventQueue(): void {
    const onKeyDown = (event: KeyboardEvent): void => {
      const action = actionFromKeyboardEventLike(event);
      if (!action) {
        return;
      }

      event.preventDefault();
      this.queuedKeyboardState[action] = true;
    };

    const onKeyUp = (event: KeyboardEvent): void => {
      if (actionFromKeyboardEventLike(event)) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp, { passive: false });
    this.keyboardRemovers.push(
      () => window.removeEventListener("keydown", onKeyDown),
      () => window.removeEventListener("keyup", onKeyUp)
    );
  }

  private consumeQueuedKeyboardState(): RawInputState {
    const state = this.queuedKeyboardState;
    this.queuedKeyboardState = { ...EMPTY_INPUT };
    return state;
  }
}
