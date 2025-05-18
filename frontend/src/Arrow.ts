import { Assets, Sprite, Texture } from "pixi.js";
import { global } from "./global"


export enum Direction
{
    Left = 0,
    Down = 1,
    Up = 2,
    Right = 3
}

export function createArrowSprite(arrowDirection: Direction): Sprite {
    let texture
    switch (arrowDirection) {
        case Direction.Up:
            texture = Assets.get('arrowUp');
            break;
        case Direction.Right:
            texture = Assets.get('arrowRight');
            break;
        case Direction.Down:
            texture = Assets.get('arrowDown');
            break;
        case Direction.Left:
            texture = Assets.get('arrowLeft');
            break;
    }

    let arrow = new Sprite(texture);
    arrow.scale = 0.15
    arrow.anchor.set(0.5);
    arrow.x = getxPosition(arrowDirection)

    return arrow
}

function getxPosition(arrowDirection: Direction): number {
    return global.app.screen.width / 8 * (arrowDirection * 2 + 1);
}

export interface ArrowProps {
    beat: number,
    subbeat: number,
    direction: Direction,
}

export class Arrow {
    sprite: Sprite
    beat: number
    subbeat: number
    direction: Direction

    constructor({beat, subbeat, direction}: ArrowProps) {
        this.beat = beat
        this.subbeat = subbeat
        this.direction = direction
        this.sprite = createArrowSprite(direction)    
        global.app.stage.addChild(this.sprite)
    }


    destruct() {
        global.app.stage.removeChild(this.sprite)
    }


    toString(): string {
        return `Arrow(${this.beat}, ${this.subbeat}, ${this.direction})`
    }
}
