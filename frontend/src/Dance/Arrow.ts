import { Assets, Sprite, Texture } from "pixi.js";
import { global } from "../global"
import { Direction } from "./Direction";


export function createArrowSprite(arrowDirection: Direction, hollow = false): Sprite {
    let texture
    switch (arrowDirection) {
        case Direction.Up:
            texture = hollow ? Assets.get('arrowUpHollow') : Assets.get('arrowUp');
            break;
        case Direction.Right:
            texture = hollow ? Assets.get('arrowRightHollow') : Assets.get('arrowRight');
            break;
        case Direction.Down:
            texture = hollow ? Assets.get('arrowDownHollow') : Assets.get('arrowDown');
            break;
        case Direction.Left:
            texture = hollow ? Assets.get('arrowLeftHollow') : Assets.get('arrowLeft');
            break;
    }

    let arrow = new Sprite(texture);
    arrow.scale = 0.2;
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
