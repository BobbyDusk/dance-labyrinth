import logger from "./Logger";
import EventEmitter from 'eventemitter3';

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
  private inputGroups: { [name: string]: InputGroup } = {};

  constructor() {
  }

  addInputGroup(name: string) {
    if (this.inputGroups[name]) {
      logger.warn(`Input group with name ${name} already exists.`);
      return;
    }
    this.inputGroups[name] = new InputGroup();
  }

  addInput(inputGroupName: string, input: Input) {
    this.inputGroups[inputGroupName].addInput(input);
  }

  addAction(inputGroupName: string, action: () => void) {
    this.inputGroups[inputGroupName].on("executed", action);
  }
}

// multiple inputs
class InputGroup extends EventEmitter {
  protected inputs: Input[] = [];

  addInput(input: Input) {
    input.on("executed", () => {
      this.emit("executed", input);
    });
    this.inputs.push(input);
  }

  removeInput(input: Input) {
    input.removeAllListeners("executed");
    this.inputs = this.inputs.filter(i => i !== input);
  }
}

// Single input
export class Input extends EventEmitter {
  notify() {
    this.emit("executed");
  }
}

export class KeyPress extends Input {
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

export const inputManager = new InputManager();