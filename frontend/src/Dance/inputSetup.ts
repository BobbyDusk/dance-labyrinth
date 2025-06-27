import { MoveDirection, setActiveDirection, activeDirection } from "../labyrinthApp"
import { InputManager, InputType } from "../input"
import { DanceManager } from "./danceManager";

export default function setupInput() {
  InputManager.addInputAction("MoveLeft");
  InputManager.addInput("MoveLeft", InputType.KEYPRESS, { key: "a" });
  InputManager.addAction("MoveLeft", () => setActiveDirection(MoveDirection.Left));
  InputManager.addInputAction("MoveRight");
  InputManager.addInput("MoveRight", InputType.KEYPRESS, { key: "f" });
  InputManager.addAction("MoveRight", () => setActiveDirection(MoveDirection.Right));
  InputManager.addInputAction("MoveUp");
  InputManager.addInput("MoveUp", InputType.KEYPRESS, { key: "d" });
  InputManager.addAction("MoveUp", () => setActiveDirection(MoveDirection.Up));
  InputManager.addInputAction("MoveDown");
  InputManager.addInput("MoveDown", InputType.KEYPRESS, { key: "s" });
  InputManager.addAction("MoveDown", () => setActiveDirection(MoveDirection.Down));
  InputManager.addInputAction("Lane0");
  InputManager.addInput("Lane0", InputType.KEYPRESS, { key: "j" });
  InputManager.addAction("Lane0", () => DanceManager.press(0));
  InputManager.addInputAction("Lane1");
  InputManager.addInput("Lane1", InputType.KEYPRESS, { key: "k" });
  InputManager.addAction("Lane1", () => DanceManager.press(1));
  InputManager.addInputAction("Lane2");
  InputManager.addInput("Lane2", InputType.KEYPRESS, { key: "l" });
  InputManager.addAction("Lane2", () => DanceManager.press(2));
  InputManager.addInputAction("Lane3");
  InputManager.addInput("Lane3", InputType.KEYPRESS, { key: ";" });
  InputManager.addAction("Lane3", () => DanceManager.press(3));

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