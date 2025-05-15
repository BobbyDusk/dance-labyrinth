import { Direction } from "./Arrow"
import { press } from "./musicApp"

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
    }
  })
}
