import { Application, Graphics, Sprite } from "pixi.js"

let numberOfSquaresSide = 9
let sideSize = 800
let squareSize = sideSize / numberOfSquaresSide

export async function setup(container: HTMLElement) {
    let app = new Application()
    await app.init({width: sideSize, height: sideSize});
    container.appendChild(app.canvas)
    app.stage.addChild(createSquare(false, false, false, false))
}

export function createSquare(isTopWall: boolean, isRightWall: boolean, isBottomWall: boolean, isLeftWall: boolean): Graphics {
    let graphics = new Graphics()
    graphics.rect(0, 0, squareSize, squareSize)
    graphics.fill(0xFF0000)
    if (isTopWall) {
        graphics.moveTo(0, 0)
        graphics.lineTo(squareSize, 0)
    }
    if (isRightWall) {
        graphics.moveTo(squareSize, 0)
        graphics.lineTo(squareSize, squareSize)
    }
    if (isBottomWall) {
        graphics.moveTo(0, squareSize)
        graphics.lineTo(squareSize, squareSize)
    }
    if (isLeftWall) {
        graphics.moveTo(0, 0)
        graphics.lineTo(0, squareSize)
    }
    graphics.stroke({width: 5, color: 0x000000})
    return graphics
}