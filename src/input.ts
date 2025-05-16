import { Direction } from "./Arrow"
import { press } from "./musicApp"
import { MoveDirection, setActiveDirection } from "./labyrinthApp"

export function setupInput() {
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


}
