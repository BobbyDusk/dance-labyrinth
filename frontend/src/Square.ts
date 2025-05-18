import { Graphics } from 'pixi.js'

let strokeWidth = 2

export default class Square {
    x: number
    y: number
    isTopWall: boolean
    isRightWall: boolean
    isBottomWall: boolean
    isLeftWall: boolean

    constructor(x: number, y: number, isTopWall: boolean, isRightWall: boolean, isBottomWall: boolean, isLeftWall: boolean) {
        this.x = x
        this.y = y
        this.isTopWall = isTopWall
        this.isRightWall = isRightWall
        this.isBottomWall = isBottomWall
        this.isLeftWall = isLeftWall
    }

    draw(squareSize: number): Graphics {
        let graphics = new Graphics()
        graphics.rect(this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        graphics.fill(0xFF0000)
        graphics.stroke({width: 0})
        if (this.isTopWall) {
            graphics.moveTo(this.x * squareSize, this.y * squareSize + strokeWidth / 2)
            graphics.lineTo((this.x + 1) * squareSize, this.y * squareSize + strokeWidth / 2)
        }
        if (this.isRightWall) {
            graphics.moveTo((this.x + 1) * squareSize - strokeWidth / 2, this.y * squareSize)
            graphics.lineTo((this.x + 1) * squareSize - strokeWidth / 2, (this.y + 1) * squareSize)
        }
        if (this.isBottomWall) {
            graphics.moveTo(this.x * squareSize, (this.y + 1) * squareSize - strokeWidth / 2)
            graphics.lineTo((this.x + 1) * squareSize, (this.y + 1) * squareSize - strokeWidth / 2)
        }
        if (this.isLeftWall) {
            graphics.moveTo(this.x * squareSize + strokeWidth / 2, this.y * squareSize)
            graphics.lineTo(this.x * squareSize + strokeWidth / 2, (this.y + 1) * squareSize)
        }
        graphics.stroke({ width: strokeWidth, color: 0x000000 })
        return graphics
    }
}