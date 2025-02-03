import { Direction } from "./Arrow"
import { press } from "./app"

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

//function press(direction: Direction) {
// when pressing a key, check the difference between Date.now() and startTime
// use this difference to calculate the beat and subbeat
// Compare this to the beat and subbeat of the arrows in the queue
// make sure never to use the render loop. Input + verficiation should be
// completely seperate from render loop
//}
