import { Assets, Sprite, Texture } from "pixi.js";
import { Direction } from "./Direction";
import type { Note } from "./Signature";


export class Arrow {
    sprite: Sprite
    beat: number
    subbeat: number
    direction: Direction

    constructor({beat, subbeat, direction}: Note) {
        this.beat = beat
        this.subbeat = subbeat
        this.direction = direction
        this.sprite = Arrow.createArrowSprite(direction)    
    }


    destruct() {
        this.sprite.parent?.removeChild(this.sprite);
        this.sprite.destroy();
    }


    toString(): string {
        return `Arrow(${this.beat}, ${this.subbeat}, ${this.direction})`
    }

    static createArrowSprite(arrowDirection: Direction, hollow = false): Sprite {
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

        let sprite = new Sprite(texture);
        sprite.label = `Arrow(${Direction[arrowDirection]})`;
        sprite.scale = 0.2;
        sprite.anchor.set(0.5);
        sprite.cullable = true;
        return sprite;
    }

}
