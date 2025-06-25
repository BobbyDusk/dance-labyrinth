import logger from "./logger";
import { StaticObservable, Observable } from "./genericClasses";

export enum InputType {
  KEYPRESS = "KeyPress",
}

export enum KeyPressType {
  DOWN = "down",
  UP = "up",
}

export interface KeyPressConfig {
  key: string;
  type?: KeyPressType;
}

export interface ButtonConfig {
  label: string;
}

export class InputManager {
  private static instance: InputManager = new InputManager();
  private inputActions: { [name: string]: InputAction } = {};

  private constructor() {
  }

  static addInputAction(name: string) {
    if (InputManager.instance.inputActions[name]) {
      logger.warn(`Input action with name ${name} already exists.`);
      return;
    }
    InputManager.instance.inputActions[name] = new InputAction();
  }

  static addInput(InputAction: string, type: InputType, config: KeyPressConfig | ButtonConfig) {
    let input: Input;
    switch (type) {
      case InputType.KEYPRESS:
        input = new KeyPress((config as KeyPressConfig).key);
        break;
      default:
        console.error(`Input type ${type} is not supported.`);
        return;
    }
    InputManager.instance.inputActions[InputAction].addInput(input)
  }

  static addAction(InputAction: string, action: () => void) {
    InputManager.instance.inputActions[InputAction].subscribe(action);
  }
}

class InputAction extends Observable {
  protected inputs: Input[] = [];

  addInput(input: Input) {
    input.subscribe(this.notify.bind(this));
    this.inputs.push(input);
  }

  removeInput(input: Input) {
    this.inputs = this.inputs.filter(i => i !== input);
  }
}

class Input extends Observable {
}

class KeyPress extends Input {
  constructor(public key: string, public type: KeyPressType = KeyPressType.DOWN) {
    super();
    document.addEventListener(type == KeyPressType.DOWN ? "keydown" : "keyup", (event: KeyboardEvent) => {
      if (event.key === key) {
        logger.debug(`KeyPress event: ${event.key}, type: ${type}`);
        this.notify();
      }
    })
  }
}
