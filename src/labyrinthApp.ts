import { Application, Graphics, Sprite } from "pixi.js"
import { Viewport } from "pixi-viewport"
import Square from "./Square"
import { draw } from "svelte/transition"

let numberOfSquaresSide = 19
let sideSize = 800
let squareSize = sideSize / numberOfSquaresSide
let activeSquare: Square | null = null
let field: Square[][] = []
let viewport: Viewport
let characterGraphics = new Graphics()

export enum MoveDirection {
    Up = "up",
    Down = "down",
    Left = "left",
    Right = "right",
    None = "none"
}

export let activeDirection: MoveDirection = MoveDirection.None

function getRandomBool() {
    return Math.random() < 0.5
}

export async function setup(container: HTMLElement) {
    let app = new Application()
    await app.init({ width: sideSize, height: sideSize, backgroundColor: 0xAAAAAA });
    container.appendChild(app.canvas)
    viewport = new Viewport({
        screenWidth: sideSize,
        screenHeight: sideSize,
        worldWidth: sideSize,
        worldHeight: sideSize,
        events: app.renderer.events,
    })
    app.stage.addChild(viewport)
    viewport.drag().pinch().wheel().decelerate()
    viewport.moveCenter(0, 0)
    viewport.setZoom(2)

    field = new Array(numberOfSquaresSide)
    for (let i = 0; i < numberOfSquaresSide; i++) {
        field[i] = new Array(numberOfSquaresSide)
    }
    for (let x = 0; x < numberOfSquaresSide; x++) {
        for (let y = 0; y < numberOfSquaresSide; y++) {
            let isTopWall = getRandomBool()
            let isRightWall = getRandomBool()
            let isBottomWall = getRandomBool()
            let isLeftWall = getRandomBool()
            if (x == 0) {
                isLeftWall = true
            } else {
                isLeftWall = field[x - 1][y].isRightWall
            }

            if (x == numberOfSquaresSide - 1) {
                isRightWall = true
            }

            if (y == 0) {
                isTopWall = true
            } else {
                isTopWall = field[x][y - 1].isBottomWall
            }

            if (y == numberOfSquaresSide - 1) {
                isBottomWall = true
            }
            let square = new Square(x, y, isTopWall, isRightWall, isBottomWall, isLeftWall)
            field[x][y] = square
            viewport.addChild(square.draw(squareSize))
        }

    }

    viewport.addChild(characterGraphics)
    setActiveSquare(10, 10)
}

function drawCharacter() {
    characterGraphics.clear()
    if (!activeSquare) return
    let characterSizePercent = 0.5
    let characterSize = squareSize * characterSizePercent
    characterGraphics.rect(
        (activeSquare!.x + 0.5) * squareSize - characterSize / 2,
        (activeSquare!.y + 0.5) * squareSize - characterSize / 2,
        characterSize,
        characterSize
    )
    characterGraphics.fill(0x00FF00)
    characterGraphics.stroke({ width: 0 })

    const eyeOffset = characterSize * 0.18
    const eyeRadius = characterSize * 0.09
    let dx = 0, dy = 0

    switch (activeDirection) {
        case MoveDirection.Up:
            dy = -eyeOffset
            break
        case MoveDirection.Down:
            dy = eyeOffset
            break
        case MoveDirection.Left:
            dx = -eyeOffset
            break
        case MoveDirection.Right:
            dx = eyeOffset
            break
        case MoveDirection.None:
            dx = 0
            dy = 0
            break
    }

    // Left eye
    characterGraphics.circle(
        (activeSquare.x + 0.5) * squareSize - eyeRadius + dx,
        (activeSquare.y + 0.5) * squareSize - eyeRadius + dy,
        eyeRadius
    )
    characterGraphics.fill(0x000000)

    // Right eye
    characterGraphics.circle(
        (activeSquare.x + 0.5) * squareSize + eyeRadius + dx,
        (activeSquare.y + 0.5) * squareSize - eyeRadius + dy,
        eyeRadius
    )
    characterGraphics.fill(0x000000)

}

function setActiveSquare(x: number, y: number) {
    characterGraphics.clear()
    activeSquare = field[x][y]
    viewport.moveCenter(
        (activeSquare!.x + 0.5) * squareSize,
        (activeSquare!.y + 0.5) * squareSize
    )
    drawCharacter()
}

export function moveActiveSquare() {
    let x = activeSquare!.x
    let y = activeSquare!.y
    switch (activeDirection) {
        case MoveDirection.Up:
            if (activeSquare!.isTopWall) {
                return
            }
            y -= 1
            break
        case MoveDirection.Down:
            if (activeSquare!.isBottomWall) {
                return
            }
            y += 1
            break
        case MoveDirection.Left:
            if (activeSquare!.isLeftWall) {
                return
            }
            x -= 1
            break
        case MoveDirection.Right:
            if (activeSquare!.isRightWall) {
                return
            }
            x += 1
            break
    }
    setActiveSquare(x, y)
}

export function setActiveDirection(direction: MoveDirection) {
    activeDirection = direction
    drawCharacter()
}


