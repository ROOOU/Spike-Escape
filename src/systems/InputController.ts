import Phaser from "phaser";
import {
  InputFrameState,
  createTouchBinder,
  mergeInputStates,
  readKeyboardState,
  type InputSnapshot,
  type KeyboardBindings,
  type TouchBinder
} from "./inputModel";

export class InputController {
  private readonly bindings: KeyboardBindings;
  private readonly touchBinder: TouchBinder;
  private readonly frameState = new InputFrameState();

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

    this.touchBinder = createTouchBinder(touchRoot);
  }

  poll(): InputSnapshot {
    const next = mergeInputStates(
      readKeyboardState(this.bindings),
      this.touchBinder.read()
    );

    this.frameState.update(next);
    return this.frameState.snapshot();
  }

  destroy(): void {
    this.touchBinder.destroy();
  }
}
