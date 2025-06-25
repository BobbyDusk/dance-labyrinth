import { MoveDirection, setActiveDirection, activeDirection } from "../labyrinthApp"
import { InputManager, InputType } from "../input"
import { Direction } from "./Direction";
import { DanceManager } from "./danceManager";

export default function setupInput() {
  InputManager.addInputAction("Left-Left");
  InputManager.addInput("Left-Left", InputType.KEYPRESS, { key: "a" });
  InputManager.addAction("Left-Left", () => setActiveDirection(MoveDirection.Left));
  InputManager.addInputAction("Left-Right");
  InputManager.addInput("Left-Right", InputType.KEYPRESS, { key: "f" });
  InputManager.addAction("Left-Right", () => setActiveDirection(MoveDirection.Right));
  InputManager.addInputAction("Left-Up");
  InputManager.addInput("Left-Up", InputType.KEYPRESS, { key: "d" });
  InputManager.addAction("Left-Up", () => setActiveDirection(MoveDirection.Up));
  InputManager.addInputAction("Left-Down");
  InputManager.addInput("Left-Down", InputType.KEYPRESS, { key: "s" });
  InputManager.addAction("Left-Down", () => setActiveDirection(MoveDirection.Down));
  InputManager.addInputAction("Right-Left");
  InputManager.addInput("Right-Left", InputType.KEYPRESS, { key: "j" });
  InputManager.addAction("Right-Left", () => DanceManager.press(Direction.Left));
  InputManager.addInputAction("Right-Right");
  InputManager.addInput("Right-Right", InputType.KEYPRESS, { key: ";" });
  InputManager.addAction("Right-Right", () => DanceManager.press(Direction.Right));
  InputManager.addInputAction("Right-Up");
  InputManager.addInput("Right-Up", InputType.KEYPRESS, { key: "l" });
  InputManager.addAction("Right-Up", () => DanceManager.press(Direction.Up));
  InputManager.addInputAction("Right-Down");
  InputManager.addInput("Right-Down", InputType.KEYPRESS, { key: "k" });
  InputManager.addAction("Right-Down", () => DanceManager.press(Direction.Down));

  /*
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "j") {
      press(Direction.Left)
    } else if (event.key === "k") {
      press(Direction.Down)
    } else if (event.key === "l") {
      press(Direction.Up)
    } else if (event.key === ";") {
      press(Direction.Right)
    } else if (event.key === "a") {
      setActiveDirection(MoveDirection.Left)
    } else if (event.key === "s") {
      setActiveDirection(MoveDirection.Down)
    } else if (event.key === "w") {
      setActiveDirection(MoveDirection.Up)
    } else if (event.key === "d") {
      setActiveDirection(MoveDirection.Right)
    }
  })

  document.addEventListener("keyup", (event: KeyboardEvent) => {
    if (event.key === "a" || event.key === "s" || event.key === "w" || event.key === "d") {
      const keyDirectionMap: { [key: string]: MoveDirection } = {
        a: MoveDirection.Left,
        s: MoveDirection.Down,
        w: MoveDirection.Up,
        d: MoveDirection.Right,
      };

      const isActiveKey = keyDirectionMap[event.key] === activeDirection;
      if (isActiveKey) {
        setActiveDirection(MoveDirection.None);
      }
    }
  })
  */

}