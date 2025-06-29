import { MoveDirection, setActiveDirection, activeDirection } from "../labyrinthApp"
import { inputManager, InputType } from "../Input"
import { danceManager } from "./DanceManager";

export default function setupInput() {
  inputManager.addInputGroup("MoveLeft");
  inputManager.addInput("MoveLeft", InputType.KEYPRESS, { key: "a" });
  inputManager.addAction("MoveLeft", () => setActiveDirection(MoveDirection.Left));
  inputManager.addInputGroup("MoveRight");
  inputManager.addInput("MoveRight", InputType.KEYPRESS, { key: "f" });
  inputManager.addAction("MoveRight", () => setActiveDirection(MoveDirection.Right));
  inputManager.addInputGroup("MoveUp");
  inputManager.addInput("MoveUp", InputType.KEYPRESS, { key: "d" });
  inputManager.addAction("MoveUp", () => setActiveDirection(MoveDirection.Up));
  inputManager.addInputGroup("MoveDown");
  inputManager.addInput("MoveDown", InputType.KEYPRESS, { key: "s" });
  inputManager.addAction("MoveDown", () => setActiveDirection(MoveDirection.Down));
  inputManager.addInputGroup("Lane0");
  inputManager.addInput("Lane0", InputType.KEYPRESS, { key: "j" });
  inputManager.addAction("Lane0", () => danceManager.press(0));
  inputManager.addInputGroup("Lane1");
  inputManager.addInput("Lane1", InputType.KEYPRESS, { key: "k" });
  inputManager.addAction("Lane1", () => danceManager.press(1));
  inputManager.addInputGroup("Lane2");
  inputManager.addInput("Lane2", InputType.KEYPRESS, { key: "l" });
  inputManager.addAction("Lane2", () => danceManager.press(2));
  inputManager.addInputGroup("Lane3");
  inputManager.addInput("Lane3", InputType.KEYPRESS, { key: ";" });
  inputManager.addAction("Lane3", () => danceManager.press(3));

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