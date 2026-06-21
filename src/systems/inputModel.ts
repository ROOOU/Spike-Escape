export type InputAction = "left" | "right" | "jump" | "restart";

export interface KeyLike {
  isDown: boolean;
}

export interface KeyboardBindings {
  left: KeyLike[];
  right: KeyLike[];
  jump: KeyLike[];
  restart: KeyLike[];
}

export interface RawInputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  restart: boolean;
  usingTouch: boolean;
}

export interface InputSnapshot extends RawInputState {
  jumpPressed: boolean;
  restartPressed: boolean;
}

export interface TouchBinder {
  destroy(): void;
  read(): RawInputState;
}

export interface KeyboardEventLike {
  code?: string;
  key?: string;
}

const EMPTY_INPUT: RawInputState = {
  left: false,
  right: false,
  jump: false,
  restart: false,
  usingTouch: false
};

const KEYBOARD_ACTION_BY_CODE: Record<string, InputAction> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "jump",
  KeyW: "jump",
  Space: "jump",
  KeyR: "restart"
};

const KEYBOARD_ACTION_BY_KEY: Record<string, InputAction> = {
  " ": "jump",
  Spacebar: "jump"
};

function anyDown(keys: KeyLike[]): boolean {
  return keys.some((key) => key.isDown);
}

function pointerIdOf(event: Event): number {
  const pointerEvent = event as Event & { pointerId?: number };
  return pointerEvent.pointerId ?? 0;
}

export function readKeyboardState(bindings: KeyboardBindings): RawInputState {
  return {
    left: anyDown(bindings.left),
    right: anyDown(bindings.right),
    jump: anyDown(bindings.jump),
    restart: anyDown(bindings.restart),
    usingTouch: false
  };
}

export function actionFromKeyboardEventLike(
  event: KeyboardEventLike
): InputAction | undefined {
  if (event.code && KEYBOARD_ACTION_BY_CODE[event.code]) {
    return KEYBOARD_ACTION_BY_CODE[event.code];
  }

  if (event.key && KEYBOARD_ACTION_BY_KEY[event.key]) {
    return KEYBOARD_ACTION_BY_KEY[event.key];
  }

  return undefined;
}

export function mergeInputStates(...states: RawInputState[]): RawInputState {
  return states.reduce<RawInputState>(
    (merged, state) => ({
      left: merged.left || state.left,
      right: merged.right || state.right,
      jump: merged.jump || state.jump,
      restart: merged.restart || state.restart,
      usingTouch: merged.usingTouch || state.usingTouch
    }),
    { ...EMPTY_INPUT }
  );
}

export class InputFrameState {
  private previous: RawInputState = { ...EMPTY_INPUT };
  private current: RawInputState = { ...EMPTY_INPUT };

  update(next: RawInputState): void {
    this.previous = this.current;
    this.current = next;
  }

  snapshot(): InputSnapshot {
    return {
      ...this.current,
      jumpPressed: this.current.jump && !this.previous.jump,
      restartPressed: this.current.restart && !this.previous.restart
    };
  }
}

export function createTouchBinder(root: HTMLElement | null): TouchBinder {
  if (!root) {
    return {
      destroy: () => undefined,
      read: () => ({ ...EMPTY_INPUT })
    };
  }

  const activeState: Record<InputAction, boolean> = {
    left: false,
    right: false,
    jump: false,
    restart: false
  };
  const queuedState: Record<InputAction, boolean> = {
    left: false,
    right: false,
    jump: false,
    restart: false
  };
  const activePointers = new Map<HTMLInputElement | HTMLButtonElement, Set<number>>();
  const removers: Array<() => void> = [];

  const buttons = root.querySelectorAll<HTMLButtonElement | HTMLInputElement>("[data-action]");
  buttons.forEach((button) => {
    const action = button.dataset.action as InputAction | undefined;
    if (!action) {
      return;
    }

    const pointerSet = new Set<number>();
    let lastPressAtMs = Number.NEGATIVE_INFINITY;
    activePointers.set(button, pointerSet);

    const refresh = (): void => {
      activeState[action] = pointerSet.size > 0;
      button.dataset.active = pointerSet.size > 0 ? "true" : "false";
    };

    const onPress = (event: Event): void => {
      event.preventDefault();
      lastPressAtMs = Date.now();
      pointerSet.add(pointerIdOf(event));
      queuedState[action] = true;
      refresh();
    };

    const onRelease = (event: Event): void => {
      pointerSet.delete(pointerIdOf(event));
      refresh();
    };

    const onTapFallback = (event: Event): void => {
      event.preventDefault();
      if (Date.now() - lastPressAtMs > 250) {
        queuedState[action] = true;
      }
    };

    const events: Array<[string, (event: Event) => void]> = [
      ["pointerdown", onPress],
      ["pointerup", onRelease],
      ["pointercancel", onRelease],
      ["pointerleave", onRelease],
      ["mousedown", onPress],
      ["mouseup", onRelease],
      ["mouseleave", onRelease],
      ["touchstart", onPress],
      ["touchend", onRelease],
      ["touchcancel", onRelease],
      ["click", onTapFallback]
    ];

    events.forEach(([eventName, handler]) => {
      button.addEventListener(eventName, handler);
      removers.push(() => button.removeEventListener(eventName, handler));
    });
  });

  return {
    destroy() {
      removers.forEach((remove) => remove());
    },
    read() {
      const usingTouch =
        Object.values(activeState).some(Boolean) ||
        Object.values(queuedState).some(Boolean);
      const state = {
        left: activeState.left || queuedState.left,
        right: activeState.right || queuedState.right,
        jump: activeState.jump || queuedState.jump,
        restart: activeState.restart || queuedState.restart,
        usingTouch
      };
      queuedState.left = false;
      queuedState.right = false;
      queuedState.jump = false;
      queuedState.restart = false;
      return {
        ...state
      };
    }
  };
}
